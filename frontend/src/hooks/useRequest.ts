import { useState, useCallback } from 'react'

interface UseRequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useRequest<T = unknown>() {
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const run = useCallback(async (fetcher: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await fetcher()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败'
      setState({ data: null, loading: false, error: message })
      throw error
    }
  }, [])

  return { ...state, run }
}
