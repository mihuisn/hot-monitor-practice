import { useState } from 'react'
import { Search, Filter, Calendar, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: number
  title: string
  source: string
  date: string
  heat: number
  url: string
  summary: string
}

const mockResults: SearchResult[] = [
  { 
    id: 1, 
    title: '人工智能大模型最新突破：GPT-5 即将发布', 
    source: '科技日报', 
    date: '2026-08-07', 
    heat: 98765, 
    url: '#',
    summary: '据最新消息，OpenAI 正在准备发布下一代大模型 GPT-5，预计将在多模态能力上实现重大突破...'
  },
  { 
    id: 2, 
    title: '新能源汽车市场持续增长，比亚迪领跑全球', 
    source: '经济观察报', 
    date: '2026-08-06', 
    heat: 87432, 
    url: '#',
    summary: '比亚迪在全球新能源汽车市场的份额持续扩大，超越特斯拉成为全球销量冠军...'
  },
  { 
    id: 3, 
    title: '科技创新推动产业升级，数字经济成为新引擎', 
    source: '人民日报', 
    date: '2026-08-05', 
    heat: 65342, 
    url: '#',
    summary: '数字经济正在成为推动我国经济发展的新引擎，人工智能、大数据等技术加速与实体经济融合...'
  },
]

export function SearchTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    setSearching(true)
    setHasSearched(true)
    setTimeout(() => {
      setResults(mockResults.filter(r => 
        r.title.includes(query) || r.summary.includes(query)
      ))
      setSearching(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">搜索热点</h2>
        <p className="text-sm text-muted-foreground">根据关键词搜索相关热点话题</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="输入关键词搜索热点..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} isDisabled={searching}>
              <Search className="h-4 w-4 mr-1" />
              {searching ? '搜索中...' : '搜索'}
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">时间范围：</span>
            <Button variant="ghost" size="sm" className="h-7">今天</Button>
            <Button variant="ghost" size="sm" className="h-7">本周</Button>
            <Button variant="ghost" size="sm" className="h-7">本月</Button>
            <Button variant="ghost" size="sm" className="h-7">自定义</Button>
          </div>
        </CardContent>
      </Card>

      {!hasSearched && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">输入关键词开始搜索热点话题</p>
          </CardContent>
        </Card>
      )}

      {hasSearched && !searching && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">没有找到相关结果，请尝试其他关键词</p>
          </CardContent>
        </Card>
      )}

      {searching && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              找到 <span className="font-medium text-foreground">{results.length}</span> 条相关结果
            </span>
          </div>
          
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-medium">{result.title}</CardTitle>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.summary}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">{result.source}</Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {result.date}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <TrendingUp className="h-3 w-3" />
                        {result.heat.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
