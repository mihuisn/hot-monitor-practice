# Hot Monitor 设计与集成文档

## 1. 项目目标

构建一个轻量级热点监控工具，目标为 AI 编程博主提供：

- 自动发现指定关键词相关的热点变化
- 多源抓取热点信息，避免单一来源
- 利用 AI 识别热点真实性、过滤假冒或误导内容
- 30 分钟频率自动检查并更新热点
- 发现后支持站内实时浏览器推送 + 邮件通知
- 响应式 Web 页面展示热点与监控状态
- 后续封装成 AI Agent Skills，可交由其他 AI 调用监控能力

## 2. 需求要点

### 2.1 核心功能

- 用户输入并管理监控关键词
- 后端定期自动采集热点候选内容
- 支持多个信息源，至少包括：
  - 网页搜索爬虫（搜索引擎结果页）
  - Twitter(x) API（使用 twitterapi.io）
- 使用 OpenRouter 接入 AI，判定热点是否真实、是否值得推送
- 若发现真实热点，则触发邮件通知和浏览器实时推送
- 页面应兼容移动端、保持独特视觉风格

### 2.2 频率与通知

- 热点检查频率：30 分钟
- 通知方式：
  - 浏览器实时推送
  - 邮件通知
  - 日报汇总（可选）

### 2.3 技术原则

- 轻量、敏捷开发，不引入过多工程复杂度
- 优先完成 Web 版本，再实现 Agent Skills
- 保持后端可扩展、信息源可插拔
- 规范接口、避免硬编码单一平台

## 3. 体系架构

### 3.1 后端

- Node.js + Express
- 数据存储建议使用 Prisma + SQLite / PostgreSQL
- 模块划分：
  - `SourceAdapter`：多源抓取适配器
  - `MonitorService`：聚合、AI 识别、去重、热点判断
  - `OpenRouterService`：AI 调用与 Prompt 管理
  - `NotificationService`：实时推送、邮件通知、日志
  - `KeywordService`：监控关键词 CRUD

### 3.2 前端

- React + Vite
- UI 模块：
  - 热点雷达 / 实时热点流
  - 监控关键词管理
  - 数据源与通知设置
  - 搜索与历史热点检索
- 交互方式：
  - 30 分钟自动刷新
  - 实时通知提示
  - 响应式布局

### 3.3 多源信息采集

- 搜索爬虫源：
  - 根据关键词抓取搜索结果页
  - 优先抓取标题、摘要、链接、发布时间
  - 使用伪装 User-Agent、限制请求频率
  - 同一关键词同一源至少间隔 2~5 分钟
  - 支持多搜索引擎组合，如百度、必应、360、谷歌
- Twitter(x) API 源：
  - 使用 twitterapi.io 提供的 `GET /twitter/tweet/advanced_search`
  - 使用 `X-API-Key` 进行认证，无需 OAuth
  - 同时可考虑 `GET /twitter/trends`、`/twitter/user/tweet_timeline` 等补充

### 3.4 AI 识别层

- 使用 OpenRouter 作为 AI 服务通道
- 任务：
  - 判断候选内容是否与关键词相关
  - 判断内容是否真实可信、是否是假冒热点
  - 生成摘要 / 置信度 / 风险提示
- 方案：
  - 通过 OpenRouter Chat Completion 接口发送标准 Prompt
  - 解析 AI 返回的 JSON 结构
  - 基于多源出现次数 + AI 可信度综合判定

## 4. 最新 API 对接方法

### 4.1 OpenRouter（最新、OpenAI 兼容）

#### REST API

- URL：`https://openrouter.ai/api/v1/chat/completions`
- 认证：`Authorization: Bearer <OPENROUTER_API_KEY>`
- 请求体示例：

```json
{
  "model": "~openai/gpt-latest",
  "messages": [
    {
      "role": "user",
      "content": "请判断以下热点内容是否真实、是否属于关键词 AI 编程，并输出 JSON 格式。\n..."
    }
  ]
}
```

- 可选头部：
  - `HTTP-Referer`: `<YOUR_SITE_URL>`
  - `X-OpenRouter-Title`: `<YOUR_SITE_NAME>`

#### TypeScript SDK

```ts
import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const completion = await client.chat.send({
  model: "~openai/gpt-latest",
  messages: [
    {
      role: "user",
      content:
        '请判断以下热点内容是否真实可信，并说明是否与关键词 "AI 编程" 相关。内容：...',
    },
  ],
});

const answer = completion.choices[0].message?.content;
```

### 4.2 Twitter(x) API (`twitterapi.io`)

#### 认证方式

- Header：`X-API-Key: <YOUR_TWITTERAPI_IO_KEY>`
- 无需 OAuth，使用单个 API Key 即可

#### 关键 Endpoint

- `GET https://api.twitterapi.io/twitter/tweet/advanced_search`
  - 参数：
    - `query`：高级搜索语句，例如 `AI OR 大模型` 或 `AI from:elonmusk`
    - `queryType`：`Latest` 或 `Top`
    - `cursor`：分页游标，第一页传空字符串

