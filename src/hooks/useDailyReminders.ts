import { useEffect } from 'react'
import type { MessageItem } from '../types/message'
import { getMessageOfDay } from '../utils/messages'
import { isSameDay } from '../utils/time'
import { useMessagesData } from './useMessagesData'

const LAST_NOTIFIED_KEY = 'azkar-last-notified-date'

export function useDailyReminders(param?: boolean | MessageItem[]) {
  const { data: fetchedMessages } = useMessagesData()

  const isEnabled = typeof param === 'boolean' ? param : true
  const messages = Array.isArray(param) ? param : (fetchedMessages ?? [])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }

    if (Notification.permission !== 'granted') {
      return
    }

    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY)
    const today = new Date()

    if (lastNotified && isSameDay(new Date(lastNotified), today)) {
      return
    }

    const message = getMessageOfDay(messages)

    if (!message) {
      return
    }

    try {
      new Notification('رسالة اليوم من أذكار', {
        body: `${message.titleAr}: ${message.textAr}`,
        icon: '/favicon.svg',
      })
      localStorage.setItem(LAST_NOTIFIED_KEY, today.toISOString())
    } catch {
      // Ignored for browsers where constructor fails
    }
  }, [isEnabled, messages])
}
