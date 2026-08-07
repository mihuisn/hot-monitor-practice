import { Bell, Rss, Globe, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const sources = [
  { id: 1, name: '微博', enabled: true, count: 15 },
  { id: 2, name: '知乎', enabled: true, count: 8 },
  { id: 3, name: '抖音', enabled: true, count: 23 },
  { id: 4, name: '百度', enabled: false, count: 0 },
  { id: 5, name: '头条', enabled: true, count: 12 },
]

const keywords = [
  { id: 1, word: '人工智能', enabled: true },
  { id: 2, word: '新能源', enabled: true },
  { id: 3, word: '科技创新', enabled: true },
  { id: 4, word: '气候变化', enabled: false },
]

export function MonitorSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">监控设置</h2>
        <p className="text-sm text-muted-foreground">配置数据源和关键词监控规则</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              数据源管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {source.count > 0 && (
                    <Badge variant="secondary">{source.count} 条</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    {source.enabled ? '暂停' : '启用'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-500" />
              关键词过滤
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${keyword.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium">{keyword.word}</span>
                </div>
                <Button variant="ghost" size="sm">
                  {keyword.enabled ? '移除' : '添加'}
                </Button>
              </div>
            ))}
            <Button className="w-full gap-2" variant="outline">
              + 添加新关键词
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Rss className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">实时推送</span>
            </div>
            <p className="text-sm text-muted-foreground">当有新热点时立即推送通知</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">每日汇总</span>
            </div>
            <p className="text-sm text-muted-foreground">每天早上发送前一天热点汇总</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">邮件通知</span>
            </div>
            <p className="text-sm text-muted-foreground">重要热点通过邮件通知</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
