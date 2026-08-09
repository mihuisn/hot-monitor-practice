# Hotspots API 文档

## 概述

该文档基于 `backend/prisma/schema.prisma` 中的 `Hotspot` 数据模型设计，描述后端热点相关接口。

所有接口基础路径：`/api/hotspots`

> 说明：`Hotspot` 记录来自多源采集的热点内容，包含社交媒体、搜索引擎、文章链接等信息。

---

## 数据模型：Hotspot

字段说明：

- `id` (String): 主键 UUID。
- `title` (String): 热点标题。
- `content` (String): 热点正文或摘要内容。
- `url` (String): 原始链接。
- `source` (String): 数据来源，如 `twitter`、`bing`、`google`。
- `sourceId` (String?): 原始来源 ID，例如推文 ID。
- `isReal` (Boolean): 是否判定为真实热点，默认 `true`。
- `relevance` (Int): 相关性评分，默认 `0`。
- `relevanceReason` (String?): AI 分析给出的相关性理由。
- `keywordMentioned` (Boolean?): 内容中是否直接提及监控关键词。
- `importance` (String): 热点重要性，默认 `low`。
- `summary` (String?): AI 自动生成的摘要。
- `viewCount` / `likeCount` / `retweetCount` / `replyCount` / `commentCount` / `quoteCount` / `danmakuCount` (Int?): 相关社交数据指标。
- `authorName` / `authorUsername` / `authorAvatar` / `authorFollowers` / `authorVerified` (String?/Int?/Boolean?): 作者信息。
- `publishedAt` (DateTime?): 原始发布时间。
- `createdAt` (DateTime): 记录创建时间。
- `keywordId` (String?): 关联关键词 ID。
- `keyword` (Keyword?): 关系对象，可返回关键词详情。

### 关联模型：Keyword

- `id` (String)
- `text` (String): 关键词文本。
- `category` (String?)
- `isActive` (Boolean)
- `createdAt` / `updatedAt` (DateTime)

---

## 接口列表

### 1. GET `/api/hotspots`

#### 描述

获取热点列表，支持分页和过滤。

#### Query 参数

- `page` (Int, 可选): 页码，默认 `1`。
- `pageSize` (Int, 可选): 每页数量，默认 `20`。
- `source` (String, 可选): 按来源过滤，如 `twitter`、`bing`、`google`。
- `keyword` (String, 可选): 关键词文本过滤。
- `keywordId` (String, 可选): 关键词 ID 过滤。
- `isReal` (Boolean, 可选): 是否真实热点过滤。
- `importance` (String, 可选): 重要性过滤，如 `low`、`medium`、`high`。
- `authorUsername` (String, 可选): 作者用户名过滤。
- `startAt` / `endAt` (ISO 8601 DateTime, 可选): 按发布时间区间过滤。
- `search` (String, 可选): 标题或内容全文搜索。
- `sortBy` (String, 可选): 排序字段，如 `publishedAt`、`relevance`、`createdAt`。
- `sortOrder` (String, 可选): `asc` 或 `desc`，默认 `desc`。

#### 响应示例

```json
{
  "items": [
    {
      "id": "uuid-123",
      "title": "AI 热点标题",
      "content": "热点内容摘要...",
      "url": "https://example.com/article",
      "source": "twitter",
      "sourceId": "1234567890",
      "isReal": true,
      "relevance": 85,
      "relevanceReason": "与关键词高度匹配",
      "keywordMentioned": true,
      "importance": "high",
      "summary": "AI 生成摘要",
      "viewCount": 10234,
      "likeCount": 512,
      "retweetCount": 80,
      "replyCount": 16,
      "commentCount": 32,
      "quoteCount": 5,
      "danmakuCount": null,
      "authorName": "作者",
      "authorUsername": "author123",
      "authorAvatar": "https://...",
      "authorFollowers": 12000,
      "authorVerified": true,
      "publishedAt": "2026-08-09T08:00:00.000Z",
      "createdAt": "2026-08-09T08:10:00.000Z",
      "keywordId": "keyword-uuid",
      "keyword": {
        "id": "keyword-uuid",
        "text": "AI 编程"
      }
    }
  ],
  "total": 123,
  "page": 1,
  "pageSize": 20,
  "totalPages": 7
}
```

---

### 2. GET `/api/hotspots/stats`

#### 描述

获取热点统计数据，用于仪表盘展示和数据分析。

#### Query 参数

- `source` (String, 可选)
- `keyword` (String, 可选)
- `startAt` / `endAt` (ISO 8601 DateTime, 可选)

