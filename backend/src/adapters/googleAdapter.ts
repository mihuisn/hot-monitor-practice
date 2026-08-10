import { fetchJson } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// Google 适配器：使用 Custom Search JSON API，需 GOOGLE_API_KEY + GOOGLE_CSE_ID
export const googleAdapter: SourceAdapter = {
  source: 'google',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID
    if (!apiKey || !cseId) {
      console.warn('[google] 缺少 GOOGLE_API_KEY 或 GOOGLE_CSE_ID，跳过')
      return []
    }

    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    // num 最大 10
    const num = Math.min(limit, 10)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&num=${num}`

    try {
      const data = await fetchJson<any>(url)
      const items: any[] = data?.items ?? []
      return items.map((it) => ({
        title: it.title ?? 'Untitled',
        content: it.snippet ?? '',
        url: it.link,
        source: 'google',
      }))
    } catch (err) {
      console.error('[google] 抓取失败:', (err as Error).message)
      return []
    }
  },
}