- 返回示例字段：
  - `tweets`：数组
  - 每条 tweet 包含：`id`, `url`, `text`, `source`, `retweetCount`, `replyCount`, `likeCount`, `quoteCount`, `viewCount`, `createdAt`, `lang`, `author` 等
  - `has_next_page` / `next_cursor`

#### 示例

```http
GET https://api.twitterapi.io/twitter/tweet/advanced_search?query=AI&queryType=Latest
X-API-Key: your_twitterapi_key
```

### 4.3 推荐使用方式

- 先用 `queryType=Latest` 采集最新动态
- 再用 `queryType=Top` 获取高热度内容
- 将关键词搜索和趋势搜索结合，避免单一数据源

## 5. 数据模型建议

### 5.1 Keyword

- id
- word
- enabled
- category
- createdAt
- updatedAt

### 5.2 Topic

- id
- title
- summary
- url
- sourceName
- sourceType (`web-search` / `twitter` / `rss`)
- publishAt
- hotScore
- aiConfidence
- isFakeRisk
- isVerifiedHot
- keywordsMatched
- createdAt
- updatedAt

### 5.3 Source

- id
- name
- type
- enabled
- config
- lastFetchedAt

### 5.4 Notification

- id
- topicId
- type (`instant` / `daily` / `email`)
- message
- status (`pending` / `sent`)
- createdAt
- sentAt

## 6. 监控流程设计

### 6.1 采集与识别流程

1. 定时任务触发（30 分钟一次）
2. 读取启用的监控关键词
3. 调用 `SourceAdapter`：
   - 网页搜索爬虫
   - Twitter 高级搜索
   - 其他补充源（可选）
4. 标准化候选内容为 `CandidateTopic`
5. 调用 OpenRouter AI 进行热点真实性与相关性分析
6. 结合多源出现频次与 AI 置信度，判定是否为“有效热点”
7. 存入 `Topic` 表，触发通知

### 6.2 通知策略

- 当发现新热点并且 AI 判定为真实可信时，发送即时通知
- 支持浏览器推送（Web Push API）
- 支持邮件通知（推荐使用 `nodemailer` 或第三方邮件服务）
- 支持“每日汇总”模式，按日期归档并发送报告

## 7. 前端功能建议

- `HotTopicsTab`
  - 实时热点列表
  - 来源标签：`Twitter` / `搜索` / `RSS`
  - 可信度徽章与风险提示
  - 关键词命中高亮
- `MonitorKeywordsTab`
  - 添加 / 删除 / 启用 / 暂停关键词
  - 显示关键词命中统计
- `MonitorSettingsTab`
  - 数据源开关
  - Twitter API Key 配置入口
  - OpenRouter API Key 配置入口
  - 抓取频率设置（默认 30 分钟）
- `SearchTab`
  - 历史热点搜索
  - 按关键词、来源、时间范围过滤

## 8. Agent Skills 设计方向

- 先实现 Web 版本后再封装 Agent Skills
- Agent Skills 功能点：
  - 添加 / 管理监控关键词
  - 拉取当前热点列表
  - 查询指定关键词的最新发现
  - 调用 AI 判定热点真实性
  - 返回结构化热点摘要

## 9. 开发分阶段计划

### 阶段 1：设计与准备

- 确认关键词管理模型
- 确认数据源类别与基础抓取方式
- 确认 OpenRouter 与 twitterapi.io 的认证方案
- 梳理前端页面和 API 交互接口

### 阶段 2：后端实现

- 新增监控关键词与热点存储模型
- 实现 Twitter API 调用封装
- 实现网页搜索抓取适配器
- 实现 OpenRouter AI 调用服务
- 实现定时任务与通知触发

### 阶段 3：前端实现

- 接入后端 API
- 实现关键词管理与热点展示
- 增加实时通知 badge / 弹窗
- 优化移动端体验

### 阶段 4：通知与 Agent Skills

- 实现浏览器实时推送
- 实现邮件通知
- 封装 Agent Skills 能力接口

## 10. 注意事项

- 爬虫采集需要做好频率控制，避免封禁
- 多源结果聚合时需处理去重与内容合并
- AI 判别请设计结构化 Prompt，避免“只有自由文本结果”
- 初期优先站内通知，邮件推送和 Agent Skills 作为第二步
- 保持前端风格独特，不要简单复制通用仪表盘样式

## 11. 结论

当前最优路径是：

1. 先完成 Web 版本，做好关键词管理、热点采集、AI 判别、实时通知
2. 在后端接入 twitterapi.io `GET /twitter/tweet/advanced_search` 和 OpenRouter chat completion
3. 30 分钟调度，发现后触发浏览器推送 + 邮件
4. 确认 Web 版本稳定后，再将热点发现能力封装为 Agent Skills

---

> 说明：本设计基于最新检索到的 OpenRouter 文档和 twitterapi.io 文档，采用当前可用的 `X-API-Key` 认证、OpenRouter `chat.completions` 接口及 twitterapi.io `advanced_search` endpoint。
