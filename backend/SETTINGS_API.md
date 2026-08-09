# Settings API 文档

## 概述

该文档基于 `backend/prisma/schema.prisma` 中的 `Setting` 数据模型设计，描述后端系统设置相关接口。

所有接口基础路径：`/api/settings`

> 说明：`Setting` 用于存储系统配置项，采用 `key/value` 形式，适合快速读取和批量更新。

---

## 数据模型：Setting

字段说明：

- `id` (String): 主键 UUID。
- `key` (String): 设置键，唯一。
- `value` (String): 设置值。

---

## 接口列表

### 1. GET `/api/settings`

#### 描述
获取全部系统设置，并返回 `key → value` 对象。

#### 响应示例

```json
{
  "settings": {
    "refreshInterval": "30",
    "notificationEmail": "admin@example.com",
    "enableAiAnalysis": "true"
  }
}
```

> 说明：若需要分页或过滤，可在后续版本中补充，但当前接口返回所有配置项以支持前端设置页初始化。

---

### 2. PUT `/api/settings`

#### 描述
批量 `upsert` 系统设置。

#### 请求体

- `settings` (Object): 多组 `key → value` 配置。

#### 请求示例

```json
{
  "settings": {
    "refreshInterval": "30",
    "notificationEmail": "admin@example.com",
    "enableAiAnalysis": "true"
  }
}
```

#### 响应示例

```json
{
  "settings": {
    "refreshInterval": "30",
    "notificationEmail": "admin@example.com",
    "enableAiAnalysis": "true"
  }
}
```

> 说明：此接口可同时新增和更新多条设置项，适用于保存整页配置。

---

### 3. GET `/api/settings/:key`

#### 描述
获取单个设置项。

#### Path 参数

- `key` (String): 设置键。

#### 响应示例

成功：

```json
{
  "key": "refreshInterval",
  "value": "30"
}
```

失败（未找到）：

```json
{
  "code": 404,
  "message": "Setting not found",
  "key": "refreshInterval"
}
```

---

### 4. PUT `/api/settings/:key`

#### 描述
单个设置项 `upsert`。

#### Path 参数

- `key` (String): 设置键。

#### 请求体

- `value` (String): 设置值。

#### 请求示例

```json
{
  "value": "60"
}
```

#### 响应示例

```json
{
  "key": "refreshInterval",
  "value": "60"
}
```

> 说明：若该设置项不存在则创建；若存在则更新，适用于快速修改单个配置。

---

## 设计说明

- `GET /api/settings` 返回全局配置对象，方便前端直接使用 `settings[key]` 方式读取。
- `PUT /api/settings` 支持批量写入与覆盖，适合设置页一次性保存。
- `GET /api/settings/:key` 用于按需读取单个配置项。
- `PUT /api/settings/:key` 提供单项更新或创建能力，适合动态配置操作。

---

## 推荐扩展

后续可补充：

- `DELETE /api/settings/:key`：删除单个设置项。
- `POST /api/settings/restore-defaults`：恢复默认配置。
- `lastUpdatedBy` / `updatedAt`：记录设置变更来源与时间。