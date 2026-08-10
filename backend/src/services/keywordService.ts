import { prisma } from '../lib/prisma.js'

// ---- 类型定义 ----

// 创建关键词时的入参类型：
export interface CreateKeywordInput {
  text: string
  category?: string
  isActive: boolean
}

// 查询关键词列表时的入参类型，支持分页/搜索/过滤/排序
export interface GetKeywordsQuery {
  page: number
  pageSize: number
  search?: string
  category?: string
  isActive?: boolean
  sortBy: 'createdAt' | 'updatedAt' | 'text'
  sortOrder: 'asc' | 'desc'
}

// 更新关键词时的入参类型，所有字段都是可选的， category 允许传 null 来清空分类。
export interface UpdateKeywordInput {
  text?: string
  category?: string | null
  isActive?: boolean
}

// ---- 业务逻辑 ----
// 单个关键词的返回结构，额外带 _count.hotspots 表示该关键词关联的热点数量。
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

// 列表查询的返回结构
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

  //search 用 contains 做模糊匹配
  if (search) {
    where.text = { contains: search }
  }

  if (category) {
    where.category = category
  }

  if (isActive !== undefined) {
    where.isActive = isActive
  }

  const total = await prisma.keyword.count({ where })

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

  return {
    items: items as KeywordWithCount[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * 创建新的关键词
 */
// createKeyword input 就是 Routes 层传过来的那个对象 { text: '...', category: '...', isActive: true }
export async function createKeyword(input: CreateKeywordInput) {
  const keyword = await prisma.keyword.create({
    data: {
      text: input.text,
      category: input.category,
      isActive: input.isActive,
    },
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

/**
 * 更新关键词
 */
export async function updateKeyword(id: string, input: UpdateKeywordInput) {
  return prisma.keyword.update({
    where: { id },
    data: input,
  })
}

/**
 * 删除关键词（关联的热点 keywordId 会被置空，不会级联删除）
 */
export async function deleteKeyword(id: string) {
  return prisma.keyword.delete({
    where: { id },
  })
}
