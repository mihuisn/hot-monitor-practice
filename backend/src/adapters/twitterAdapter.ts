import { fetchJson } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// Twitter 适配器：基于 twitterapi.io 的 advanced_search 接口，使用 X-API-Key 认证
export const twitterAdapter: SourceAdapter = {
  source: 'twitter',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const apiKey = process.env.TWITTER_API_KEY
    if (!apiKey) {
      console.warn('[twitter] 缺少 TWITTER_API_KEY，跳过')
      return []
    }

    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${query}&queryType=Latest`

    try {
      const data = await fetchJson<any>(url, {
        headers: { 'X-API-Key': apiKey },
      })

      const tweets: any[] = data?.tweets ?? []
      return tweets.slice(0, limit).map((t) => {
        const author = t.author ?? {}
        return {
          title: (t.text ?? '').slice(0, 80) || 'Untitled Tweet',
          content: t.text ?? '',
          url: t.url ?? `https://twitter.com/i/web/status/${t.id}`,
          source: 'twitter',
          sourceId: t.id ?? undefined,
          publishedAt: t.createdAt ? new Date(t.createdAt) : undefined,
          viewCount: toNum(t.viewCount),
          likeCount: toNum(t.likeCount),
          retweetCount: toNum(t.retweetCount),
          replyCount: toNum(t.replyCount),
          quoteCount: toNum(t.quoteCount),
          authorName: author.name ?? undefined,
          authorUsername: author.userName ?? undefined,
          authorAvatar: author.profilePicture ?? undefined,
          authorFollowers: toNum(author.followers),
          authorVerified: typeof author.verified === 'boolean' ? author.verified : undefined,
        }
      })
    } catch (err) {
      console.error('[twitter] 抓取失败:', (err as Error).message)
      return []
    }
  },
}

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
