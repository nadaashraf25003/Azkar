import { useQuery } from '@tanstack/react-query'
import type { ZikrItem } from '../types/azkar'

async function fetchAzkar(dataPath: string): Promise<ZikrItem[]> {
  const response = await fetch(dataPath)

  if (!response.ok) {
    throw new Error('Failed to load Azkar data')
  }

  return (await response.json()) as ZikrItem[]
}

export function useAzkarData(dataPath = '/data/azkar.json') {
  return useQuery({
    queryKey: ['azkar-data', dataPath],
    queryFn: () => fetchAzkar(dataPath),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
