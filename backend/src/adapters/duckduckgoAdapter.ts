import { fetchText, stripHtml, BROWSER_UA } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// DuckDuckGo 适配器：抓取 html.duckduckgo.com 结果页并解析（无需 Key）
export const duckduckgoAdapter: SourceAdapter = {
  source: 'duckduckgo',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://html.duckduckgo.com/html/?q=${query}`

    try {
      const html = await fetchText(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })

      const items: CandidateTopic[] = []
      // 每条结果块：<a class="result__a" href="...">title</a>，后跟 <a class="result__snippet">
      const blockRegex =
        /<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>)?/g
      let m: RegExpExecArray | null
      while ((m = blockRegex.exec(html)) && items.length < limit) {
        const rawHref = m[1]
        const title = stripHtml(m[2], 160)
        const snippet = stripHtml(m[3] ?? '', 500)
        if (!title || !rawHref) continue
        // DuckDuckGo 链接形如 //duckduckgo.com/l/?uddg=<encoded>
        const href = decodeDdgUrl(rawHref)
        if (!href) continue
        items.push({
          title,
          content: snippet || title,
          url: href,
          source: 'duckduckgo',
        })
      }
      return items
    } catch (err) {
      console.error('[duckduckgo] 抓取失败:', (err as Error).message)
      return []
    }
  },
}

function decodeDdgUrl(href: string): string | null {
  // 提取 uddg= 参数中的真实地址
  const m = href.match(/uddg=([^&]+)/)
  if (m) {
    try {
      return decodeURIComponent(m[1])
    } catch {
      return null
    }
  }
  return href.startsWith('http') ? href : null
}
