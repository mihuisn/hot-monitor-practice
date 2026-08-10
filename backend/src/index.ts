import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import cron from 'node-cron'
import { healthRouter } from './routes/health.js'
import { keywordRouter } from './routes/keywords.js'
import { hotspotRouter } from './routes/hotspots.js'
import { collectRouter } from './routes/collect.js'
import { initSocketServer } from './lib/socket.js'
import { runCollect } from './services/collectService.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/keywords', keywordRouter)
app.use('/api/hotspots', hotspotRouter)
app.use('/api/collect', collectRouter)

app.get('/', (_req, res) => {
  res.json({ message: 'Hot Monitor API Server' })
})

app.use((_req, res) => {
  res.status(404).json({ code: 404, message: 'Not Found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ code: 500, message: 'Internal Server Error' })
})

// 用 http.Server 包裹 express，以便挂载 Socket.io
const server = http.createServer(app)
initSocketServer(server)

// 定时采集任务：默认每 30 分钟执行一次（可通过 COLLECT_INTERVAL_MINUTES 调整）
const intervalMinutes = Math.max(1, Number(process.env.COLLECT_INTERVAL_MINUTES) || 30)
const cronExpr = `*/${intervalMinutes} * * * *`
cron.schedule(cronExpr, async () => {
  console.log(`[cron] 触发定时采集 (${cronExpr})`)
  try {
    await runCollect()
  } catch (err) {
    console.error('[cron] 采集异常:', (err as Error).message)
  }
})
console.log(`[cron] 定时采集已注册: ${cronExpr}`)

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
