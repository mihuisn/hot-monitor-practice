import request from './request'

export type HealthResponse = {
  status: string
  timestamp: string
  uptime: number
  version: string
}

export const getHealth = () => {
  return request.get<HealthResponse>('/health')
}
