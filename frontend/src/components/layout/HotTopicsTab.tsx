import { useState, useEffect, useCallback } from 'react'
import {
  Clock, BarChart3, RefreshCw, AlertTriangle, Settings, Flame,
  Sparkles, AlertCircle, Link2, Search, ExternalLink,
  Eye, Heart, Repeat2, MessageCircle, Quote, MessageSquare,
  ChevronDown, Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { getHotspots, type GetHotspotsResponse, type GetHotspotsParams, type Hotspot } from '@/api/hotspots'

// ---- 排序选项 ----
const filterOptions = [
  { label: '最新发现', icon: Sparkles, sortBy: 'createdAt' as const },
  { label: '最新发布', icon: Clock, sortBy: 'publishedAt' as const },
  { label: '重要程度', icon: AlertCircle, sortBy: 'relevance' as const },
  { label: '相关性', icon: Link2, sortBy: 'relevance' as const },
  { label: '热度综合', icon: BarChart3, sortBy: 'relevance' as const },
]

// ---- 筛选下拉选项 ----
const sourceOptions = [
  { value: '', label: '全部来源' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'weibo', label: '微博' },
  { value: 'bilibili', label: '哔哩哔哩' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'sogou', label: '搜狗' },
  { value: 'bing', label: '必应' },
  { value: 'google', label: 'Google' },
  { value: 'duckduckgo', label: 'DuckDuckGo' },
]

const importanceOptions = [
  { value: '', label: '全部重要性' },
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const timeRangeOptions = [
  { value: '', label: '全部时间' },
  { value: '1h', label: '最近1小时' },
  { value: '24h', label: '最近24小时' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
]

const isRealOptions = [
  { value: '', label: '全部' },
  { value: 'true', label: '已验证' },
  { value: 'false', label: '未验证' },
]

// ---- 样式映射 ----
const sourceLabels: Record<string, string> = {
  twitter: 'Twitter',
  weibo: '微博',
  bilibili: '哔哩哔哩',
  hackernews: 'Hacker News',
  sogou: '搜狗',
  bing: '必应',
  google: 'Google',
  duckduckgo: 'DuckDuckGo',
}

const sourceColors: Record<string, string> = {
  twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  weibo: 'bg-red-500/10 text-red-400 border-red-500/20',
  bilibili: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  hackernews: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  sogou: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  bing: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  google: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  duckduckgo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const importanceStyles: Record<string, { badge: string; dot: string }> = {
  low: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  medium: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  high: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  urgent: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
}

const importanceLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

// ---- 工具函数 ----

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('ellipsis')
  pages.push(totalPages)
  return pages
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHr < 24) return `${diffHr}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatCount(n: number | null): string {
  if (n === null || n === undefined) return '0'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ---- 自定义下拉选择器 ----

interface SelectProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  placeholder: string
}

function CustomSelect({ value, options, onChange, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-lg border border-border bg-popover shadow-md py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-sm transition-colors hover:bg-muted text-left"
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ---- 互动数据项 ----

interface MetricItem {
  icon: typeof Eye
  count: number | null
  label: string
}

function getMetrics(hotspot: Hotspot): MetricItem[] {
  const metrics: MetricItem[] = []
  if (hotspot.viewCount !== null) metrics.push({ icon: Eye, count: hotspot.viewCount, label: '浏览' })
  if (hotspot.likeCount !== null) metrics.push({ icon: Heart, count: hotspot.likeCount, label: '点赞' })
  if (hotspot.retweetCount !== null) metrics.push({ icon: Repeat2, count: hotspot.retweetCount, label: '转发' })
  if (hotspot.replyCount !== null) metrics.push({ icon: MessageCircle, count: hotspot.replyCount, label: '回复' })
  if (hotspot.commentCount !== null) metrics.push({ icon: MessageSquare, count: hotspot.commentCount, label: '评论' })
  if (hotspot.quoteCount !== null) metrics.push({ icon: Quote, count: hotspot.quoteCount, label: '引用' })
  if (hotspot.danmakuCount !== null) metrics.push({ icon: MessageSquare, count: hotspot.danmakuCount, label: '弹幕' })
  return metrics
}

// ---- 主组件 ----

export function HotTopicsTab() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ todayNew: 0, urgentCount: 0, highCount: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 筛选状态
  const [filterSource, setFilterSource] = useState('')
  const [filterImportance, setFilterImportance] = useState('')
  const [filterTimeRange, setFilterTimeRange] = useState('')
  const [filterIsReal, setFilterIsReal] = useState('')

  const fetchHotspots = useCallback(
    async (pageNum: number, sortBy: string, filters: { source: string; importance: string; timeRange: string; isReal: string }) => {
      setLoading(true)
      setError(null)
      try {
        const params: GetHotspotsParams = {
          page: pageNum,
          limit,
          sortBy: sortBy as GetHotspotsParams['sortBy'],
          sortOrder: 'desc',
        }
        if (filters.source) params.source = filters.source
        if (filters.importance) params.importance = filters.importance
        if (filters.timeRange) params.timeRange = filters.timeRange
        if (filters.isReal === 'true') params.isReal = true
        else if (filters.isReal === 'false') params.isReal = false

        const response: GetHotspotsResponse = await getHotspots(params)
        setHotspots(response.items)
        setTotal(response.total)
        setPage(response.page)
        setTotalPages(response.totalPages)
        setStats(response.stats)
      } catch (err) {
        setError('获取热点数据失败，请稍后重试')
        console.error('Failed to fetch hotspots:', err)
      } finally {
        setLoading(false)
      }
    },
    [limit]
  )

  // 排序或筛选变化时重新获取
  useEffect(() => {
    const sortBy = filterOptions[activeFilter].sortBy
    fetchHotspots(1, sortBy, {
      source: filterSource,
      importance: filterImportance,
      timeRange: filterTimeRange,
      isReal: filterIsReal,
    })
  }, [activeFilter, filterSource, filterImportance, filterTimeRange, filterIsReal, fetchHotspots])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const sortBy = filterOptions[activeFilter].sortBy
    fetchHotspots(newPage, sortBy, {
      source: filterSource,
      importance: filterImportance,
      timeRange: filterTimeRange,
      isReal: filterIsReal,
    })
  }

  const handleRefresh = () => {
    const sortBy = filterOptions[activeFilter].sortBy
    fetchHotspots(1, sortBy, {
      source: filterSource,
      importance: filterImportance,
      timeRange: filterTimeRange,
      isReal: filterIsReal,
    })
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总热点</p>
                <p className="text-2xl font-bold">{total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <RefreshCw className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今日新增</p>
                <p className="text-2xl font-bold">{stats.todayNew}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">紧急热点</p>
                <p className="text-2xl font-bold">{stats.urgentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Settings className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">高重要性</p>
                <p className="text-2xl font-bold">{stats.highCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 热点流区域 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">实时热点流</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每 30 分钟自动更新</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} isDisabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>

        {/* 排序 + 筛选栏 */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map((item, i) => {
            const Icon = item.icon
            const isActive = i === activeFilter
            return (
              <button
                key={item.label}
                onClick={() => setActiveFilter(i)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CustomSelect
            value={filterSource}
            options={sourceOptions}
            onChange={setFilterSource}
            placeholder="来源"
          />
          <CustomSelect
            value={filterImportance}
            options={importanceOptions}
            onChange={setFilterImportance}
            placeholder="重要性"
          />
          <CustomSelect
            value={filterTimeRange}
            options={timeRangeOptions}
            onChange={setFilterTimeRange}
            placeholder="时间"
          />
          <CustomSelect
            value={filterIsReal}
            options={isRealOptions}
            onChange={setFilterIsReal}
            placeholder="真实性"
          />
        </div>

        {/* 错误状态 */}
        {error && (
          <div className="min-h-[280px] rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-base font-medium text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              重试
            </Button>
          </div>
        )}

        {/* 加载状态 */}
        {!error && loading && hotspots.length === 0 && (
          <div className="min-h-[280px] rounded-xl border border-border flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-base font-medium">加载中...</p>
            <p className="text-sm text-muted-foreground">正在获取最新热点数据</p>
          </div>
        )}

        {/* 空状态 */}
        {!error && !loading && hotspots.length === 0 && (
          <div className="min-h-[280px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-medium">尚未发现热点</p>
            <p className="text-sm text-muted-foreground">添加监控关键词开始追踪</p>
          </div>
        )}

        {/* 热点列表 */}
        {!error && hotspots.length > 0 && (
          <div className="space-y-3">
            {hotspots.map((hotspot) => {
              const impStyle = importanceStyles[hotspot.importance] || importanceStyles.low
              const metrics = getMetrics(hotspot)
              const relTime = formatRelativeTime(hotspot.publishedAt)

              return (
                <Card
                  key={hotspot.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => hotspot.url && window.open(hotspot.url, '_blank')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        {/* 顶部：来源 + 标签 */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${sourceColors[hotspot.source] || ''}`}>
                            {sourceLabels[hotspot.source] || hotspot.source}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${impStyle.badge}`}>
                            <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${impStyle.dot}`} />
                            {importanceLabels[hotspot.importance] || hotspot.importance}
                          </Badge>
                          {hotspot.isReal && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <Check className="h-3 w-3 mr-0.5" />
                              已验证
                            </Badge>
                          )}
                          {hotspot.keyword && (
                            <Badge variant="outline" className="text-xs">
                              # {hotspot.keyword.text}
                            </Badge>
                          )}
                        </div>

                        {/* 标题 */}
                        <h3 className="text-base font-medium leading-snug mb-1 line-clamp-2">
                          {hotspot.title}
                        </h3>

                        {/* 摘要 */}
                        {hotspot.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {hotspot.summary}
                          </p>
                        )}

                        {/* 作者 + 时间 */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          {hotspot.authorName && (
                            <span className="inline-flex items-center gap-1">
                              {hotspot.authorAvatar && (
                                <img
                                  src={hotspot.authorAvatar}
                                  alt={hotspot.authorName}
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <span>@{hotspot.authorName}</span>
                              {hotspot.authorVerified && (
                                <Check className="h-3 w-3 text-sky-400" />
                              )}
                            </span>
                          )}
                          {relTime && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {relTime}
                            </span>
                          )}
                        </div>

                        {/* 底部：互动数据 */}
                        {metrics.length > 0 && (
                          <div className="flex items-center gap-3 flex-wrap">
                            {metrics.map((m, idx) => {
                              const Icon = m.icon
                              return (
                                <span key={idx} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Icon className="h-3.5 w-3.5" />
                                  {formatCount(m.count)}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* 右侧：外链图标 */}
                      {hotspot.url && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 分页 */}
        {!error && totalPages > 1 && (
          <Pagination className="pt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {pageNumbers.map((p, index) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => handlePageChange(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
