import { fetchJson } from '../adapters/http.js'
import type { CandidateTopic } from '../adapters/types.js'

// AI 分析返回结构
export interface AiAnalysis {
  isReal: boolean
  relevance: number // 0-100
  keywordMentioned: boolean
  importance: 'low' | 'medium' | 'high' | 'urgent'
  summary: string
  relevanceReason?: string
}

// OpenRouter 模型：默认使用 DeepSeek
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash'

/**
 * 对单条候选内容执行 AI 分析
 * - 判断是否真实/有效
 * - 评估与关键词的相关性 (0-100)
 * - 判断正文是否直接提及关键词
 * - 评定重要性 (low/medium/high/urgent)
 * - 生成摘要与判断理由
 *
 * 失败时返回一个保守的默认结果（isReal=false），由调用方丢弃。
 */
export async function analyzeContent(
  candidate: CandidateTopic,
  keywordText: string,
): Promise<AiAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('[ai] 缺少 OPENROUTER_API_KEY，跳过分析')
    // 无 Key 时默认放行但不做 AI 评分（保守标记为 medium）
    return {
      isReal: true,
      relevance: 60,
      keywordMentioned: candidate.content.toLowerCase().includes(keywordText.toLowerCase()),
      importance: 'medium',
      summary: candidate.content.slice(0, 120),
      relevanceReason: 'AI 未配置，使用默认评估',
    }
  }

  const prompt = buildPrompt(candidate, keywordText)

  try {
    const data = await fetchJson<any>(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL ?? 'http://localhost:5173',
        'X-OpenRouter-Title': 'Hot Monitor',
      },
      timeoutMs: 30000,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              '你是一个热点分析助手。请对内容进行真实性、相关性、重要性分析，并严格以 JSON 格式返回结果，不要包含任何额外说明或 markdown 代码块。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    const raw: string = data?.choices?.[0]?.message?.content ?? ''
    return parseAiResult(raw, candidate, keywordText)
  } catch (err) {
    console.error('[ai] 分析失败:', (err as Error).message)
    // 失败时保守丢弃
    return {
      isReal: false,
      relevance: 0,
      keywordMentioned: false,
      importance: 'low',
      summary: '',
      relevanceReason: `AI 调用失败: ${(err as Error).message}`,
    }
  }
}

function buildPrompt(c: CandidateTopic, keyword: string): string {
  const fields = [
    `关键词: ${keyword}`,
    `标题: ${c.title}`,
    `内容: ${c.content}`,
    `来源: ${c.source}`,
    `作者: ${c.authorName ?? '未知'}`,
    `发布时间: ${c.publishedAt?.toISOString() ?? '未知'}`,
  ].join('\n')

  return `请根据以下候选内容，判断其与监控关键词"${keyword}"的关系。严格返回如下 JSON 结构：
{
  "isReal": boolean,            // 是否为真实/有效内容（过滤垃圾、虚假、误导）
  "relevance": number,          // 0-100，与关键词的相关性评分
  "keywordMentioned": boolean,  // 正文是否直接提及关键词
  "importance": "low" | "medium" | "high" | "urgent",
  "summary": string,            // 内容摘要（中文，80字以内）
  "relevanceReason": string     // 相关性判断理由（可选）
}

候选内容：
${fields}`
}

function parseAiResult(
  raw: string,
  candidate: CandidateTopic,
  keywordText: string,
): AiAnalysis {
  // 兜底：若模型返回了 markdown 代码块，去掉外层包裹
  const cleaned = raw.replace(/```json|```/g, '').trim()
  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.warn('[ai] JSON 解析失败，使用默认值:', cleaned.slice(0, 200))
    return {
      isReal: false,
      relevance: 0,
      keywordMentioned: candidate.content
        .toLowerCase()
        .includes(keywordText.toLowerCase()),
      importance: 'low',
      summary: '',
      relevanceReason: 'AI 返回解析失败',
    }
  }

  const importance = ['low', 'medium', 'high', 'urgent'].includes(parsed.importance)
    ? parsed.importance
    : 'low'

  return {
    isReal: Boolean(parsed.isReal),
    relevance: clamp(Number(parsed.relevance) || 0, 0, 100),
    keywordMentioned: Boolean(parsed.keywordMentioned),
    importance: importance as AiAnalysis['importance'],
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    relevanceReason:
      typeof parsed.relevanceReason === 'string' ? parsed.relevanceReason : undefined,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
