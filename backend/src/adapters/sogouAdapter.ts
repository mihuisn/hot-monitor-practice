import { fetchText, stripHtml, BROWSER_UA } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// 搜狗适配器：抓取搜狗网页搜索结果页并解析（无需 Key）
export const sogouAdapter: SourceAdapter = {
  source: 'sogou',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://www.sogou.com/web?query=${query}`

    try {
      const html = await fetchText(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
      })

      const items: CandidateTopic[] = []
      // 搜狗结果块：<h3 class="vr-title"><a href="...">title</a></h3>，后跟 <p class="str_info"> 或结构摘要
      const blockRegex =
        /<h3[^>]*vr-title[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<p[^>]*str_info[^>]*>([\s\S]*?)<\/p>|<div[^>]*str_text_info[^>]*>([\s\S]*?)<\/div>)?/g
      let m: RegExpExecArray | null
      while ((m = blockRegex.exec(html)) && items.length < limit) {
        const href = m[1]
        const title = stripHtml(m[2], 160)
        const snippet = stripHtml(m[3] ?? m[4] ?? '', 500)
        if (!title || !href) continue
        items.push({
          title,
          content: snippet || title,
          url: href.startsWith('http') ? href : `https://www.sogou.com${href}`,
          source: 'sogou',
        })
      }
      return items
    } catch (err) {
      console.error('[sogou] 抓取失败:', (err as Error).message)
      return []
    }
  },
}
