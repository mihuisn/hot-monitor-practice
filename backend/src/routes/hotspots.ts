import { Router, Request, Response } from 'express'
import { getHotspots, type GetHotspotsQuery } from '../services/hotspotService.js'

export const hotspotRouter = Router()

/**
 * GET /api/hotspots
 * 获取热点列表，支持分页和过滤
 *
 * Query 参数：
 * - page: 页码，默认 1
 * - limit: 每页数量，默认 20，最大 100
 * - source: 按来源过滤（twitter/weibo/bilibili/hackernews/sogou/bing/google/duckduckgo）
 * - importance: 重要性过滤（low/medium/high/urgent）
 * - keywordId: 关键词 ID 过滤（用于按用户打开的监控词查询）
 * - isReal: 是否真实热点（'true' / 'false'）
 * - timeRange: 时间预设（1h/24h/7d/30d），快捷设置 timeFrom
 * - timeFrom / timeTo: ISO 8601 时间区间
 * - sortBy: 排序字段（publishedAt/relevance/createdAt），默认 createdAt
 * - sortOrder: asc / desc，默认 desc
 */
hotspotRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      source,
      importance,
      keywordId,
      isReal,
      timeRange,
      timeFrom,
      timeTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    // 解析分页参数
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20))

    // isReal: 只有传了 'true' 或 'false' 才生效
    let isRealVal: boolean | undefined
    if (isReal === 'true') isRealVal = true
    else if (isReal === 'false') isRealVal = false

    // 排序参数，给默认值
    const validSortBy = ['publishedAt', 'relevance', 'createdAt']
    const sortByVal = validSortBy.includes(sortBy as string)
      ? (sortBy as GetHotspotsQuery['sortBy'])
      : 'createdAt'
    const sortOrderVal = sortOrder === 'asc' ? 'asc' : 'desc'

    // 解析时间区间
    // timeRange 预设优先转换为 timeFrom；若同时显式传了 timeFrom，以显式值为准
    let from: Date | undefined
    let to: Date | undefined

    if (typeof timeFrom === 'string') {
      const d = new Date(timeFrom)
      if (!isNaN(d.getTime())) from = d
    }
    if (typeof timeTo === 'string') {
      const d = new Date(timeTo)
      if (!isNaN(d.getTime())) to = d
    }

    // timeRange 预设：1h / 24h / 7d / 30d，计算 timeFrom = now - duration
    if (!from && typeof timeRange === 'string') {
      const rangeFrom = parseTimeRange(timeRange)
      if (rangeFrom) from = rangeFrom
    }

    const query: GetHotspotsQuery = {
      page: pageNum,
      limit: limitNum,
      source: typeof source === 'string' ? source : undefined,
      keywordId: typeof keywordId === 'string' ? keywordId : undefined,
      isReal: isRealVal,
      importance: typeof importance === 'string' ? importance : undefined,
      timeFrom: from,
      timeTo: to,
      sortBy: sortByVal,
      sortOrder: sortOrderVal,
    }

    const result = await getHotspots(query)
    res.json(result)
  } catch (error) {
    console.error('Error fetching hotspots:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})

/**
 * 将 timeRange 预设转换为起始 Date
 * 支持：1h / 24h / 7d / 30d（不区分大小写）
 * 不识别的值返回 null
 */
function parseTimeRange(range: string): Date | null {
  const m = range.trim().toLowerCase().match(/^(\d+)([hd])$/)
  if (!m) return null
  const num = parseInt(m[1], 10)
  const unit = m[2]
  const ms = unit === 'h' ? num * 60 * 60 * 1000 : num * 24 * 60 * 60 * 1000
  return new Date(Date.now() - ms)
}
