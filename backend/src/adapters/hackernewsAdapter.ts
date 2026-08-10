import { fetchJson, stripHtml } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// Hacker News 适配器：使用官方 Algolia 搜索 API，无需 Key
export const hackernewsAdapter: SourceAdapter = {
  source: 'hackernews',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=${limit}`

    try {
      const data = await fetchJson<any>(url)
      const hits: any[] = data?.hits ?? []

      return hits.map((h) => {
        const title = stripHtml(h.title ?? '', 120) || 'Untitled Story'
        const content = stripHtml(h.story_text ?? '', 500) || title
        const itemUrl =
          h.url ||
          (h.objectID ? `https://news.ycombinator.com/item?id=${h.objectID}` : '')
        return {
          title,
          content,
          url: itemUrl,
          source: 'hackernews',
          sourceId: h.objectID ?? undefined,
          publishedAt: h.created_at ? new Date(h.created_at) : undefined,
          viewCount: toNum(h.points),
          commentCount: toNum(h.num_comments),
          authorName: h.author ?? undefined,
        }
      })
    } catch (err) {
      console.error('[hackernews] 抓取失败:', (err as Error).message)
      return []
    }
  },
}

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
