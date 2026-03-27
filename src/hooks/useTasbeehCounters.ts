import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type CounterMap = Record<string, number>

const COUNTERS_STORAGE_KEY = 'azkar-counters'

export function useTasbeehCounters() {
  const [counters, setCounters] = useLocalStorage<CounterMap>(COUNTERS_STORAGE_KEY, {})

  useEffect(() => {
    const resetOnRefresh = () => {
      localStorage.removeItem(COUNTERS_STORAGE_KEY)
    }

    window.addEventListener('beforeunload', resetOnRefresh)

    return () => {
      window.removeEventListener('beforeunload', resetOnRefresh)
    }
  }, [])

  const setCounter = useCallback(
    (id: string, nextValue: number) => {
      setCounters((prev) => ({ ...prev, [id]: Math.max(0, nextValue) }))
    },
    [setCounters],
  )

  const increment = useCallback(
    (id: string) => {
      setCounters((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
    },
    [setCounters],
  )

  const decrement = useCallback(
    (id: string) => {
      setCounters((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }))
    },
    [setCounters],
  )

  const resetCounter = useCallback(
    (id: string) => {
      setCounters((prev) => ({ ...prev, [id]: 0 }))
    },
    [setCounters],
  )

  return { counters, setCounter, increment, decrement, resetCounter }
}
