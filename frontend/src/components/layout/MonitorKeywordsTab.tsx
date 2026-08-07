import { Plus, X, Tag, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface Keyword {
  id: number
  word: string
  category: string
  enabled: boolean
}

const initialKeywords: Keyword[] = [
  { id: 1, word: '人工智能', category: '科技', enabled: true },
  { id: 2, word: '新能源', category: '产业', enabled: true },
  { id: 3, word: '科技创新', category: '科技', enabled: true },
  { id: 4, word: '气候变化', category: '环境', enabled: false },
  { id: 5, word: '元宇宙', category: '科技', enabled: true },
  { id: 6, word: '碳中和', category: '环境', enabled: true },
]

const categories = ['全部', '科技', '产业', '环境', '社会']

export function MonitorKeywordsTab() {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [newKeyword, setNewKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const filteredKeywords = selectedCategory === '全部' 
    ? keywords 
    : keywords.filter(k => k.category === selectedCategory)

  const handleAdd = () => {
    if (!newKeyword.trim()) return
    setKeywords(prev => [
      ...prev,
      { id: Date.now(), word: newKeyword.trim(), category: '科技', enabled: true }
    ])
    setNewKeyword('')
  }

  const handleRemove = (id: number) => {
    setKeywords(prev => prev.filter(k => k.id !== id))
  }

  const handleToggle = (id: number) => {
    setKeywords(prev => prev.map(k => 
      k.id === id ? { ...k, enabled: !k.enabled } : k
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">监控词管理</h2>
        <p className="text-sm text-muted-foreground">添加和管理需要重点监控的关键词</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            添加新关键词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="输入关键词..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-500" />
            分类筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              关键词列表
            </span>
            <Badge variant="secondary">
              共 {filteredKeywords.length} 个
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredKeywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${keyword.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <span className="font-medium">{keyword.word}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{keyword.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {keyword.enabled ? '监控中' : '已暂停'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(keyword.id)}
                  >
                    {keyword.enabled ? '暂停' : '启用'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(keyword.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
