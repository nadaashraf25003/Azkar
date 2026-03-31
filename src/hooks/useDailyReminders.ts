import { useEffect } from 'react'
import type { MessageItem } from '../types/message'
import { getMessageOfDay } from '../utils/messages'
import { isSameDay } from '../utils/time'

const REMINDER_HOURS = [7, 17]
const MESSAGE_NOTIFICATION_HOUR = 9
const MESSAGES_PATH = `${import.meta.env.BASE_URL}data/messages.json`
const LAST_REMINDER_NOTIFICATION_KEY = 'azkar-last-reminder-date'
const LAST_MESSAGE_NOTIFICATION_KEY = 'azkar-last-message-date'

export function useDailyReminders(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }

    const sendMessageOfDayNotification = async (now: Date) => {
      const savedDate = localStorage.getItem(LAST_MESSAGE_NOTIFICATION_KEY)
      if (savedDate) {
        const last = new Date(savedDate)
        if (isSameDay(last, now)) {
          return
        }
      }

      try {
        const response = await fetch(MESSAGES_PATH)
        if (!response.ok) {
          return
        }

        const messages = (await response.json()) as MessageItem[]
        const dailyMessage = getMessageOfDay(messages, now)
        if (!dailyMessage) {
          return
        }

        const isArabic = document.documentElement.lang === 'ar'
        new Notification(isArabic ? 'رسالة اليوم' : 'Message of the day', {
          body: isArabic ? dailyMessage.textAr : dailyMessage.textEn,
        })
        localStorage.setItem(LAST_MESSAGE_NOTIFICATION_KEY, now.toISOString())
      } catch {
        // Ignore message notification fetch failures.
      }
    }

    const checkReminder = () => {
      if (Notification.permission !== 'granted') {
        return
      }

      const now = new Date()
      const hour = now.getHours()

      if (hour === MESSAGE_NOTIFICATION_HOUR) {
        void sendMessageOfDayNotification(now)
      }

      if (!REMINDER_HOURS.includes(hour)) {
        return
      }

      const savedDate = localStorage.getItem(LAST_REMINDER_NOTIFICATION_KEY)
      if (savedDate) {
        const last = new Date(savedDate)
        if (isSameDay(last, now)) {
          return
        }
      }

      new Notification('Azkar Reminder', {
        body: 'Time for your daily Adhkar. Keep your heart connected.',
      })
      localStorage.setItem(LAST_REMINDER_NOTIFICATION_KEY, now.toISOString())
    }

    const interval = window.setInterval(checkReminder, 60_000)
    checkReminder()

    return () => {
      window.clearInterval(interval)
    }
  }, [enabled])
}
