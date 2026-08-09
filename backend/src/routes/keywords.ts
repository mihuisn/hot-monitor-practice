import { Router, Request, Response } from 'express'
import { z } from 'zod'
import {
  getKeywords,
  createKeyword,
  keywordExists,
  CreateKeywordSchema,
  GetKeywordsQuerySchema,
  type GetKeywordsQuery,
} from '../services/keywordService.js'

export const keywordRouter = Router()

/**
 * GET /api/keywords
 * 获取关键词列表，返回每个关键词关联的热点总数
 */
keywordRouter.get('/', async (req: Request, res: Response) => {
  try {
    // 验证和解析查询参数
    const query = GetKeywordsQuerySchema.parse(req.query)

    // 获取关键词列表
    const result = await getKeywords(query)

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        errors: error.issues,
      })
    }

    console.error('Error fetching keywords:', error)
    res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
    })
  }
})

/**
 * POST /api/keywords
 * 创建一个新的关键词
 */
keywordRouter.post('/', async (req: Request, res: Response) => {
  try {
    // 验证请求体
    const input = CreateKeywordSchema.parse(req.body)

    // 检查关键词是否已存在
    const exists = await keywordExists(input.text)
    if (exists) {
      return res.status(409).json({
        code: 409,
        message: '关键词已存在',
      })
    }

    // 创建关键词
    const keyword = await createKeyword(input)

    res.status(201).json(keyword)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        errors: error.issues,
      })
    }

    console.error('Error creating keyword:', error)
    res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
    })
  }
})
