import { useState } from 'react'
import { Clock, BarChart3, RefreshCw, AlertTriangle, Settings, Flame, Sparkles, AlertCircle, Link2, Filter, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const filterOptions = [
  { label: '最新发现', icon: Sparkles },
  { label: '最新发布', icon: Clock },
  { label: '重要程度', icon: AlertCircle },
  { label: '相关性', icon: Link2 },
  { label: '热度综合', icon: BarChart3 },
]

const statsData = {
  totalTopics: 1256,
  todayNew: 48,
  urgentTopics: 5,
  monitorKeywords: 23,
}

export function HotTopicsTab() {
  const [activeFilter, setActiveFilter] = useState(0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 to-card border-blue-500/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总热点</p>
                <p className="text-2xl font-bold">{statsData.totalTopics.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-card border-emerald-500/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <RefreshCw className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今日新增</p>
                <p className="text-2xl font-bold">{statsData.todayNew}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 to-card border-amber-500/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">紧急热点</p>
                <p className="text-2xl font-bold">{statsData.urgentTopics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-violet-950/40 to-card border-violet-500/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-violet-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Settings className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">监控词</p>
                <p className="text-2xl font-bold">{statsData.monitorKeywords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">实时热点流</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每 30 分钟自动更新</span>
          </div>
        </div>

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
          <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto">
            <Filter className="h-3.5 w-3.5" />
            筛选
          </button>
        </div>

        <div className="min-h-[280px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-3 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-medium">尚未发现热点</p>
          <p className="text-sm text-muted-foreground">添加监控关键词开始追踪</p>
        </div>
      </div>
    </div>
  )
}
