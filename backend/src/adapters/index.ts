import type { SourceAdapter } from './types.js'
import { twitterAdapter } from './twitterAdapter.js'
import { weiboAdapter } from './weiboAdapter.js'
import { bilibiliAdapter } from './bilibiliAdapter.js'
import { hackernewsAdapter } from './hackernewsAdapter.js'
import { sogouAdapter } from './sogouAdapter.js'
import { bingAdapter } from './bingAdapter.js'
import { googleAdapter } from './googleAdapter.js'
import { duckduckgoAdapter } from './duckduckgoAdapter.js'

// 注册项：适配器实例 + 优先级（数字越小越高）+ 单源配额上限
export interface AdapterEntry {
  adapter: SourceAdapter
  priority: number // 1 为最高
  limit: number // 该源单次抓取的最大条数
}

// 严格按规格表配置：Twitter 15，其余 10
export const adapterRegistry: AdapterEntry[] = [
  { adapter: twitterAdapter, priority: 1, limit: 15 },
  { adapter: weiboAdapter, priority: 2, limit: 10 },
  { adapter: bilibiliAdapter, priority: 3, limit: 10 },
  { adapter: hackernewsAdapter, priority: 4, limit: 10 },
  { adapter: sogouAdapter, priority: 5, limit: 10 },
  { adapter: bingAdapter, priority: 6, limit: 10 },
  { adapter: googleAdapter, priority: 7, limit: 10 },
  { adapter: duckduckgoAdapter, priority: 8, limit: 10 },
]

export type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'
