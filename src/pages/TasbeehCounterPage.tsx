import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTasbeehPresets, useDeleteTasbeehPreset } from '../hooks/useTasbeeh'
import { BackendErrorState } from '../components/BackendErrorState'
import { AddTasbeehModal } from '../components/AddTasbeehModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { apiClient } from '../API/Config.js'
import { URLS } from '../API/URLs.ts'
import { getDeviceId } from '../API/token.ts'

type TargetMode = '33' | '100' | 'custom'

interface TasbeehPreset {
  id: string
  labelAr: string
  labelEn: string
  benefit?: string
  targetCount?: number
  isCustom?: boolean
}

interface TasbeehSessionEntry {
  id: string
  dateKey: string
  createdAt: string
  presetId: string
  count: number
  target: number
  completed: boolean
}

const DEFAULT_PRESETS: TasbeehPreset[] = [
  { id: 'subhanallah', labelAr: 'سُبْحَانَ الله', labelEn: 'SubhanAllah' },
  { id: 'alhamdulillah', labelAr: 'الْحَمْدُ لِلَّه', labelEn: 'Alhamdulillah' },
  { id: 'allahuakbar', labelAr: 'اللهُ أَكْبَر', labelEn: 'Allahu Akbar' },
]

const MAX_HISTORY_ITEMS = 120

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function createEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatDayLabel(dateKey: string, language: 'ar' | 'en'): string {
  const date = new Date(`${dateKey}T00:00:00`)
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTimeLabel(value: string, language: 'ar' | 'en'): string {
  return new Date(value).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TasbeehCounterPage() {
  const { language } = useSettings()

  // Admin authentication state
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const isAdmin = isAdminAuthenticated || viewerRole === 'admin'

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

  const {
    data: backendPresets,
    isLoading: isPresetsLoading,
    isError: isPresetsError,
    refetch: refetchPresets,
  } = useTasbeehPresets()

  const deleteMutation = useDeleteTasbeehPreset()

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const presets = useMemo<TasbeehPreset[]>(() => {
    const list = Array.isArray(backendPresets)
      ? backendPresets
      : (backendPresets as any)?.value

    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any) => ({
        id: item.id,
        labelAr: item.arabicText || item.name,
        labelEn: item.transliteration || item.name,
        benefit: item.benefit,
        targetCount: item.targetCount,
        isCustom: item.isCustom,
      }))
    }

    return DEFAULT_PRESETS
  }, [backendPresets])

  const [targetMode, setTargetMode] = useLocalStorage<TargetMode>('azkar-tasbeeh-target-mode', '33')
  const [customTarget, setCustomTarget] = useLocalStorage<number>('azkar-tasbeeh-custom-target', 33)
  const [vibrateEnabled, setVibrateEnabled] = useLocalStorage<boolean>('azkar-tasbeeh-vibrate', true)
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('azkar-tasbeeh-sound', false)
  const [presetCounters, setPresetCounters] = useLocalStorage<Record<string, number>>(
    'azkar-tasbeeh-preset-counters',
    {},
  )
  const [sessionHistory, setSessionHistory] = useLocalStorage<TasbeehSessionEntry[]>(
    'azkar-tasbeeh-session-history',
    [],
  )
  const audioContextRef = useRef<AudioContext | null>(null)

  const targetCount = useMemo(() => {
    if (targetMode === '33') return 33
    if (targetMode === '100') return 100
    return Math.max(1, customTarget)
  }, [customTarget, targetMode])

  const groupedHistory = useMemo(() => {
    const groups = new Map<string, TasbeehSessionEntry[]>()
    for (const item of sessionHistory) {
      const current = groups.get(item.dateKey) ?? []
      current.push(item)
      groups.set(item.dateKey, current)
    }
    return Array.from(groups.entries())
  }, [sessionHistory])

  const getPresetLabel = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId)
    if (!found) return presetId
    return language === 'ar' ? found.labelAr : found.labelEn
  }

  const triggerFeedback = () => {
    if (vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20)
      } catch {
        // ignore
      }
    }

    if (!soundEnabled) return

    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx()
      }

      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        void ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch {
      // ignore
    }
  }

  const savePresetSession = (presetId: string) => {
    const count = presetCounters[presetId] ?? 0
    if (count <= 0) return

    const completed = count >= targetCount
    const nextEntry: TasbeehSessionEntry = {
      id: createEntryId(),
      dateKey: getTodayKey(),
      createdAt: new Date().toISOString(),
      presetId,
      count,
      target: targetCount,
      completed,
    }

    setSessionHistory((prev) => [nextEntry, ...prev].slice(0, MAX_HISTORY_ITEMS))

    // Background sync to backend API
    try {
      const deviceId = getDeviceId()
      const presetObj = presets.find((p) => p.id === presetId)
      const zikrName = presetObj ? presetObj.labelAr : presetId
      void apiClient.post(URLS.TASBEEH.SESSION, {
        deviceIdentifier: deviceId,
        zikrName,
        totalCount: count,
      }).catch(() => {})
    } catch {
      // ignore
    }
  }

  const incrementPreset = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    const next = current + 1
    setPresetCounters((prev) => ({ ...prev, [presetId]: next }))
    triggerFeedback()

    if (next === targetCount) {
      savePresetSession(presetId)
    }
  }

  const decrementPreset = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    if (current <= 0) return
    setPresetCounters((prev) => ({ ...prev, [presetId]: current - 1 }))
    triggerFeedback()
  }

  const resetPreset = (presetId: string) => {
    setPresetCounters((prev) => ({ ...prev, [presetId]: 0 }))
  }

  const handleDeleteClick = (preset: TasbeehPreset, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget({
      isOpen: true,
      id: preset.id,
      title: preset.labelAr || preset.labelEn,
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', title: '' })
      showToast(
        language === 'ar'
          ? 'تم حذف ذكر التسبيح بنجاح من الخادم.'
          : 'Tasbeeh preset deleted successfully from backend.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الذكر من الخادم.'
            : 'Failed to delete preset from backend.')
      )
    }
  }

  const exportPdfHistory = () => {
    if (sessionHistory.length === 0) {
      alert(language === 'ar' ? 'لا يوجد سجل لتصديره.' : 'No history to export.')
      return
    }

    const title = language === 'ar' ? 'سجل جلسات التسبيح' : 'Tasbeeh Session History'
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = '700px'
    container.style.padding = '24px'
    container.style.background = '#ffffff'
    container.style.color = '#111827'
    container.style.fontFamily = 'Cairo, sans-serif'
    container.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')

    const dateStr = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let rowsHtml = ''
    for (const [dateKey, entries] of groupedHistory) {
      const dayLabel = formatDayLabel(dateKey, language)
      for (const entry of entries) {
        const timeLabel = formatTimeLabel(entry.createdAt, language)
        const name = getPresetLabel(entry.presetId)
        const status = entry.completed
          ? language === 'ar' ? 'مكتمل' : 'Completed'
          : language === 'ar' ? 'جزئي' : 'Partial'
        rowsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px;">${dayLabel}</td>
            <td style="padding: 8px;">${timeLabel}</td>
            <td style="padding: 8px; font-weight: bold;">${name}</td>
            <td style="padding: 8px;">${entry.count} / ${entry.target}</td>
            <td style="padding: 8px;">${status}</td>
          </tr>
        `
      }
    }

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 22px; margin: 0 0 6px 0; color: #047857;">${title}</h2>
        <p style="font-size: 13px; color: #6b7280; margin: 0;">${dateStr}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: ${language === 'ar' ? 'right' : 'left'};">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #d1d5db;">
            <th style="padding: 8px;">${language === 'ar' ? 'اليوم' : 'Day'}</th>
            <th style="padding: 8px;">${language === 'ar' ? 'الوقت' : 'Time'}</th>
            <th style="padding: 8px;">${language === 'ar' ? 'الذكر' : 'Preset'}</th>
            <th style="padding: 8px;">${language === 'ar' ? 'العدد' : 'Count'}</th>
            <th style="padding: 8px;">${language === 'ar' ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `

    document.body.appendChild(container)

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      })

      doc.html(container, {
        callback: (pdf) => {
          pdf.save(`tasbeeh-history-${getTodayKey()}.pdf`)
          document.body.removeChild(container)
        },
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 700,
      })
    } catch {
      document.body.removeChild(container)
    }
  }

  const clearHistory = () => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من مسح سجل الجلسات بالكامل؟'
        : 'Are you sure you want to clear all session history?',
    )

    if (!confirmed) return
    setSessionHistory([])
  }

  if (isPresetsError) {
    return <BackendErrorState />
  }

  return (
    <section className="space-y-4 md:space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[var(--panel)] px-4 py-3 text-emerald-600 shadow-2xl transition-all animate-bounce dark:text-emerald-400">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
        </div>
      ) : null}

      {/* Admin Status Banner */}
      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--brand-500)]/30 bg-[var(--brand-500)]/10 p-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-500)]/20 text-xs">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-[var(--brand-700)] dark:text-[var(--brand-400)]">
                {language === 'ar'
                  ? 'وضع تحكم المشرف نشط (عداد التسبيح)'
                  : 'Admin Control Active (Tasbeeh Counter)'}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة أذكار جديدة للعداد أو حذفها مباشرة من الخادم'
                  : 'You can add or delete tasbeeh presets directly from the backend database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/tasbeeh"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--brand-500)]/40 bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-[var(--brand-700)] transition hover:bg-[var(--brand-500)]/10 dark:text-[var(--brand-400)]"
            >
              <span>{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-600)] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--brand-700)] active:scale-95"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add New Preset'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl md:text-4xl">
            {language === 'ar' ? 'عداد التسبيح' : 'Tasbeeh Counter'}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'أذكار وتسبيحات إلكترونية مع تتبع دقيق للجلسات والأهداف'
              : 'Digital tasbeeh counter with session history and customizable targets'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetchPresets()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{language === 'ar' ? 'تحديث الأذكار' : 'Refresh'}</span>
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-600)] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--brand-700)] active:scale-95"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة ذكر' : 'Add Preset'}</span>
            </button>
          ) : null}
        </div>
      </div>

      <article className="space-y-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
            {language === 'ar' ? 'وضع العد المتقدم' : 'Advanced Counter Mode'}
          </p>
          <h2 className="font-title text-xl text-[var(--text-strong)] sm:text-2xl">
            {language === 'ar' ? 'أوضاع 33 / 100 / مخصص' : '33 / 100 / Custom Modes'}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['33', '100', 'custom'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTargetMode(mode)}
              className={[
                'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                targetMode === mode
                  ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                  : 'border-[var(--line)] hover:border-[var(--brand-500)]',
              ].join(' ')}
            >
              {mode === '33'
                ? '33'
                : mode === '100'
                  ? '100'
                  : language === 'ar'
                    ? 'مخصص'
                    : 'Custom'}
            </button>
          ))}
        </div>

        {targetMode === 'custom' ? (
          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'الهدف المخصص' : 'Custom target'}
            <input
              type="number"
              min={1}
              value={customTarget}
              onChange={(event) => {
                const next = Number(event.target.value)
                setCustomTarget(Number.isFinite(next) && next > 0 ? Math.round(next) : 1)
              }}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ) : null}

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vibrateEnabled}
              onChange={(event) => setVibrateEnabled(event.target.checked)}
            />
            {language === 'ar' ? 'اهتزاز عند كل ضغطة' : 'Vibrate on each tap'}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
            />
            {language === 'ar' ? 'صوت عند كل ضغطة' : 'Sound on each tap'}
          </label>
        </div>
      </article>

      {/* Presets Grid */}
      {isPresetsLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-500)] border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري تحميل أذكار العداد...' : 'Loading presets...'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const current = presetCounters[preset.id] ?? 0
            const isDone = current >= targetCount
            const progress = Math.min(100, Math.round((current / targetCount) * 100))

            return (
              <article
                key={preset.id}
                onClick={() => incrementPreset(preset.id)}
                className={[
                  'relative cursor-pointer rounded-2xl border p-4 transition duration-300 hover:shadow-md active:scale-[0.98]',
                  isDone ? 'border-[var(--ok)] bg-[var(--brand-100)]' : 'border-[var(--line)] bg-[var(--panel)]',
                ].join(' ')}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    {current} / {targetCount}
                  </span>

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(preset, e)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
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

                <p className="text-lg font-semibold text-[var(--text-strong)]" dir="rtl">
                  {language === 'ar' ? preset.labelAr : preset.labelEn}
                </p>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-500)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      decrementPreset(preset.id)
                    }}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--brand-500)]"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      incrementPreset(preset.id)
                    }}
                    disabled={isDone}
                    className={[
                      'rounded-lg px-3 py-2 text-sm font-semibold text-white transition',
                      isDone ? 'cursor-not-allowed bg-[var(--muted)]' : 'bg-[var(--brand-500)]',
                    ].join(' ')}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      savePresetSession(preset.id)
                    }}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--brand-500)]"
                  >
                    {language === 'ar' ? 'حفظ الجلسة' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      resetPreset(preset.id)
                    }}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--brand-500)]"
                  >
                    {language === 'ar' ? 'تصفير' : 'Reset'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <article className="space-y-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
              {language === 'ar' ? 'السجل والتقارير' : 'History & Reports'}
            </p>
            <h2 className="font-title text-xl text-[var(--text-strong)]">
              {language === 'ar' ? 'سجل الجلسات' : 'Sessions Log'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportPdfHistory}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
            >
              {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
            </button>

            <button
              type="button"
              onClick={clearHistory}
              className="rounded-lg border border-[var(--warn)] px-3 py-2 text-xs font-semibold text-[var(--warn)]"
            >
              {language === 'ar' ? 'مسح السجل' : 'Clear History'}
            </button>
          </div>
        </div>

        {groupedHistory.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {language === 'ar'
              ? 'لا توجد جلسات محفوظة بعد.'
              : 'No saved tasbeeh sessions yet.'}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {groupedHistory.map(([dateKey, entries]) => (
              <div key={dateKey} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  {formatDayLabel(dateKey, language)}
                </p>
                <div className="mt-2 space-y-1">
                  {entries.map((entry) => (
                    <p key={entry.id} className="text-xs text-[var(--muted)]">
                      {formatTimeLabel(entry.createdAt, language)} - {getPresetLabel(entry.presetId)}: {entry.count}/{entry.target}{' '}
                      {entry.completed
                        ? language === 'ar'
                          ? '(مكتمل)'
                          : '(Completed)'
                        : language === 'ar'
                          ? '(جزئي)'
                          : '(Partial)'}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* ADD TASBEEH MODAL */}
      <AddTasbeehModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة ذكر التسبيح بنجاح إلى الخادم.'
              : 'New tasbeeh preset added successfully to backend.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف ذكر التسبيح من الخادم"
        titleEn="Confirm Preset Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا الذكر نهائياً من قاعدة بيانات العداد في الخادم؟"
        messageEn="Are you sure you want to permanently delete this preset from the backend database?"
        itemTitle={deleteTarget.title}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', title: '' })}
      />
    </section>
  )
}
