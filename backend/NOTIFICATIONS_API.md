# Notifications API 文档

## 概述

该文档基于 `backend/prisma/schema.prisma` 中的 `Notification` 数据模型设计，描述后端通知相关接口。

所有接口基础路径：`/api/notifications`

> 说明：`Notification` 用于记录系统生成的通知消息，例如热点发生、告警触发等。

---

## 数据模型：Notification

字段说明：

- `id` (String): 主键 UUID。
- `type` (String): 通知类型，例如 `hotspot`、`alert`。
- `title` (String): 通知标题。
- `content` (String): 通知内容正文。
- `isRead` (Boolean): 是否已读。
- `hotspotId` (String?): 关联热点 ID。
- `createdAt` (DateTime): 创建时间。

---

## 接口列表

### 1. GET `/api/notifications`

#### 描述

获取通知分页列表。

#### Query 参数

- `page` (Int, 可选): 页码，默认 `1`。
- `pageSize` (Int, 可选): 每页数量，默认 `20`。
- `isRead` (Boolean, 可选): 过滤已读/未读通知。
- `type` (String, 可选): 按通知类型过滤。
- `startAt` / `endAt` (ISO 8601 DateTime, 可选): 按创建时间区间过滤。
- `sortOrder` (String, 可选): `asc` 或 `desc`，默认 `desc`。

#### 响应示例

```json
{
  "items": [
    {
      "id": "notification-uuid",
      "type": "hotspot",
      "title": "发现新热点：AI 编程",
      "content": "系统检测到与关键词 ‘AI 编程’ 相关的新热点，已生成通知。",
      "isRead": false,
      "hotspotId": "hotspot-uuid",
      "createdAt": "2026-08-09T09:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

### 2. PATCH `/api/notifications/:id/read`

#### 描述

将指定通知标记为已读。

#### Path 参数

- `id` (String): 通知 `id`。

#### 响应示例

```json
{
  "id": "notification-uuid",
  "isRead": true
}
```

---

### 3. PATCH `/api/notifications/read-all`

#### 描述

将全部通知标记为已读。

#### 响应示例

```json
{
  "updatedCount": 45,
  "message": "All notifications have been marked as read"
}
```

---

### 4. DELETE `/api/notifications/:id`

#### 描述

删除指定通知。

#### Path 参数

- `id` (String): 通知 `id`。

#### 响应示例

成功：

```json
{
  "code": 200,
  "message": "Notification deleted successfully",
  "id": "notification-uuid"
}
```

失败（未找到）：

```json
{
  "code": 404,
  "message": "Notification not found",
  "id": "notification-uuid"
}
```

---

### 5. DELETE `/api/notifications`

#### 描述

清空全部通知记录。

#### 响应示例

```json
{
  "deletedCount": 45,
  "message": "All notifications have been deleted"
}
```

---

## 设计说明

- `GET /api/notifications` 支持分页，适合通知列表页面展示。
- `PATCH /api/notifications/:id/read` 用于单条通知已读状态更新。
- `PATCH /api/notifications/read-all` 便捷地将所有通知标记为已读。
- `DELETE /api/notifications/:id` 删除单条通知，用于清理无效通知。
- `DELETE /api/notifications` 清空所有通知，用于重置通知中心。

---

## 推荐扩展

后续可补充：

- `GET /api/notifications/unread-count`：获取未读通知数量。
- `POST /api/notifications`：新增通知（若需要外部触发或测试用）。
- `PUT /api/notifications/:id`：编辑通知内容。
- `priority` / `level`：通知优先级字段。# Notifications API 文档

## 概述

该文档基于 `backend/prisma/schema.prisma` 中的 `Notification` 数据模型设计，描述后端通知相关接口。

所有接口基础路径：`/api/notifications`

> 说明：`Notification` 用于存储系统产生的通知消息，例如热点推送、告警提醒等。

---

## 数据模型：Notification

字段说明：

- `id` (String): 主键 UUID。
- `type` (String): 通知类型，如 `hotspot`、`alert`。
- `title` (String): 通知标题。
- `content` (String): 通知正文内容。
- `isRead` (Boolean): 是否已读，默认 `false`。
- `hotspotId` (String?): 关联的热点 ID。
- `createdAt` (DateTime): 创建时间。

---

## 接口列表

### 1. GET `/api/notifications`

#### 描述

获取通知分页列表。

#### Query 参数

- `page` (Int, 可选): 页码，默认 `1`。
- `pageSize` (Int, 可选): 每页数量，默认 `20`。
- `isRead` (Boolean, 可选): 按是否已读过滤。
- `type` (String, 可选): 按通知类型过滤。
- `hotspotId` (String, 可选): 按关联热点过滤。
- `sortBy` (String, 可选): 排序字段，如 `createdAt`。
- `sortOrder` (String, 可选): `asc` 或 `desc`，默认 `desc`。

#### 响应示例

```json
{
  "items": [
    {
      "id": "notification-uuid-1",
      "type": "hotspot",
      "title": "发现新热点：AI 编程",
      "content": "系统检测到与关键词 AI 编程 相关的热门内容，点击查看详情。",
      "isRead": false,
      "hotspotId": "hotspot-uuid-1",
      "createdAt": "2026-08-09T09:00:00.000Z"
    }
  ],
  "total": 34,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2
}
```

---

### 2. PATCH `/api/notifications/:id/read`

#### 描述

标记指定通知为已读。

#### Path 参数

- `id` (String): 通知 `id`。

#### 响应示例

```json
{
  "id": "notification-uuid-1",
  "isRead": true,
  "updatedAt": "2026-08-09T09:05:00.000Z"
}
```

> 说明：若需要，可在实现中返回完整通知对象。

---

### 3. PATCH `/api/notifications/read-all`

#### 描述

将全部通知标记为已读。

#### 响应示例

```json
{
  "updatedCount": 34,
  "message": "All notifications marked as read"
}
```

> 说明：此接口适合“全部已读”按钮操作。

---

### 4. DELETE `/api/notifications/:id`

#### 描述

删除单条通知。

#### Path 参数

- `id` (String): 通知 `id`。

#### 响应示例

成功：

```json
{
  "code": 200,
  "message": "Notification deleted successfully",
  "id": "notification-uuid-1"
}
```

失败（未找到）：

```json
{
  "code": 404,
  "message": "Notification not found"
}
```

---

### 5. DELETE `/api/notifications`

#### 描述

清空全部通知。

#### 响应示例

```json
{
  "deletedCount": 34,
  "message": "All notifications cleared"
}
```

> 说明：该接口适合“清空通知”功能，也可与前端批量删除入口配合。

---

## 设计说明

- `GET /api/notifications` 提供分页查询，适合消息列表展示。
- `PATCH /api/notifications/:id/read` 用于逐条标记已读。
- `PATCH /api/notifications/read-all` 提供一键全部已读能力。
- `DELETE /api/notifications/:id` 删除单条通知。
- `DELETE /api/notifications` 清空所有通知，适合初始化或归零场景。

---

## 推荐扩展

后续可增加：

- `GET /api/notifications/unread-count`：返回未读通知数。
- `POST /api/notifications`：创建临时通知（若系统需要外部主动推送）。
- `meta` (Json?)：存放扩展字段，如提醒来源、跳转链接、优先级。
