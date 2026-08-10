import { Router, Request, Response } from 'express'
import { runCollect } from '../services/collectService.js'

export const collectRouter = Router()

/**
 * POST /api/collect/run
 * 手动触发采集，支持传 keyword 指定单个关键词调试
 * body: { keyword?: string }
 */
collectRouter.post('/run', async (req: Request, res: Response) => {
  try {
    const keyword = typeof req.body?.keyword === 'string' ? req.body.keyword : undefined
    const result = await runCollect({ keywordText: keyword })
    res.json({ code: 200, message: 'Collect completed', result })
  } catch (error) {
    console.error('Error running collect:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})
