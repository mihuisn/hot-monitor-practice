// ---- 数据源适配器统一类型 ----

// 标准化候选内容：所有数据源最终都转换成此结构，再交给 collectService 处理
export interface CandidateTopic {
  title: string
  content: string
  url: string
  source: string // twitter | weibo | bilibili | hackernews | sogou | bing | google | duckduckgo
  sourceId?: string
  publishedAt?: Date
  viewCount?: number
  likeCount?: number
  retweetCount?: number
  replyCount?: number
  commentCount?: number
  quoteCount?: number
  danmakuCount?: number // B站弹幕数
  authorName?: string
  authorUsername?: string
  authorAvatar?: string
  authorFollowers?: number
  authorVerified?: boolean
}

// 适配器入参
export interface FetchInput {
  keyword: { id: string; text: string }
  limit: number // 该源的配额上限
}

// 所有数据源适配器需实现的统一接口
export interface SourceAdapter {
  source: string
  fetch(input: FetchInput): Promise<CandidateTopic[]>
}
