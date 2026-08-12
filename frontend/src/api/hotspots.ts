import request from './request'

// 热点（与后端 Hotspot 模型对应）
export interface Hotspot {
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
  publishedAt: string | null
  createdAt: string
  keywordId: string | null
  keyword: { id: string; text: string } | null
}

export interface GetHotspotsParams {
  page?: number
  limit?: number
  source?: string
  importance?: string
  keywordId?: string
  isReal?: boolean
  timeRange?: string
  timeFrom?: string
  timeTo?: string
  sortBy?: 'publishedAt' | 'relevance' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface HotspotStats {
  todayNew: number
  urgentCount: number
  highCount: number
}

export interface GetHotspotsResponse {
  items: Hotspot[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats: HotspotStats
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

export interface CollectRunResponse {
  code: number
  message: string
  result: CollectResult
}

// 获取热点列表
export const getHotspots = (params?: GetHotspotsParams) =>
  request.get('/hotspots', { params }) as unknown as Promise<GetHotspotsResponse>

// 立即触发采集（长耗时，使用 10 分钟超时）
export const runCollect = (keyword?: string) =>
  request.post('/collect/run', { keyword }, { timeout: 10 * 60 * 1000 }) as unknown as Promise<CollectRunResponse>
