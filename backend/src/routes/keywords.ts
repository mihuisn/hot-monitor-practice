import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import {
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  keywordExists,
  type GetKeywordsQuery,
} from '../services/keywordService.js'

export const keywordRouter = Router()

/**
 * GET /api/keywords
 * 获取关键词列表，返回每个关键词关联的热点总数
 */
keywordRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = req.query

    // 解析分页参数
    const page = q.page ? Math.max(1, parseInt(q.page as string, 10) || 1) : 1
    const pageSize = q.pageSize ? Math.min(100, Math.max(1, parseInt(q.pageSize as string, 10) || 20)) : 20

    // isActive: 只有传了 'true' 或 'false' 才生效
    let isActive: boolean | undefined
    if (q.isActive === 'true') isActive = true
    else if (q.isActive === 'false') isActive = false

    // 排序参数，给默认值
    const validSortBy = ['createdAt', 'updatedAt', 'text']
    const sortBy = validSortBy.includes(q.sortBy as string) ? q.sortBy as GetKeywordsQuery['sortBy'] : 'createdAt'
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc'

    const query: GetKeywordsQuery = {
      page,
      pageSize,
      search: typeof q.search === 'string' ? q.search : undefined,
      category: typeof q.category === 'string' ? q.category : undefined,
      isActive,
      sortBy,
      sortOrder,
    }

    const result = await getKeywords(query)
    res.json(result)
  } catch (error) {
    console.error('Error fetching keywords:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})

/**
 * POST /api/keywords
 * 创建一个新的关键词
 */
keywordRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { text, category, isActive } = req.body || {}

    // 简单校验
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ code: 400, message: '关键词文本不能为空' })
    }

    // 检查是否已存在
    const exists = await keywordExists(text)
    if (exists) {
      return res.status(409).json({ code: 409, message: '关键词已存在' })
    }

    const keyword = await createKeyword({
      text,
      category: typeof category === 'string' ? category : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    })

    res.status(201).json(keyword)
  } catch (error) {
    console.error('Error creating keyword:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})

/**
 * PATCH /api/keywords/:id
 * 更新关键词（如切换启用状态、修改分类）
 */
keywordRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { text, category, isActive } = req.body || {}

    // 构建更新对象，只更新传了的字段
    const data: any = {}

    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ code: 400, message: '关键词文本不能为空' })
      }
      data.text = text
    }

    if (category !== undefined) {
      data.category = category === null ? null : String(category)
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ code: 400, message: 'isActive 必须是布尔值' })
      }
      data.isActive = isActive
    }

    const keyword = await updateKeyword(req.params.id as string, data)
    res.json(keyword)
  } catch (error) {
    // P2025: 未找到记录
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ code: 404, message: '关键词不存在' })
    }
    console.error('Error updating keyword:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})

/**
 * DELETE /api/keywords/:id
 * 删除关键词
 */
keywordRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteKeyword(req.params.id as string)
    res.status(204).send()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ code: 404, message: '关键词不存在' })
    }
    console.error('Error deleting keyword:', error)
    res.status(500).json({ code: 500, message: 'Internal Server Error' })
  }
})
