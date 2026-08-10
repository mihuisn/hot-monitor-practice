import { fetchJson, stripHtml, BROWSER_UA } from './http.js'
import type { SourceAdapter, CandidateTopic, FetchInput } from './types.js'

// Bilibili 适配器：使用 web-interface/search/type 搜索视频接口
export const bilibiliAdapter: SourceAdapter = {
  source: 'bilibili',

  async fetch(input: FetchInput): Promise<CandidateTopic[]> {
    const { keyword, limit } = input
    const query = encodeURIComponent(keyword.text)
    const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${query}&page=1&page_size=${limit}`

    const headers: Record<string, string> = {
      'User-Agent': BROWSER_UA,
      'Accept': 'application/json',
      'Referer': 'https://www.bilibili.com/',
    }
    const cookie = process.env.BILIBILI_COOKIE
    if (cookie) headers['Cookie'] = cookie

    try {
      const data = await fetchJson<any>(url, { headers })
      if (data?.code !== 0) {
        console.warn('[bilibili] 接口返回异常:', data?.message ?? data?.code)
        return []
      }
      const results: any[] = data?.data?.result ?? []

      return results.map((r) => {
        const bvid = r.bvid
        const title = stripHtml(r.title ?? '', 160) || 'Untitled Video'
        const description = stripHtml(r.description ?? '', 500)
        return {
          title,
          content: description || title,
          url: bvid ? `https://www.bilibili.com/video/${bvid}` : '',
          source: 'bilibili',
          sourceId: bvid ?? undefined,
          publishedAt: r.pubdate ? new Date(r.pubdate * 1000) : undefined,
          viewCount: toNum(r.play),
          likeCount: toNum(r.like),
          replyCount: toNum(r.review),
          commentCount: toNum(r.review),
          // video_review 字段为弹幕数
          danmakuCount: toNum(r.video_review),
          authorName: r.author ?? undefined,
          authorUsername: r.mid ? String(r.mid) : undefined,
          authorAvatar: r.upic
            ? `https:${r.upic}`
            : undefined,
        }
      }).filter((i) => i.url)
    } catch (err) {
      console.error('[bilibili] 抓取失败:', (err as Error).message)
      return []
    }
  },
}

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