#### 响应示例

```json
{
  "totalCount": 123,
  "realCount": 110,
  "fakeCount": 13,
  "bySource": {
    "twitter": 80,
    "bing": 30,
    "google": 13
  },
  "byImportance": {
    "high": 20,
    "medium": 50,
    "low": 53
  },
  "byKeyword": {
    "AI 编程": 45,
    "大模型": 32
  },
  "recentHotspots": [
    {
      "id": "uuid-123",
      "title": "AI 热点标题",
      "source": "twitter",
      "publishedAt": "2026-08-09T08:00:00.000Z",
      "importance": "high"
    }
  ]
}
```

> 说明：统计接口可扩展为返回更多聚合维度，如 `dailyCounts`、`sourceTrend`、`topKeywords` 等。

---

### 3. GET `/api/hotspots/:id`

#### 描述

获取单条热点详情。

#### Path 参数

- `id` (String): 热点 `id`。

#### 响应示例

```json
{
  "id": "uuid-123",
  "title": "AI 热点标题",
  "content": "热点内容完整文本...",
  "url": "https://example.com/article",
  "source": "twitter",
  "sourceId": "1234567890",
  "isReal": true,
  "relevance": 85,
  "relevanceReason": "与关键词高度匹配",
  "keywordMentioned": true,
  "importance": "high",
  "summary": "AI 生成摘要",
  "viewCount": 10234,
  "likeCount": 512,
  "retweetCount": 80,
  "replyCount": 16,
  "commentCount": 32,
  "quoteCount": 5,
  "danmakuCount": null,
  "authorName": "作者",
  "authorUsername": "author123",
  "authorAvatar": "https://...",
  "authorFollowers": 12000,
  "authorVerified": true,
  "publishedAt": "2026-08-09T08:00:00.000Z",
  "createdAt": "2026-08-09T08:10:00.000Z",
  "keywordId": "keyword-uuid",
  "keyword": {
    "id": "keyword-uuid",
    "text": "AI 编程",
    "category": "技术",
    "isActive": true
  }
}
```

---

### 4. POST `/api/hotspots/search`

#### 描述

即时搜索热点内容并返回 AI 分析结果，结果不入库。

#### 请求体

- `query` (String): 搜索关键词或自然语言查询。
- `source` (String?, 可选): 限定数据来源。
- `limit` (Int?, 可选): 返回结果数，默认 `10`。
- `keyword` (String?, 可选): 关联关键词文本，便于 AI 分析上下文。

#### 请求示例

```json
{
  "query": "AI 编程 最新 热点",
  "source": "twitter",
  "limit": 5,
  "keyword": "AI 编程"
}
```

#### 响应示例

```json
{
  "results": [
    {
      "title": "AI 编程 热点推文",
      "content": "推文内容摘要...",
      "url": "https://twitter.com/...",
      "source": "twitter",
      "publishedAt": "2026-08-09T08:00:00.000Z",
      "aiAnalysis": {
        "relevance": 92,
        "relevanceReason": "文本直接包含关键词 AI 编程",
        "isReal": true,
        "importance": "high",
        "summary": "该推文描述了最新 AI 编程工具发布。",
        "suggestedAction": "继续关注并推送通知"
      }
    }
  ]
}
```

> 说明：本接口主要用于即时搜索与 AI 语义分析，返回结果不写入数据库。

---

### 5. DELETE `/api/hotspots/:id`

#### 描述

删除指定热点记录。

#### Path 参数

- `id` (String): 要删除的热点 `id`。

#### 响应示例

成功：

```json
{
  "code": 200,
  "message": "Hotspot deleted successfully",
  "id": "uuid-123"
}
```

失败（未找到）：

```json
{
  "code": 404,
  "message": "Hotspot not found"
}
```

---

## 设计说明

- `GET /api/hotspots` 采用分页返回，适合热点列表展示。
- `GET /api/hotspots/stats` 用于聚合统计，可按来源、关键词和时间范围筛选。
- `GET /api/hotspots/:id` 返回完整详情，包含与 `Keyword` 的关联信息。
- `POST /api/hotspots/search` 提供即时搜索与 AI 分析能力，不写库；适用于前端搜索建议、快速判定。
- `DELETE /api/hotspots/:id` 删除记录，用于清理误采集或已失效热点。

---

## 推荐扩展字段

若后续需要，可在 `Hotspot` 上补充以下字段：

- `tags` (String[])
- `language` (String)
- `location` (String)
- `aiConfidence` (Int)
- `riskLevel` (String)
- `sourceCategory` (String)
