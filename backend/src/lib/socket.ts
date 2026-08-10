import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type { Socket } from 'socket.io'

// 全局 Socket.io 实例，由 index.ts 初始化后供 notificationService 使用
let io: SocketIOServer | null = null

/**
 * 初始化 Socket.io 服务，绑定到已有 HTTP server
 */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',') ?? '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log('[socket] 客户端已连接:', socket.id)

    // 前端可加入关键词房间：socket.join('keyword:<text>')
    socket.on('join_keyword', (keywordText: string) => {
      if (typeof keywordText === 'string' && keywordText) {
        socket.join(`keyword:${keywordText}`)
        console.log('[socket] 加入房间 keyword:', keywordText)
      }
    })

    socket.on('disconnect', () => {
      console.log('[socket] 客户端断开:', socket.id)
    })
  })

  return io
}

/**
 * 获取已初始化的 io 实例（未初始化时返回 null）
 */
export function getIO(): SocketIOServer | null {
  return io
}
