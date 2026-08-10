import { fetchJson } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// Bing 适配器：使用 Bing Web Search v7 官方 API，需 BING_API_KEY
export const bingAdapter: SourceAdapter = {
  source: 'bing',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const apiKey = process.env.BING_API_KEY
    if (!apiKey) {
      console.warn('[bing] 缺少 BING_API_KEY，跳过')
      return []
    }

    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${query}&count=${limit}`

    try {
      const data = await fetchJson<any>(url, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      })

      const results: any[] = data?.webPages?.value ?? []
      return results.map((r) => ({
        title: r.name ?? 'Untitled',
        content: r.snippet ?? '',
        url: r.url,
        source: 'bing',
        publishedAt: r.datePublished ? new Date(r.datePublished) : undefined,
      }))
    } catch (err) {
      console.error('[bing] 抓取失败:', (err as Error).message)
      return []
    }
  },
}
