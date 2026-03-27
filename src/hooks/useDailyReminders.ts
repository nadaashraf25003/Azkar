import { useEffect } from 'react'
import { isSameDay } from '../utils/time'

const REMINDER_HOURS = [7, 17]
const LAST_NOTIFICATION_KEY = 'azkar-last-reminder-date'

export function useDailyReminders(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }

    const checkReminder = () => {
      if (Notification.permission !== 'granted') {
        return
      }

      const now = new Date()
      const hour = now.getHours()

      if (!REMINDER_HOURS.includes(hour)) {
        return
      }

      const savedDate = localStorage.getItem(LAST_NOTIFICATION_KEY)
      if (savedDate) {
        const last = new Date(savedDate)
        if (isSameDay(last, now)) {
          return
        }
      }

      new Notification('Azkar Reminder', {
        body: 'Time for your daily Adhkar. Keep your heart connected.',
      })
      localStorage.setItem(LAST_NOTIFICATION_KEY, now.toISOString())
    }

    const interval = window.setInterval(checkReminder, 60_000)
    checkReminder()

    return () => {
      window.clearInterval(interval)
    }
  }, [enabled])
}
