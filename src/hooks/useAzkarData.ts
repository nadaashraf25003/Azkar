import { useQuery } from '@tanstack/react-query'
import type { ZikrItem } from '../types/azkar'

async function fetchAzkar(): Promise<ZikrItem[]> {
  const response = await fetch('/data/azkar.json')

  if (!response.ok) {
    throw new Error('Failed to load Azkar data')
  }

  return (await response.json()) as ZikrItem[]
}

export function useAzkarData() {
  return useQuery({
    queryKey: ['azkar-data'],
    queryFn: fetchAzkar,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
