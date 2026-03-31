import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMessagesData } from '../hooks/useMessagesData'
import type { MessageItem } from '../types/message'

type SortMode = 'newest' | 'shortest' | 'mostSaved'

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  religious: { ar: 'دينية', en: 'Religious' },
  reflection: { ar: 'خواطر', en: 'Reflections' },
  quran: { ar: 'آيات', en: 'Quran' },
  hadith: { ar: 'حديث', en: 'Hadith' },
  dua: { ar: 'دعاء', en: 'Dua' },
  motivation: { ar: 'تحفيز', en: 'Motivation' },
}

export function MessageTypePage() {
  const { language } = useSettings()
  const { type = '' } = useParams()
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [savedCounts, setSavedCounts] = useLocalStorage<Record<string, number>>('azkar-message-saves', {})
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data, isLoading, isError } = useMessagesData()

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const base = data.filter((item) => item.type === type)

    return [...base].sort((first, second) => {
      if (sortMode === 'shortest') {
        const firstText = language === 'ar' ? first.textAr : first.textEn
        const secondText = language === 'ar' ? second.textAr : second.textEn
        return firstText.length - secondText.length
      }

      if (sortMode === 'mostSaved') {
        const secondScore = savedCounts[second.id] ?? 0
        const firstScore = savedCounts[first.id] ?? 0
        return secondScore - firstScore
      }

      const firstDate = Date.parse(first.createdAt)
      const secondDate = Date.parse(second.createdAt)
      return secondDate - firstDate
    })
  }, [data, language, savedCounts, sortMode, type])

  const availableTypes = useMemo(() => {
    if (!data) {
      return []
    }

    return Array.from(new Set(data.map((item) => item.type)))
  }, [data])

  const increaseSaveCount = (messageId: string) => {
    setSavedCounts((prev) => ({ ...prev, [messageId]: (prev[messageId] ?? 0) + 1 }))
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let current = ''

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word
      if (ctx.measureText(next).width <= maxWidth) {
        current = next
      } else {
        if (current) {
          lines.push(current)
        }
        current = word
      }
    })

    if (current) {
      lines.push(current)
    }

    return lines
  }

  const generateMessageImageBlob = async (item: MessageItem): Promise<Blob | null> => {
    const width = 1080
    const height = 1080
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1d4ed8')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.arc(width - 140, 140, 120, 0, Math.PI * 2)
    ctx.fill()

    const title = language === 'ar' ? item.titleAr : item.titleEn
    const body = language === 'ar' ? item.textAr : item.textEn
    const author = language === 'ar' ? item.authorAr : item.authorEn

    ctx.fillStyle = '#ffffff'
    ctx.font = '700 52px Cairo, sans-serif'
    ctx.textAlign = language === 'ar' ? 'right' : 'left'
    const textX = language === 'ar' ? width - 80 : 80

    const titleLines = wrapText(ctx, title, width - 160).slice(0, 2)
    let y = 180
    titleLines.forEach((line) => {
      ctx.fillText(line, textX, y)
      y += 70
    })

    ctx.font = '400 38px Cairo, sans-serif'
    const bodyLines = wrapText(ctx, body, width - 160).slice(0, 10)
    y += 20
    bodyLines.forEach((line) => {
      ctx.fillText(line, textX, y)
      y += 56
    })

    ctx.font = '600 30px Cairo, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`${language === 'ar' ? 'بقلم' : 'By'}: ${author}`, textX, height - 90)

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  const saveMessageAsImage = async (item: MessageItem) => {
    setBusyId(item.id)
    try {
      const blob = await generateMessageImageBlob(item)
      if (!blob) {
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `message-${item.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      increaseSaveCount(item.id)
    } finally {
      setBusyId(null)
    }
  }

  const shareMessageAsImage = async (item: MessageItem) => {
    setBusyId(item.id)
    try {
      const blob = await generateMessageImageBlob(item)
      if (!blob) {
        return
      }

      const file = new File([blob], `message-${item.id}.png`, { type: 'image/png' })
      const title = language === 'ar' ? item.titleAr : item.titleEn
      const text = language === 'ar' ? item.textAr : item.textEn

      if (
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        'canShare' in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title, text })
      } else if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ title, text })
      } else {
        await saveMessageAsImage(item)
        return
      }

      increaseSaveCount(item.id)
    } catch {
      // Ignore cancelled share operation.
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل الرسائل...' : 'Loading messages...'}</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل الرسائل.' : 'Failed to load messages.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[var(--brand-500)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-8 h-48 w-48 rounded-full bg-[var(--brand-600)]/20 blur-3xl" />

        <div className="relative mb-2">
          <Link
            to="/messages"
            className="text-sm font-semibold text-[var(--brand-600)] transition hover:text-[var(--brand-500)]"
          >
            {language === 'ar' ? 'العودة إلى كل الأنواع' : 'Back to all types'}
          </Link>
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-600)]">
            {language === 'ar' ? 'نوع الرسائل' : 'Message Type'}
          </p>
          <h1 className="mt-2 font-title text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl md:text-5xl">
            {getTypeLabel(type, language)}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--muted)] md:text-base">
            {language === 'ar'
              ? 'تصفح كل الرسائل داخل هذا النوع مع تصميم مريح للقراءة.'
              : 'Browse all messages in this category with a cleaner reading experience.'}
          </p>

          <div className="mt-4 inline-flex rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
            {language === 'ar' ? `عدد الرسائل: ${filtered.length}` : `Messages: ${filtered.length}`}
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {availableTypes.map((itemType) => (
          <Link
            key={itemType}
            to={`/messages/type/${itemType}`}
            className={[
              'shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition',
              type === itemType
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white shadow-sm'
                : 'border-[var(--line)] text-[var(--text)] hover:border-[var(--brand-500)] hover:bg-[var(--brand-100)]',
            ].join(' ')}
          >
            {getTypeLabel(itemType, language)}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2">
        {([
          { key: 'newest', ar: 'الأحدث', en: 'Newest' },
          { key: 'shortest', ar: 'الأقصر', en: 'Shortest' },
          { key: 'mostSaved', ar: 'الأكثر حفظًا', en: 'Most Saved' },
        ] as const).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSortMode(option.key)}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-semibold transition',
              sortMode === option.key
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] hover:border-[var(--brand-500)]',
            ].join(' ')}
          >
            {language === 'ar' ? option.ar : option.en}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد رسائل لهذا النوع.' : 'No messages found for this type.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
                  {getTypeLabel(item.type, language)}
                </span>
                <span className="text-xs font-semibold text-[var(--muted)]">#{item.id}</span>
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2 leading-8 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.textAr : item.textEn}
              </p>

              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
                <p className="text-sm font-semibold text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 'بقلم' : 'By'}: {language === 'ar' ? item.authorAr : item.authorEn}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveMessageAsImage(item)}
                  disabled={busyId === item.id}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold transition hover:border-[var(--brand-500)]"
                >
                  {busyId === item.id
                    ? language === 'ar'
                      ? 'جاري التحضير...'
                      : 'Preparing...'
                    : language === 'ar'
                      ? 'حفظ كصورة'
                      : 'Save as Image'}
                </button>

                <button
                  type="button"
                  onClick={() => shareMessageAsImage(item)}
                  disabled={busyId === item.id}
                  className="rounded-lg bg-[var(--brand-500)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  {language === 'ar' ? 'مشاركة البطاقة' : 'Share Card'}
                </button>

                <span className="rounded-lg border border-[var(--line)] px-2.5 py-2 text-xs font-semibold text-[var(--muted)]">
                  {language === 'ar'
                    ? `عدد الحفظ: ${savedCounts[item.id] ?? 0}`
                    : `Saved: ${savedCounts[item.id] ?? 0}`}
                </span>
              </div>
            </article>
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
