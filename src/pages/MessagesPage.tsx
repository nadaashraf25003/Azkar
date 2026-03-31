import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

type MessageType = string

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  religious: { ar: 'دينية', en: 'Religious' },
  reflection: { ar: 'خواطر', en: 'Reflections' },
  quran: { ar: 'آيات', en: 'Quran' },
  hadith: { ar: 'حديث', en: 'Hadith' },
  dua: { ar: 'دعاء', en: 'Dua' },
  motivation: { ar: 'تحفيز', en: 'Motivation' },
}

interface MessageItem {
  id: string
  type: MessageType
  titleAr: string
  titleEn: string
  textAr: string
  textEn: string
  authorAr: string
  authorEn: string
}

interface TypeCardMeta {
  type: string
  titleAr: string
  titleEn: string
  imageUrl: string
}

const TYPE_CARD_META: TypeCardMeta[] = [
  {
    type: 'motivation',
    titleAr: 'عبارات تحفيزية',
    titleEn: 'Motivational Quotes',
    imageUrl: 'https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'religious',
    titleAr: 'إسلامية',
    titleEn: 'Islamic',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'quran',
    titleAr: 'آيات قرآنية',
    titleEn: 'Quran Verses',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'dua',
    titleAr: 'أدعية وأذكار',
    titleEn: 'Dua and Azkar',
    imageUrl: 'https://images.unsplash.com/photo-1609592806596-4d55dfd0b5ed?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'hadith',
    titleAr: 'حديث نبوي',
    titleEn: 'Prophetic Hadith',
    imageUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'reflection',
    titleAr: 'عبارات وخواطر',
    titleEn: 'Words and Reflections',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
  },
]

async function fetchMessages(): Promise<MessageItem[]> {
  const response = await fetch('/data/messages.json')

  if (!response.ok) {
    throw new Error('Failed to load messages')
  }

  return (await response.json()) as MessageItem[]
}

export function MessagesPage() {
  const { language } = useSettings()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['messages-data'],
    queryFn: fetchMessages,
    staleTime: Infinity,
  })

  const typeCards = useMemo(() => {
    if (!data) {
      return []
    }

    const counts = new Map<string, number>()
    data.forEach((item) => {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1)
    })

    const cardsFromMeta = TYPE_CARD_META
      .filter((item) => counts.has(item.type))
      .map((item, index) => ({
        ...item,
        count: counts.get(item.type) ?? 0,
        trend: (index * 17 + (counts.get(item.type) ?? 0) * 11) % 100,
      }))

    const extraTypes = Array.from(counts.keys())
      .filter((type) => !TYPE_CARD_META.some((meta) => meta.type === type))
      .map((type, index) => ({
        type,
        titleAr: getTypeLabel(type, 'ar'),
        titleEn: getTypeLabel(type, 'en'),
        imageUrl:
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80',
        count: counts.get(type) ?? 0,
        trend: (index * 13 + 21) % 100,
      }))

    return [...cardsFromMeta, ...extraTypes]
  }, [data])

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل الرسائل...' : 'Loading messages...'}</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل الرسائل.' : 'Failed to load messages.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-7">
        <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[var(--brand-500)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-[var(--brand-600)]/20 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-600)]">
            {language === 'ar' ? 'رسائل يومية' : 'Daily Messages'}
          </p>
          <h1 className="mt-2 font-title text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl md:text-5xl">
            {language === 'ar' ? 'اختر نوع الرسائل' : 'Choose Message Type'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--muted)] md:text-base">
            {language === 'ar'
              ? 'واجهة أجمل لاكتشاف الرسائل حسب النوع. اضغط أي بطاقة للانتقال مباشرة إلى صفحة هذا النوع.'
              : 'A polished way to explore messages by category. Tap any card to open that type page directly.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
              {language === 'ar' ? `إجمالي الرسائل: ${data.length}` : `Total messages: ${data.length}`}
            </span>
            <span className="rounded-full bg-[var(--brand-500)] px-3 py-1 text-xs font-semibold text-white">
              {language === 'ar' ? `عدد الأنواع: ${typeCards.length}` : `Types: ${typeCards.length}`}
            </span>
          </div>
        </div>
      </div>

      {typeCards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد أنواع رسائل متاحة.' : 'No message types available.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {typeCards.map((card) => (
            <Link
              key={card.type}
              to={`/messages/type/${card.type}`}
              className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={language === 'ar' ? card.titleAr : card.titleEn}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-700)] backdrop-blur-sm">
                    {language === 'ar' ? 'اضغط للعرض' : 'Tap to open'}
                  </span>
                  <span className="rounded-full bg-[var(--brand-500)] px-2.5 py-1 text-[11px] font-semibold text-white">
                    +{card.trend}
                  </span>
                </div>
              </div>

              <div className="space-y-2 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
                <p
                  className="line-clamp-1 text-center text-lg font-semibold text-[var(--text-strong)] sm:text-xl"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {language === 'ar' ? card.titleAr : card.titleEn}
                </p>

                <div className="flex items-center justify-center">
                  <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {language === 'ar' ? `عدد الرسائل: ${card.count}` : `Messages: ${card.count}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function getTypeLabel(type: string, language: 'ar' | 'en'): string {
  const labels = TYPE_LABELS[type]
  if (!labels) {
    return type
  }

  return language === 'ar' ? labels.ar : labels.en
}