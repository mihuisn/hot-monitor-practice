# Keywords API 文档

## 概述

该文档基于 `backend/prisma/schema.prisma` 中的 `Keyword` 数据模型设计，描述后端关键词相关接口。

所有接口基础路径：`/api/keywords`

> 说明：`Keyword` 用于管理监控关键词，并可关联多条 `Hotspot` 记录。

---

## 数据模型：Keyword

字段说明：

- `id` (String): 主键 UUID。
- `text` (String): 关键词文本。
- `category` (String?): 关键词类别。
- `isActive` (Boolean): 是否启用该关键词。
- `createdAt` (DateTime): 创建时间。
- `updatedAt` (DateTime): 更新时间。
- `hotspots` (Hotspot[]): 关联的热点列表。

### 关联模型：Hotspot（简要）

- `id` (String)
- `title` (String)
- `url` (String)
- `source` (String)
- `importance` (String)
- `publishedAt` (DateTime?)
- `createdAt` (DateTime)

---

## 接口列表

### 1. GET `/api/keywords`

#### 描述
获取关键词列表，返回每个关键词关联的热点总数。

#### Query 参数

- `page` (Int, 可选): 页码，默认 `1`。
- `pageSize` (Int, 可选): 每页数量，默认 `20`。
- `search` (String, 可选): 按文本搜索关键词。
- `category` (String, 可选): 按分类过滤。
- `isActive` (Boolean, 可选): 过滤启用/暂停状态。
- `sortBy` (String, 可选): 排序字段，如 `createdAt`、`updatedAt`、`text`。
- `sortOrder` (String, 可选): `asc` 或 `desc`，默认 `desc`。

#### 响应示例

```json
{
  "items": [
    {
      "id": "keyword-uuid",
      "text": "AI 编程",
      "category": "技术",
      "isActive": true,
      "createdAt": "2026-08-09T07:30:00.000Z",
      "updatedAt": "2026-08-09T08:05:00.000Z",
      "_count": {
        "hotspots": 12
      }
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

> 说明：`_count.hotspots` 表示该关键词当前关联的热点数量。

---

### 2. GET `/api/keywords/:id`

#### 描述
获取关键词详情，并返回该关键词关联的最近 `20` 条热点。

#### Path 参数

- `id` (String): 关键词 `id`。

#### 响应示例

```json
{
  "id": "keyword-uuid",
  "text": "AI 编程",
  "category": "技术",
  "isActive": true,
  "createdAt": "2026-08-09T07:30:00.000Z",
  "updatedAt": "2026-08-09T08:05:00.000Z",
  "_count": {
    "hotspots": 12
  },
  "recentHotspots": [
    {
      "id": "hotspot-uuid-1",
      "title": "AI 编程 热点内容",
      "url": "https://example.com/article",
      "source": "twitter",
      "importance": "high",
      "publishedAt": "2026-08-09T08:00:00.000Z",
      "createdAt": "2026-08-09T08:10:00.000Z"
    }
  ]
}
```

> 说明：`recentHotspots` 可根据 `publishedAt` 或 `createdAt` 倒序返回最新的 20 条热点。

---

### 3. POST `/api/keywords`

#### 描述
创建一个新的关键词。

#### 请求体

- `text` (String, 必需): 关键词文本。
- `category` (String?, 可选): 关键词类别。
- `isActive` (Boolean?, 可选): 是否启用，默认 `true`。

#### 请求示例

```json
{
  "text": "AI 编程",
  "category": "技术",
  "isActive": true
}
```

#### 响应示例

```json
{
  "id": "keyword-uuid",
  "text": "AI 编程",
  "category": "技术",
  "isActive": true,
  "createdAt": "2026-08-09T08:20:00.000Z",
  "updatedAt": "2026-08-09T08:20:00.000Z"
}
```

---

### 4. PUT `/api/keywords/:id`

#### 描述
更新关键词信息。

#### Path 参数

- `id` (String): 要更新的关键词 `id`。

#### 请求体

- `text` (String?, 可选): 更新关键词文本。
- `category` (String?, 可选): 更新分类。
- `isActive` (Boolean?, 可选): 更新启用状态。

#### 请求示例

```json
{
  "text": "大模型",
  "category": "趋势",
  "isActive": false
}
```

#### 响应示例

```json
{
  "id": "keyword-uuid",
  "text": "大模型",
  "category": "趋势",
  "isActive": false,
  "createdAt": "2026-08-09T07:30:00.000Z",
  "updatedAt": "2026-08-09T08:25:00.000Z"
}
```

---

### 5. DELETE `/api/keywords/:id`

#### 描述
删除指定关键词。

#### Path 参数

- `id` (String): 要删除的关键词 `id`。

#### 响应示例

成功：

```json
{
  "code": 200,
  "message": "Keyword deleted successfully",
  "id": "keyword-uuid"
}
```

失败（未找到）：

```json
{
  "code": 404,
  "message": "Keyword not found"
}
```
```

---

### 6. PATCH `/api/keywords/:id/toggle`

#### 描述
切换关键词启用/暂停状态。

#### Path 参数

- `id` (String): 要切换状态的关键词 `id`。

#### 响应示例

```json
{
  "id": "keyword-uuid",
  "text": "AI 编程",
  "category": "技术",
  "isActive": false,
  "updatedAt": "2026-08-09T08:30:00.000Z"
}
```

> 说明：该接口可用于快速启用或暂停关键词监控，不修改关键词文本。

---

## 设计说明

- `GET /api/keywords` 返回带 `_count.hotspots` 的列表，便于统计每个关键词的热点数量。
- `GET /api/keywords/:id` 返回关键词详情并附带最近 20 条热点，支持快速查看该关键词下的热点动态。
- `POST /api/keywords` 新增关键词。
- `PUT /api/keywords/:id` 更新关键词属性。
- `DELETE /api/keywords/:id` 删除关键词，用于清理失效或不再监控的词汇。
- `PATCH /api/keywords/:id/toggle` 便捷切换启用 / 暂停状态，不改变其它字段。

---

## 推荐扩展

后续可增加：

- `description` (String?)：关键词说明。
- `priority` (Int)：关键词权重。
- `tags` (String[])：关键词标签。
- `lastMatchedAt` (DateTime?)：最近一次命中时间。
- `monitorConfig` (Json?)：更细粒度的监控规则。
