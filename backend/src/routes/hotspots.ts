import { Router, Request, Response } from 'express'
import { getHotspots, type GetHotspotsQuery } from '../services/hotspotService.js'

export const hotspotRouter = Router()

/**
 * GET /api/hotspots
 * 获取热点列表，支持分页和过滤
 */
hotspotRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = req.query

    // 解析分页参数
    const page = q.page ? Math.max(1, parseInt(q.page as string, 10) || 1) : 1
    const pageSize = q.pageSize
      ? Math.min(100, Math.max(1, parseInt(q.pageSize as string, 10) || 20))
      : 20

    // isReal: 只有传了 'true' 或 'false' 才生效
    let isReal: boolean | undefined
    if (q.isReal === 'true') isReal = true
    else if (q.isReal === 'false') isReal = false

    // 排序参数，给默认值
    const validSortBy = ['publishedAt', 'relevance', 'createdAt']
    const sortBy = validSortBy.includes(q.sortBy as string)
      ? (q.sortBy as GetHotspotsQuery['sortBy'])
      : 'createdAt'
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc'

    // 解析时间区间参数
    let startAt: Date | undefined
    let endAt: Date | undefined
    if (typeof q.startAt === 'string') {
      const d = new Date(q.startAt)
      if (!isNaN(d.getTime())) startAt = d
    }
    if (typeof q.endAt === 'string') {
      const d = new Date(q.endAt)
      if (!isNaN(d.getTime())) endAt = d
    }

    const query: GetHotspotsQuery = {
      page,
      pageSize,
      source: typeof q.source === 'string' ? q.source : undefined,
      keyword: typeof q.keyword === 'string' ? q.keyword : undefined,
      keywordId: typeof q.keywordId === 'string' ? q.keywordId : undefined,
      isReal,
      importance: typeof q.importance === 'string' ? q.importance : undefined,
      authorUsername: typeof q.authorUsername === 'string' ? q.authorUsername : undefined,
      startAt,
      endAt,
      search: typeof q.search === 'string' ? q.search : undefined,
      sortBy,
      sortOrder,
    }

    const result = await getHotspots(query)
    res.json(result)
  } catch (error) {
    console.error('Error fetching hotspots:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})
