import request from './request'

// 关键词（与后端 Keyword 模型对应）
export interface Keyword {
  id: string
  text: string
  category: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { hotspots: number }
}

export interface GetKeywordsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  isActive?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'text'
  sortOrder?: 'asc' | 'desc'
}

export interface GetKeywordsResponse {
  items: Keyword[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateKeywordInput {
  text: string
  category?: string
  isActive?: boolean
}

export type UpdateKeywordInput = Partial<Pick<Keyword, 'text' | 'category' | 'isActive'>>

// 获取关键词列表
export const getKeywords = (params?: GetKeywordsParams) =>
  request.get('/keywords', { params }) as unknown as Promise<GetKeywordsResponse>

// 创建关键词
export const createKeyword = (data: CreateKeywordInput) =>
  request.post('/keywords', data) as unknown as Promise<Keyword>

// 更新关键词
export const updateKeyword = (id: string, data: UpdateKeywordInput) =>
  request.patch(`/keywords/${id}`, data) as unknown as Promise<Keyword>

// 删除关键词
export const deleteKeyword = (id: string) =>
  request.delete(`/keywords/${id}`) as unknown as Promise<void>
