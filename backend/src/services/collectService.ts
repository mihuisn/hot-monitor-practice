import { prisma } from '../lib/prisma.js'
import { adapterRegistry } from '../adapters/index.js'
import type { CandidateTopic } from '../adapters/types.js'
import { analyzeContent, type AiAnalysis } from './aiService.js'
import { notifyNewHotspot } from './notificationService.js'

// ---- 采集编排：关键词 → 多源并行抓取 → 清洗 → AI 过滤 → 持久化 → 通知 ----

const FRESHNESS_HOURS = 7 * 24 // 7天=168小时，超过则丢弃
const KEYWORD_SLEEP_MS = 2000 // 单关键词处理完毕后强制 sleep，防限流

export interface CollectOptions {
  keywordText?: string // 指定单个关键词调试；不传则处理全部 active
}

export interface CollectResult {
  keywordsProcessed: number
  candidatesTotal: number
  afterDedup: number
  afterFreshness: number
  afterAiFilter: number
  saved: number
  errors: number
}

/**
 * 采集主入口
 */
export async function runCollect(options: CollectOptions = {}): Promise<CollectResult> {
  // 1. 读取所有启用的关键词
  const where = options.keywordText
    ? { isActive: true, text: options.keywordText }
    : { isActive: true }
  const keywords = await prisma.keyword.findMany({ where })

  const result: CollectResult = {
    keywordsProcessed: 0,
    candidatesTotal: 0,
    afterDedup: 0,
    afterFreshness: 0,
    afterAiFilter: 0,
    saved: 0,
    errors: 0,
  }

  console.log(`[collect] 开始采集，共 ${keywords.length} 个关键词`)

  for (const kw of keywords) {
    try {
      const saved = await processKeyword(kw.id, kw.text, result)
      result.saved += saved
    } catch (err) {
      console.error(`[collect] 关键词 "${kw.text}" 处理异常:`, (err as Error).message)
      result.errors++
    }
    result.keywordsProcessed++

    // 单关键词处理完毕后强制 sleep，防止 API 限流
    if (result.keywordsProcessed < keywords.length) {
      await sleep(KEYWORD_SLEEP_MS)
    }
  }

  console.log('[collect] 采集完成:', result)
  return result
}

/**
 * 处理单个关键词的完整流程
 */
async function processKeyword(
  keywordId: string,
  keywordText: string,
  result: CollectResult,
): Promise<number> {
  // 2. 多源并行抓取
  const fetchResults = await Promise.all(
    adapterRegistry.map(async ({ adapter, limit }) => {
      try {
        return await adapter.fetch({ keyword: { id: keywordId, text: keywordText }, limit })
      } catch (err) {
        console.error(`[${adapter.source}] 抓取异常:`, (err as Error).message)
        return [] as CandidateTopic[]
      }
    }),
  )

  const all: CandidateTopic[] = fetchResults.flat()
  result.candidatesTotal += all.length

  // 3. 数据清洗与预处理
  // 3.1 去重：基于 url + source 全局去重
  const deduped = deduplicateResults(all)
  result.afterDedup += deduped.length

  // 3.2 新鲜度过滤：丢弃发布时间超过 7 天的内容；无时间戳的保留
  const fresh = deduped.filter((c) => isFresh(c))
  result.afterFreshness += fresh.length

  // 3.3 优先级排序：严格按注册表优先级（数字越小越靠前）
  const sorted = sortByPriority(fresh)

  // 4. AI 智能分析与过滤
  let saved = 0
  for (const candidate of sorted) {
    try {
      const analysis = await analyzeContent(candidate, keywordText)
      result.afterAiFilter++

      // 过滤规则（按顺序执行）
      if (!analysis.isReal) continue
      if (analysis.relevance < 50) continue
      if (!analysis.keywordMentioned && analysis.relevance < 65) continue

      // 5. 通过过滤 → 持久化 + 通知
      const hotspot = await persistHotspot(candidate, analysis, keywordId)
      if (hotspot) {
        saved++
        await notifyNewHotspot({
          hotspot,
          keywordText,
          importance: analysis.importance,
          summary: analysis.summary || hotspot.summary,
        })
      }
    } catch (err) {
      // 单条内容处理失败不应中断整个关键词循环
      console.error(
        `[collect] 内容处理失败 [${candidate.source}]:`,
        (err as Error).message,
      )
      result.errors++
    }
  }

  return saved
}

// ---- 数据清洗工具 ----

/**
 * 基于 url + source 进行全局去重
 */
export function deduplicateResults(items: CandidateTopic[]): CandidateTopic[] {
  const seen = new Set<string>()
  const out: CandidateTopic[] = []
  for (const it of items) {
    if (!it.url) continue
    const key = `${it.url}::${it.source}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

/**
 * 新鲜度过滤：发布时间超过 7 天(168小时)的丢弃；无时间戳的保留
 */
export function isFresh(c: CandidateTopic): boolean {
  if (!c.publishedAt) return true
  const ageHours = (Date.now() - c.publishedAt.getTime()) / (1000 * 60 * 60)
  return ageHours <= FRESHNESS_HOURS
}

/**
 * 按数据源优先级排序（priority 数字越小越靠前）
 */
export function sortByPriority(items: CandidateTopic[]): CandidateTopic[] {
  const priorityMap = new Map<string, number>()
  for (const entry of adapterRegistry) {
    priorityMap.set(entry.adapter.source, entry.priority)
  }
  const getPriority = (source: string) => priorityMap.get(source) ?? 99
  return [...items].sort((a, b) => getPriority(a.source) - getPriority(b.source))
}

// ---- 持久化 ----

/**
 * 写入 Hotspot 表，写入前检查 url + source 是否已存在（防重）
 * 已存在则返回 null，不重复入库/通知
 */
async function persistHotspot(
  candidate: CandidateTopic,
  analysis: AiAnalysis,
  keywordId: string,
) {
  // 防重检查
  const exists = await prisma.hotspot.findFirst({
    where: { url: candidate.url, source: candidate.source },
    select: { id: true },
  })
  if (exists) return null

  const hotspot = await prisma.hotspot.create({
    data: {
      title: candidate.title,
      content: candidate.content,
      url: candidate.url,
      source: candidate.source,
      sourceId: candidate.sourceId ?? null,
      isReal: analysis.isReal,
      relevance: analysis.relevance,
      relevanceReason: analysis.relevanceReason ?? null,
      keywordMentioned: analysis.keywordMentioned,
      importance: analysis.importance,
      summary: analysis.summary || null,
      viewCount: candidate.viewCount ?? null,
      likeCount: candidate.likeCount ?? null,
      retweetCount: candidate.retweetCount ?? null,
      replyCount: candidate.replyCount ?? null,
      commentCount: candidate.commentCount ?? null,
      quoteCount: candidate.quoteCount ?? null,
      danmakuCount: candidate.danmakuCount ?? null,
      authorName: candidate.authorName ?? null,
      authorUsername: candidate.authorUsername ?? null,
      authorAvatar: candidate.authorAvatar ?? null,
      authorFollowers: candidate.authorFollowers ?? null,
      authorVerified: candidate.authorVerified ?? null,
      publishedAt: candidate.publishedAt ?? null,
      keywordId,
    },
  })

  return hotspot
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
