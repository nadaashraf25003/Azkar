import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMessagesData } from '../hooks/useMessagesData'
import type { MessageItem } from '../types/message'
import { useFavorites } from '../context/FavoritesContext'

type SortMode = 'newest' | 'shortest' | 'mostSaved'

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  religious: { ar: 'دينية', en: 'Religious' },
  reflection: { ar: 'خواطر', en: 'Reflections' },
  quran: { ar: 'آيات', en: 'Quran' },
  hadith: { ar: 'حديث', en: 'Hadith' },
  dua: { ar: 'دعاء', en: 'Dua' },
  motivation: { ar: 'تحفيز', en: 'Motivation' },
  gratitude: { ar: 'شكر', en: 'Gratitude' },
  wisdom: { ar: 'حكمة', en: 'Wisdom' },
  community: { ar: 'مجتمع', en: 'Community' },
  action: { ar: 'عمل', en: 'Action' },
}

export function MessageTypePage() {
  const { language } = useSettings()
  const { type = '' } = useParams()
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [savedCounts, setSavedCounts] = useLocalStorage<Record<string, number>>('azkar-message-saves', {})
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data, isLoading, isError } = useMessagesData()
  const { toggleFavorite, isFavorite } = useFavorites()

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

// Assuming types and helpers exist globally or in your context:
// interface MessageItem { type: string; titleAr: string; titleEn: string; textAr: string; textEn: string; authorAr: string; authorEn: string; }
// declare const language: 'ar' | 'en';
// declare function getTypeLabel(type: string, lang: string): string;
// declare function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[];

