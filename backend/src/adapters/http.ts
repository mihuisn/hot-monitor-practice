// 轻量 HTTP 工具：基于全局 fetch，统一处理超时、JSON 解析、错误降级

const DEFAULT_TIMEOUT = 15000

/**
 * 带超时的 fetch 封装
 */
export async function fetchJson<T = any>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT, headers, ...rest } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 抓取 HTML 文本（用于搜索引擎结果页解析）
 */
export async function fetchText(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<string> {
  const { timeoutMs = DEFAULT_TIMEOUT, headers, ...rest } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

// 常用伪装 UA，避免被搜索引擎拦截
export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/**
 * 从 HTML 文本中提取首个正则匹配结果
 */
export function matchGroup(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern)
  return m ? m[1] : null
}

/**
 * 去除 HTML 标签，解码常见实体，并裁剪长度
 */
export function stripHtml(input: string, maxLen = 500): string {
  if (!input) return ''
  const text = input
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}
