import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

// Zod validation schemas
export const CreateKeywordSchema = z.object({
  text: z.string().min(1, '关键词文本不能为空'),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const GetKeywordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'text']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateKeywordInput = z.infer<typeof CreateKeywordSchema>
export type GetKeywordsQuery = z.infer<typeof GetKeywordsQuerySchema>

interface KeywordWithCount {
  id: string
  text: string
  category: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    hotspots: number
  }
}

interface GetKeywordsResponse {
  items: KeywordWithCount[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 获取关键词列表，支持分页、搜索、过滤和排序
 */
export async function getKeywords(query: GetKeywordsQuery): Promise<GetKeywordsResponse> {
  const { page, pageSize, search, category, isActive, sortBy, sortOrder } = query

  // 构建查询条件
  const where: any = {}

  if (search) {
    where.text = {
      contains: search,
    }
  }

  if (category) {
    where.category = category
  }

  if (isActive !== undefined) {
    where.isActive = isActive
  }

  // 获取总数
  const total = await prisma.keyword.count({ where })

  // 获取分页数据
  const items = await prisma.keyword.findMany({
    where,
    select: {
      id: true,
      text: true,
      category: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          hotspots: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items: items as KeywordWithCount[],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * 创建新的关键词
 */
export async function createKeyword(input: CreateKeywordInput) {
  const keyword = await prisma.keyword.create({
    data: {
      text: input.text,
      category: input.category,
      isActive: input.isActive,
    },
  })

  return keyword
}

/**
 * 检查关键词文本是否已存在
 */
export async function keywordExists(text: string): Promise<boolean> {
  const keyword = await prisma.keyword.findUnique({
    where: { text },
  })
  return !!keyword
}
