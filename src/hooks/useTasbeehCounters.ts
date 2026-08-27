import { useState } from 'react'

export function useTasbeehCounters() {
  const [counters, setCounters] = useState<Record<string, number>>({})

  const setCounter = (id: string, value: number) => {
    setCounters((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }))
  }

  const increment = (id: string) => {
    setCounters((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }))
  }

  const decrement = (id: string) => {
    setCounters((prev) => {
      const current = prev[id] ?? 0
      if (current <= 0) return prev
      return {
        ...prev,
        [id]: current - 1,
      }
    })
  }

  const resetCounter = (id: string) => {
    setCounters((prev) => ({
      ...prev,
      [id]: 0,
    }))
  }

  const resetAll = () => {
    setCounters({})
  }

  return {
    counters,
    setCounter,
    increment,
    decrement,
    resetCounter,
    resetAll,
  }
}
