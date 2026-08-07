import { Router } from 'express'
import { getHealth } from '../services/healthService.js'

const router = Router()

router.get('/', (_req, res) => {
  try {
    const health = getHealth()
    res.json(health)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export const healthRouter = router
