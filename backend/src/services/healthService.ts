import { getServerInfo } from '../utils/serverInfo.js'

export interface HealthResponse {
  status: string
  timestamp: string
  uptime: number
  version: string
}

export const getHealth = (): HealthResponse => {
  const info = getServerInfo()
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: info.version,
  }
}
