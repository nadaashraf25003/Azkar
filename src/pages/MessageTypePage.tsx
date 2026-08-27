import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMessagesData, useDeleteMessage } from '../hooks/useMessagesData'
import type { MessageItem } from '../types/message'
import { useFavorites } from '../context/FavoritesContext'
import { AddMessageModal } from '../components/AddMessageModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'

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

  // Admin authentication state
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const isAdmin = isAdminAuthenticated || viewerRole === 'admin'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean
    id: string
    title: string
  }>({
    isOpen: false,
    id: '',
    title: '',
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useMessagesData()
  const deleteMutation = useDeleteMessage()
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

  // Rounded rectangle path helper
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

  // Draw master background
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

  const isArabic = language === 'ar'
  const centerX = width / 2
  const centerY = height / 2

  // --- CENTERED TYPE BADGE ---
  const badgeText = getTypeLabel(item.type, language)
  ctx.save()
  ctx.font = '600 28px Cairo, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.direction = isArabic ? 'rtl' : 'ltr'
  
  const badgePadding = 24
  const measured = ctx.measureText(badgeText).width
  const badgeW = Math.min(480, measured + badgePadding * 2)
  const badgeH = 54
  const badgeX = centerX - badgeW / 2
  const badgeY = 64

  ctx.fillStyle = 'rgba(255,255,255,0.09)'
  drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 22)
  ctx.fill()
  
  ctx.fillStyle = '#ffffff'
  ctx.fillText(badgeText, centerX, badgeY + badgeH / 2)
  ctx.restore()

  // --- CONTENT CONFIGURATION ---
  const title = isArabic ? item.titleAr : item.titleEn
  const body = isArabic ? item.textAr : item.textEn
  const author = isArabic ? item.authorAr : item.authorEn

  const maxTextWidth = 840 // Constraints text wrapping bounds

  // Set line-height configurations based on typography size
  const titleLineHeight = isArabic ? 64 : 70
  const bodyLineHeight = isArabic ? 52 : 54
  const spaceGap = 30 // Distance between components

  // Measure content line counts dynamically to find true structural height
  ctx.save()
  ctx.font = isArabic ? '800 46px Cairo, sans-serif' : '800 52px Cairo, sans-serif'
  const titleLines = wrapText(ctx, title, maxTextWidth).slice(0, 3)

  ctx.font = isArabic ? '400 32px Cairo, sans-serif' : '400 34px Cairo, sans-serif'
  const bodyLines = wrapText(ctx, body, maxTextWidth).slice(0, 8)
  ctx.restore()

  // Mathematical total height calculation
  const totalTitleHeight = titleLines.length * titleLineHeight
  const totalBodyHeight = bodyLines.length * bodyLineHeight
  const authorHeight = 40
  
  const totalContentHeight = totalTitleHeight + spaceGap + totalBodyHeight + spaceGap + authorHeight

  // Dynamic True Center Beginning Coordinates
  let currentY = centerY - (totalContentHeight / 2) + (titleLineHeight / 2)

  // --- DRAW FROSTED PANEL ENVELOPING CENTER CONTENT ---
  const panelPaddingY = 60
  const panelPaddingX = 60
  const panelW = maxTextWidth + (panelPaddingX * 2)
  const panelH = totalContentHeight + (panelPaddingY * 2)
  const panelX = centerX - (panelW / 2)
  const panelY = centerY - (panelH / 2)

  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  drawRoundedRect(panelX, panelY, panelW, panelH, 32)
  ctx.fill()
  ctx.restore()

  // --- DRAW TEXT (PERFECTLY CENTERED ON BOTH AXES) ---
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = isArabic ? 'rtl' : 'ltr'

  // 1. Render Title Lines
  ctx.font = isArabic ? '800 46px Cairo, sans-serif' : '800 52px Cairo, sans-serif'
  titleLines.forEach((line) => {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 4
    ctx.fillStyle = '#ffffff'
    ctx.fillText(line, centerX, currentY)
    ctx.restore()
    currentY += titleLineHeight
  })

  // Adjust gap tracking pointer
  currentY += spaceGap - (titleLineHeight / 2) + (bodyLineHeight / 2)

  // 2. Render Body Lines
  ctx.font = isArabic ? '400 32px Cairo, sans-serif' : '400 34px Cairo, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  bodyLines.forEach((line) => {
    ctx.fillText(line, centerX, currentY)
    currentY += bodyLineHeight
  })

  // Adjust gap tracking pointer to separator rules line
  currentY += spaceGap - (bodyLineHeight / 2)

  // 3. Render Subtle Separator Line
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(centerX - 150, currentY, 300, 2)
  ctx.globalAlpha = 1

  currentY += 40 // Push below separator line bounds

  // 4. Render Author Text
  ctx.font = '600 26px Cairo, sans-serif'
  ctx.fillStyle = isArabic ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.8)'
  const authorPrefix = isArabic ? 'بقلم: ' : 'By: '
  ctx.fillText(`${authorPrefix}${author}`, centerX, currentY)

  ctx.restore()

  // High quality PNG output execution
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

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleDeleteClick = (item: MessageItem) => {
    setDeleteTarget({
      isOpen: true,
      id: item.id,
      title: (language === 'ar' ? item.textAr : item.textEn).substring(0, 70) + '...',
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', title: '' })
      showToast(
        language === 'ar'
          ? 'تم حذف الرسالة بنجاح من الخادم.'
          : 'Message deleted successfully from backend.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الرسالة من الخادم.'
            : 'Failed to delete message from backend.')
      )
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-3 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'جارٍ تحميل الرسائل من الخادم...' : 'Loading messages from backend...'}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل الرسائل.' : 'Failed to load messages.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[var(--panel)] px-4 py-3 text-emerald-600 shadow-2xl transition-all animate-bounce dark:text-emerald-400">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
        </div>
      ) : null}

      {/* Admin Status Banner */}
      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                {language === 'ar'
                  ? 'وضع تحكم المشرف نشط (الرسائل اليومية)'
                  : 'Admin Control Active (Daily Messages)'}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة رسائل جديدة أو حذفها مباشرة من الخادم'
                  : 'You can add or delete messages directly from the backend database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-500/40 bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-500/10 dark:text-indigo-400"
            >
              <span>{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة رسالة جديدة' : 'Add New Message'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-8 h-48 w-48 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mb-2 flex items-center justify-between">
          <Link
            to="/messages"
            className="text-sm font-semibold text-[var(--brand-600)] transition hover:text-[var(--brand-500)]"
          >
            {language === 'ar' ? '← العودة إلى كل الأنواع' : '← Back to all types'}
          </Link>

          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-[var(--text)] transition hover:border-indigo-500"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
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
        <div className="rounded-3xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">
          <p>{language === 'ar' ? 'لا توجد رسائل لهذا النوع.' : 'No messages found for this type.'}</p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة رسالة لهذا القسم' : 'Add Message to this Type'}</span>
            </button>
          ) : null}
        </div>
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
                
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                    title={language === 'ar' ? 'حذف من الخادم' : 'Delete from backend'}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                  </button>
                ) : null}
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2 leading-8 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.textAr : item.textEn}
              </p>

              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
                <p className="text-sm font-semibold text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 'المصدر / القائل' : 'Source'}: {language === 'ar' ? item.authorAr : item.authorEn}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
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
                      : 'Add Favorite'}
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

      {/* ADD MESSAGE MODAL */}
      <AddMessageModal
        isOpen={isAddModalOpen}
        initialCategory={type || 'religious'}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة الرسالة بنجاح إلى الخادم.'
              : 'New message added successfully to the backend server.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف الرسالة من الخادم"
        titleEn="Confirm Message Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً من قاعدة البيانات في الخادم؟"
        messageEn="Are you sure you want to permanently delete this message from the backend database?"
        itemTitle={deleteTarget.title}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', title: '' })}
      />
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

