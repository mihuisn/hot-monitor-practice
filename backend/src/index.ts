import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
