import { fetchJson, stripHtml, BROWSER_UA } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// 微博适配器：使用 m.weibo.cn 移动端接口（返回 JSON），可携带 Cookie 提升稳定性
export const weiboAdapter: SourceAdapter = {
  source: 'weibo',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const { keyword, limit } = input
    const q = encodeURIComponent(keyword.text)
    const url = `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D1%26q%3D${q}&page=1`

    const headers: Record<string, string> = {
      'User-Agent': BROWSER_UA,
      'Accept': 'application/json',
      'Referer': 'https://m.weibo.cn/',
    }
    const cookie = process.env.WEIBO_COOKIE
    if (cookie) headers['Cookie'] = cookie

    try {
      const data = await fetchJson<any>(url, { headers })
      const cards: any[] = data?.data?.cards ?? []

      const items: CandidateTopic[] = []
      for (const card of cards) {
        if (items.length >= limit) break
        // card_type=9 为微博正文卡片
        if (card.card_type !== 9) continue
        const mb = card.mblog
        if (!mb) continue

        const text = stripHtml(mb.text ?? '', 500)
        const title = text.slice(0, 60) || 'Untitled Weibo'
        const user = mb.user ?? {}

        items.push({
          title,
          content: text,
          url: mb.id ? `https://m.weibo.cn/detail/${mb.id}` : '',
          source: 'weibo',
          sourceId: mb.id ? String(mb.id) : undefined,
          publishedAt: mb.created_at ? parseWeiboDate(mb.created_at) : undefined,
          likeCount: toNum(mb.attitudes_count),
          retweetCount: toNum(mb.reposts_count),
          replyCount: toNum(mb.comments_count),
          commentCount: toNum(mb.comments_count),
          authorName: user.screen_name ?? undefined,
          authorUsername: user.id ? String(user.id) : undefined,
          authorAvatar: user.profile_image_url ?? undefined,
          authorFollowers: toNum(user.followers_count),
          authorVerified:
            typeof user.verified === 'boolean' ? user.verified : undefined,
        })
      }
      // 过滤掉无 url 的条目
      return items.filter((i) => i.url)
    } catch (err) {
      console.error('[weibo] 抓取失败:', (err as Error).message)
      return []
    }
  },
}

// 微博时间格式："Sun Aug 10 10:00:00 +0800 2025"
function parseWeiboDate(s: string): Date | undefined {
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d
}

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
