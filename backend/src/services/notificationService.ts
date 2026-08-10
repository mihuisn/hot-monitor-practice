import { prisma } from '../lib/prisma.js'
import { getIO } from '../lib/socket.js'
import type { Hotspot } from '@prisma/client'

// ---- 系统通知：入库 + 实时推送 + 邮件 ----

export interface HotspotNotifyInput {
  hotspot: Hotspot
  keywordText: string
  // AI 分析结果中需要广播的字段
  importance: string
  summary: string | null
}

/**
 * 触发新热点的全部通知渠道（原子性由调用方保证，这里只做通知分发）：
 * 1. 写入 Notification 表（类型 hotspot）
 * 2. WebSocket 推送 hotspot:new 到关键词房间
 * 3. WebSocket 全局广播 notification 事件
 * 4. 当 importance 为 high/urgent 时发送邮件
 */
export async function notifyNewHotspot(input: HotspotNotifyInput): Promise<void> {
  const { hotspot, keywordText, importance, summary } = input

  const title = hotspot.title
  const notifyContent = `发现新热点: ${title}${summary ? `\n摘要: ${summary}` : ''}`

  // 1. 写入 Notification 表
  try {
    await prisma.notification.create({
      data: {
        type: 'hotspot',
        title: `发现新热点: ${title}`,
        content: notifyContent,
        hotspotId: hotspot.id,
      },
    })
  } catch (err) {
    console.error('[notify] 写入 Notification 失败:', (err as Error).message)
  }

  // 2 & 3. WebSocket 推送
  const io = getIO()
  if (io) {
    try {
      // 事件1：推送到关键词房间
      io.to(`keyword:${keywordText}`).emit('hotspot:new', {
        hotspotId: hotspot.id,
        keyword: keywordText,
        title,
        source: hotspot.source,
        importance,
        summary,
        url: hotspot.url,
      })
      // 事件2：全局广播通知
      io.emit('notification', {
        title,
        importance,
        source: hotspot.source,
        hotspotId: hotspot.id,
        summary,
      })
    } catch (err) {
      console.error('[notify] WebSocket 推送失败:', (err as Error).message)
    }
  }

  // 4. 邮件告警：仅 high / urgent
  if (importance === 'high' || importance === 'urgent') {
    try {
      await sendHotspotEmail({ title, content: notifyContent, importance, url: hotspot.url, keywordText })
    } catch (err) {
      console.error('[notify] 邮件发送失败:', (err as Error).message)
    }
  }
}

interface EmailInput {
  title: string
  content: string
  importance: string
  url: string
  keywordText: string
}

/**
 * 发送热点邮件告警。若 SMTP 未配置则跳过。
 */
export async function sendHotspotEmail(input: EmailInput): Promise<void> {
  const { host, port, secure, user, pass, to } = readSmtpConfig()
  if (!host || !user || !pass || !to) {
    console.warn('[email] SMTP 未完整配置，跳过邮件发送')
    return
  }

  // 动态引入 nodemailer，避免未配置环境加载
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host,
    port: port ?? 587,
    secure: secure ?? false,
    auth: { user, pass },
  })

  const subject = `[热点告警][${input.importance.toUpperCase()}] ${input.title}`
  const text = `${input.content}\n\n关键词: ${input.keywordText}\n链接: ${input.url}`

  await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
  })
  console.log(`[email] 已发送告警邮件 → ${to}: ${input.title}`)
}

function readSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    to: process.env.NOTIFY_EMAIL,
  }
}
