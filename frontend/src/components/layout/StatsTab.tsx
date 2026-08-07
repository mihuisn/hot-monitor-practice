import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statsData = {
  totalTopics: 1256,
  todayTopics: 48,
  totalViews: 892341,
  totalSources: 156,
  growthRate: 12.5,
  activeKeywords: 23,
}

const recentStats = [
  { date: '今天', count: 48, views: 32541, growth: 15.2 },
  { date: '昨天', count: 42, views: 28123, growth: -3.1 },
  { date: '前天', count: 38, views: 29012, growth: 8.4 },
  { date: '3天前', count: 45, views: 26453, growth: -5.2 },
  { date: '4天前', count: 40, views: 27981, growth: 2.3 },
  { date: '5天前', count: 36, views: 26234, growth: -1.8 },
  { date: '6天前', count: 38, views: 26712, growth: 4.5 },
]

export function StatsTab() {
  const maxCount = Math.max(...recentStats.map((s) => s.count))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">数据统计</h2>
        <p className="text-sm text-muted-foreground">查看热点监控数据统计和趋势分析</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总话题数</p>
                <p className="text-2xl font-bold">{statsData.totalTopics.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+{statsData.growthRate}%</span>
              <span className="text-xs text-muted-foreground">较上月</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日新增</p>
                <p className="text-2xl font-bold">{statsData.todayTopics}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">实时</Badge>
              <span className="text-xs text-muted-foreground">正在更新</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总浏览量</p>
                <p className="text-2xl font-bold">{statsData.totalViews.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+8.3%</span>
              <span className="text-xs text-muted-foreground">较上月</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃关键词</p>
                <p className="text-2xl font-bold">{statsData.activeKeywords}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">共监控</span>
              <span className="text-xs font-medium">{statsData.totalSources}</span>
              <span className="text-xs text-muted-foreground">个数据源</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>近7日趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStats.map((stat) => (
              <div key={stat.date} className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">{stat.date}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transition-all"
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-sm font-medium text-right">{stat.count}</span>
                <span className={`w-16 text-xs ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