const generateMessageImageBlob = async (item: MessageItem): Promise<Blob | null> => {
  const width = 1080
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  // Fixed rounded card background path helper
  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  // Type-based aesthetic gradients
  const TYPE_COLORS: Record<string, [string, string]> = {
    religious: ['#0f172a', '#1d4ed8'],
    reflection: ['#0b1220', '#06b6d4'],
    quran: ['#0b1220', '#7c3aed'],
    hadith: ['#071233', '#ef4444'],
    dua: ['#082032', '#f59e0b'],
    motivation: ['#04111f', '#06b6d4'],
  }

  const colors = TYPE_COLORS[item.type] ?? ['#0b1220', '#0f172a']
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, colors[0])
  bgGrad.addColorStop(1, colors[1])

  // Draw master rounded background
  drawRoundedRect(0, 0, width, height, 44)
  ctx.fillStyle = bgGrad
  ctx.fill()

  // Clean vignette highlight circle
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(width - 140, 140, 160, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Soft modern diagonal linear shine
  ctx.save()
  const shine = ctx.createLinearGradient(0, height * 0.2, width, height)
  shine.addColorStop(0, 'rgba(255,255,255,0.05)')
  shine.addColorStop(0.5, 'rgba(255,255,255,0.0)')
  ctx.fillStyle = shine
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // Dynamic Type Badge
  const badgeText = getTypeLabel(item.type, language)
  ctx.save()
  ctx.font = '600 28px Cairo, sans-serif'
  ctx.textBaseline = 'middle'
  const isArabic = language === 'ar'
  
  const badgePadding = 20
  const measured = ctx.measureText(badgeText).width
  const badgeW = Math.min(480, measured + badgePadding * 2)
  const badgeH = 54
  
  // Placement changes depending on language orientation
  const badgeX = isArabic ? width - 56 - badgeW : 56
  const badgeY = 56

  ctx.fillStyle = 'rgba(255,255,255,0.09)'
  drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 22)
  ctx.fill()
  
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = isArabic ? 'right' : 'left'
  ctx.direction = isArabic ? 'rtl' : 'ltr'
  const textStartX = isArabic ? badgeX + badgeW - badgePadding : badgeX + badgePadding
  ctx.fillText(badgeText, textStartX, badgeY + badgeH / 2)
  ctx.restore()

  // Content Selection
  const title = isArabic ? item.titleAr : item.titleEn
  const body = isArabic ? item.textAr : item.textEn
  const author = isArabic ? item.authorAr : item.authorEn

  if (isArabic) {
    // --- ARABIC DESIGN (RTL Right-Aligned Context) ---
    ctx.save()
    ctx.direction = 'rtl'
    ctx.textAlign = 'right'

    const padX = 84
    const panelX = padX
    const panelY = 140
    const panelW = width - padX * 2
    const panelH = height - 320

    // Inner frosted panel
    ctx.fillStyle = 'rgba(255,255,255,0.035)'
    drawRoundedRect(panelX, panelY, panelW, panelH, 30)
    ctx.fill()

    // Title Watermark Background Layer
    ctx.save()
    ctx.globalAlpha = 0.04
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 110px Cairo, sans-serif'
    const watermarkLines = wrapText(ctx, title, panelW - 120).slice(0, 1)
    if (watermarkLines.length > 0) {
      ctx.fillText(watermarkLines[0], panelX + panelW - 40, panelY + 120)
    }
    ctx.restore()

    // Foreground Title
    ctx.font = '800 46px Cairo, sans-serif'
    let y = panelY + 70
    const titleLines = wrapText(ctx, title, panelW - 100).slice(0, 2)
    
    titleLines.forEach((line) => {
      // Subtle dropping crisp shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillText(line, panelX + panelW - 50, y + 3)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(line, panelX + panelW - 50, y)
      y += 62
    })

    // Content Body Layout
    ctx.font = '400 32px Cairo, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    y += 20 // separation gap
    const bodyLines = wrapText(ctx, body, panelW - 100).slice(0, 8)
    for (const line of bodyLines) {
      ctx.fillText(line, panelX + panelW - 50, y)
      y += 50
    }

    // Author positioning signature
    ctx.font = '600 26px Cairo, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(`بقلم: ${author}`, panelX + panelW - 50, panelY + panelH - 50)
    ctx.restore()

  } else {
    // --- LTR DESIGN (Centered Minimal Context) ---
    ctx.save()
    ctx.textAlign = 'center'
    ctx.direction = 'ltr'

    const panelPadding = 120
    const panelX = panelPadding / 2
    const panelY = 160
    const panelW = width - panelPadding
    const panelH = height - 340
    
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    drawRoundedRect(panelX, panelY, panelW, panelH, 28)
    ctx.fill()

    const textX = width / 2
    let y = panelY + 85

    // Multi-pass structural title with dynamic drop shadows
    ctx.font = '800 52px Cairo, sans-serif'
    const titleLines = wrapText(ctx, title, panelW - 120).slice(0, 3)
    
    titleLines.forEach((line) => {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4
      ctx.fillStyle = '#ffffff'
      ctx.fillText(line, textX, y)
      ctx.restore()
      y += 70
    })

    y += 15 // text spacing separation gap

    // Content Body Layout
    ctx.font = '400 34px Cairo, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    const bodyLines = wrapText(ctx, body, panelW - 120).slice(0, 7)
    for (const line of bodyLines) {
      ctx.fillText(line, textX, y)
      y += 54
    }

    // Centered aesthetic separator rules
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(width * 0.25, panelY + panelH - 110, width * 0.5, 2)
    ctx.globalAlpha = 1

    // Centered Author Text
    ctx.font = '600 26px Cairo, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(`By: ${author}`, textX, panelY + panelH - 60)
    ctx.restore()
  }

  // High quality compression conversion output
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
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
                  onClick={() => toggleFavorite(item.id)}
                  className={[
                    'rounded-lg px-3 py-2 text-xs font-semibold transition',
                    isFavorite(item.id)
                      ? 'border border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                      : 'border border-[var(--line)] hover:border-[var(--brand-500)]',
                  ].join(' ')}
                >
                  {isFavorite(item.id)
                    ? language === 'ar'
                      ? 'إزالة من المفضلة'
                      : 'Remove Favorite'
                    : language === 'ar'
                      ? 'أضف إلى المفضلة'
                      : 'Add to Favorites'}
                </button>

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
