import type { AzkarCategory } from '../types/azkar'

export const MORNING_START_HOUR = 4
export const EVENING_START_HOUR = 15

export function getAutoDailyCategory(date: Date = new Date()): AzkarCategory {
  const hour = date.getHours()

  if (hour >= MORNING_START_HOUR && hour < EVENING_START_HOUR) {
    return 'morning'
  }

  return 'evening'
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
