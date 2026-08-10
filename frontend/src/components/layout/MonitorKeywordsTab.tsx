import { Plus, X, Tag, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect, useCallback } from 'react'
import {
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  type Keyword,
} from '@/api/keywords'

const categories = ['全部', '科技', '产业', '环境', '社会']

export function MonitorKeywordsTab() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newKeyword, setNewKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const loadKeywords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getKeywords({ pageSize: 100 })
      setKeywords(res.items)
    } catch {
      setError('加载关键词失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKeywords()
  }, [loadKeywords])

  const filteredKeywords = selectedCategory === '全部'
    ? keywords
    : keywords.filter(k => k.category === selectedCategory)

  const handleAdd = async () => {
    const text = newKeyword.trim()
    if (!text) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await createKeyword({ text })
      const keywordWithCount = {
        ...created,
        _count: created._count ?? { hotspots: 0 },
      }
      setKeywords(prev => [keywordWithCount as Keyword, ...prev])
      setNewKeyword('')
    } catch (e: any) {
      const message = e.response?.data?.message || '添加失败'
      setError(message)
      if (message.includes('已存在')) {
        setNewKeyword('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    setError(null)
    try {
      await deleteKeyword(id)
      setKeywords(prev => prev.filter(k => k.id !== id))
    } catch (e: any) {
      setError(e.response?.data?.message || '删除失败')
    }
  }

  // 监控switch切换
  const handleToggle = async (keyword: Keyword) => {
    const next = !keyword.isActive
    // 乐观更新：先改 UI，失败再回滚
    setKeywords(prev => prev.map(k =>
      k.id === keyword.id ? { ...k, isActive: next } : k
    ))
    setError(null)
    try {
      await updateKeyword(keyword.id, { isActive: next })
    } catch (e: any) {
      setKeywords(prev => prev.map(k =>
        k.id === keyword.id ? { ...k, isActive: keyword.isActive } : k
      ))
      setError(e.response?.data?.message || '更新失败')
    }
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
              disabled={submitting}
            />
            <Button onClick={handleAdd} isDisabled={submitting || !newKeyword.trim()}>
              {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              添加
            </Button>
          </div>
          {error && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
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
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              加载中...
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无关键词
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredKeywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${keyword.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <span className="font-medium">{keyword.text}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {keyword.category && (
                          <Badge variant="outline" className="text-xs">{keyword.category}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {keyword.isActive ? '监控中' : '已暂停'}
                        </span>
                        {(keyword._count?.hotspots ?? 0) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            · {keyword._count?.hotspots ?? 0} 条热点
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      isSelected={keyword.isActive}
                      onChange={() => handleToggle(keyword)}
                      aria-label={keyword.isActive ? '暂停监控' : '启用监控'}
                    />
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
