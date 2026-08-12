import { prisma } from '../lib/prisma.js'

// ---- 类型定义 ----

// 查询热点列表时的入参类型，支持分页/过滤/排序
export interface GetHotspotsQuery {
  page: number
  limit: number
  source?: string
  keyword?: string
  keywordId?: string
  isReal?: boolean
  importance?: string
  authorUsername?: string
  timeFrom?: Date
  timeTo?: Date
  search?: string
  sortBy: 'publishedAt' | 'relevance' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

// 列表查询的返回结构
interface HotspotItem {
  id: string
  title: string
  content: string
  url: string
  source: string
  sourceId: string | null
  isReal: boolean
  relevance: number
  relevanceReason: string | null
  keywordMentioned: boolean | null
  importance: string
  summary: string | null
  viewCount: number | null
  likeCount: number | null
  retweetCount: number | null
  replyCount: number | null
  commentCount: number | null
  quoteCount: number | null
  danmakuCount: number | null
  authorName: string | null
  authorUsername: string | null
  authorAvatar: string | null
  authorFollowers: number | null
  authorVerified: boolean | null
  publishedAt: Date | null
  createdAt: Date
  keywordId: string | null
  keyword: { id: string; text: string } | null
}

interface HotspotStats {
  todayNew: number
  urgentCount: number
  highCount: number
}

interface GetHotspotsResponse {
  items: HotspotItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats: HotspotStats
}

/**
 * 获取热点列表，支持分页、过滤、搜索和排序
 */
export async function getHotspots(query: GetHotspotsQuery): Promise<GetHotspotsResponse> {
  const {
    page,
    limit,
    source,
    keyword,
    keywordId,
    isReal,
    importance,
    authorUsername,
    timeFrom,
    timeTo,
    search,
    sortBy,
    sortOrder,
  } = query

  // 构建查询条件
  const where: any = {}

  if (source) {
    where.source = source
  }

  // 通过关联的 keyword.text 过滤
  if (keyword) {
    where.keyword = { text: keyword }
  }

  if (keywordId) {
    where.keywordId = keywordId
  }

  // 只有显式传了 true/false 才过滤，避免 undefined 被错误转成 false
  if (isReal !== undefined) {
    where.isReal = isReal
  }

  if (importance) {
    where.importance = importance
  }

  if (authorUsername) {
    where.authorUsername = authorUsername
  }

  // 发布时间区间过滤
  if (timeFrom || timeTo) {
    where.publishedAt = {}
    if (timeFrom) where.publishedAt.gte = timeFrom
    if (timeTo) where.publishedAt.lte = timeTo
  }

  // 标题或内容全文搜索（SQLite 使用 contains 模糊匹配）
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const total = await prisma.hotspot.count({ where })

  const items = await prisma.hotspot.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      source: true,
      sourceId: true,
      isReal: true,
      relevance: true,
      relevanceReason: true,
      keywordMentioned: true,
      importance: true,
      summary: true,
      viewCount: true,
      likeCount: true,
      retweetCount: true,
      replyCount: true,
      commentCount: true,
      quoteCount: true,
      danmakuCount: true,
      authorName: true,
      authorUsername: true,
      authorAvatar: true,
      authorFollowers: true,
      authorVerified: true,
      publishedAt: true,
      createdAt: true,
      keywordId: true,
      keyword: {
        select: {
          id: true,
          text: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  })

  // 并行查询聚合统计（今日新增 / 紧急 / 高重要性）
  // 复用同一个 where 条件，确保统计口径与列表一致
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [todayNew, urgentCount, highCount] = await Promise.all([
    prisma.hotspot.count({ where: { ...where, createdAt: { gte: todayStart } } }),
    prisma.hotspot.count({ where: { ...where, importance: 'urgent' } }),
    prisma.hotspot.count({ where: { ...where, importance: 'high' } }),
  ])

  return {
    items: items as HotspotItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: { todayNew, urgentCount, highCount },
  }
}
