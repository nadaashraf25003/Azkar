import { useMemo, useRef } from 'react'
import { jsPDF } from 'jspdf'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

type TargetMode = '33' | '100' | 'custom'

interface TasbeehPreset {
  id: string
  labelAr: string
  labelEn: string
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

const TASBEEH_PRESETS: TasbeehPreset[] = [
  { id: 'subhanallah', labelAr: 'سبحان الله', labelEn: 'SubhanAllah' },
  { id: 'alhamdulillah', labelAr: 'الحمد لله', labelEn: 'Alhamdulillah' },
  { id: 'allahuakbar', labelAr: 'الله أكبر', labelEn: 'Allahu Akbar' },
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
  const [targetMode, setTargetMode] = useLocalStorage<TargetMode>('azkar-tasbeeh-target-mode', '33')
  const [customTarget, setCustomTarget] = useLocalStorage<number>('azkar-tasbeeh-custom-target', 33)
  const [vibrateEnabled, setVibrateEnabled] = useLocalStorage<boolean>('azkar-tasbeeh-vibrate', true)
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('azkar-tasbeeh-sound', false)
  const [presetCounters, setPresetCounters] = useLocalStorage<Record<string, number>>(
    'azkar-tasbeeh-preset-counters',
    TASBEEH_PRESETS.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = 0
      return acc
    }, {}),
  )
  const [sessionHistory, setSessionHistory] = useLocalStorage<TasbeehSessionEntry[]>(
    'azkar-tasbeeh-session-history',
    [],
  )
  const audioContextRef = useRef<AudioContext | null>(null)

  const targetCount = useMemo(() => {
    if (targetMode === '33') {
      return 33
    }

    if (targetMode === '100') {
      return 100
    }

    return Math.max(1, customTarget)
  }, [customTarget, targetMode])

  const groupedHistory = useMemo(() => {
    const groups = new Map<string, TasbeehSessionEntry[]>()

    sessionHistory.forEach((entry) => {
      const existing = groups.get(entry.dateKey) ?? []
      existing.push(entry)
      groups.set(entry.dateKey, existing)
    })

    return Array.from(groups.entries())
  }, [sessionHistory])

  const getPresetLabel = (presetId: string) => {
    const preset = TASBEEH_PRESETS.find((item) => item.id === presetId)
    if (!preset) {
      return presetId
    }

    return language === 'ar' ? preset.labelAr : preset.labelEn
  }

  const playTapSound = () => {
    if (!soundEnabled || typeof window === 'undefined') {
      return
    }

    try {
      const AudioContextRef = window.AudioContext
      if (!AudioContextRef) {
        return
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextRef()
      }

      const context = audioContextRef.current
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, context.currentTime)
      gain.gain.setValueAtTime(0.001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.07)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.08)
    } catch {
      // Ignore audio feedback failures.
    }
  }

  const triggerFeedback = () => {
    if (vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20)
    }

    playTapSound()
  }

  const addSessionEntry = (presetId: string, count: number, completed: boolean) => {
    if (count <= 0) {
      return
    }

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
  }

  const setPresetCount = (presetId: string, nextValue: number) => {
    setPresetCounters((prev) => ({ ...prev, [presetId]: Math.max(0, nextValue) }))
  }

  const incrementPreset = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    if (current >= targetCount) {
      return
    }

    const next = Math.min(targetCount, current + 1)
    setPresetCount(presetId, next)
    triggerFeedback()

    if (next === targetCount) {
      addSessionEntry(presetId, next, true)
    }
  }

  const decrementPreset = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    setPresetCount(presetId, Math.max(0, current - 1))
  }

  const resetPreset = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    if (current > 0) {
      addSessionEntry(presetId, current, current >= targetCount)
    }

    setPresetCount(presetId, 0)
  }

  const savePresetSession = (presetId: string) => {
    const current = presetCounters[presetId] ?? 0
    addSessionEntry(presetId, current, current >= targetCount)
  }

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const exportHistoryAsPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const container = document.createElement('div')

    const title = language === 'ar' ? 'سجل جلسات التسبيح' : 'Tasbeeh Session History'
    const exportedAt =
      language === 'ar'
        ? `وقت التصدير: ${new Date().toLocaleString('ar-EG')}`
        : `Exported at: ${new Date().toLocaleString('en-US')}`

    const groupsHtml =
      sessionHistory.length === 0
        ? `<p style="font-size:14px;color:#4b5563;">${
            language === 'ar' ? 'لا يوجد سجل جلسات متاح.' : 'No session history available.'
          }</p>`
        : groupedHistory
            .map(([dateKey, entries]) => {
              const rows = entries
                .map((entry) => {
                  const status = entry.completed
                    ? language === 'ar'
                      ? 'مكتمل'
                      : 'Completed'
                    : language === 'ar'
                      ? 'جزئي'
                      : 'Partial'

                  const text = `${formatTimeLabel(entry.createdAt, language)} - ${getPresetLabel(entry.presetId)}: ${entry.count}/${entry.target} (${status})`
                  return `<li style="margin:0 0 6px;line-height:1.6;">${escapeHtml(text)}</li>`
                })
                .join('')

              return `
                <section style="margin-bottom:14px; padding:10px 12px; border:1px solid #d7e3f5; border-radius:10px; background:#f8fbff;">
                  <h3 style="margin:0 0 8px; font-size:14px; color:#111827;">${escapeHtml(
                    `${dateKey} (${formatDayLabel(dateKey, language)})`,
                  )}</h3>
                  <ul style="margin:0; padding-${language === 'ar' ? 'right' : 'left'}:18px; font-size:12px; color:#374151;">
                    ${rows}
                  </ul>
                </section>
              `
            })
            .join('')

    container.innerHTML = `
      <div style="font-family:Cairo, Arial, sans-serif; direction:${language === 'ar' ? 'rtl' : 'ltr'}; text-align:${language === 'ar' ? 'right' : 'left'}; color:#111827; width:740px; padding:12px;">
        <h1 style="margin:0 0 8px; font-size:22px;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 14px; color:#4b5563; font-size:12px;">${escapeHtml(exportedAt)}</p>
        ${groupsHtml}
      </div>
    `

    document.body.appendChild(container)

    try {
      await doc.html(container, {
        x: 20,
        y: 20,
        width: 555,
        windowWidth: 800,
        html2canvas: { scale: 2 },
      })
      doc.save(`tasbeeh-history-${getTodayKey()}.pdf`)
    } finally {
      document.body.removeChild(container)
    }
  }

  const clearHistory = () => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من مسح سجل الجلسات بالكامل؟'
        : 'Are you sure you want to clear all session history?',
    )

    if (!confirmed) {
      return
    }

    setSessionHistory([])
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
        {language === 'ar' ? 'عداد التسبيح' : 'Tasbeeh Counter'}
      </h1>

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TASBEEH_PRESETS.map((preset) => {
          const current = presetCounters[preset.id] ?? 0
          const isDone = current >= targetCount
          const progress = Math.min(100, Math.round((current / targetCount) * 100))

          return (
            <article
              key={preset.id}
              onClick={() => incrementPreset(preset.id)}
              className={[
                'rounded-2xl border p-4 transition',
                isDone ? 'border-[var(--ok)] bg-[var(--brand-100)]' : 'border-[var(--line)] bg-[var(--panel)]',
              ].join(' ')}
            >
              <p className="text-lg font-semibold text-[var(--text-strong)]" dir="rtl">
                {language === 'ar' ? preset.labelAr : preset.labelEn}
              </p>

              <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                {current} / {targetCount}
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
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
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
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                >
                  {language === 'ar' ? 'حفظ الجلسة' : 'Save Session'}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    resetPreset(preset.id)
                  }}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                >
                  {language === 'ar' ? 'تصفير' : 'Reset'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'سجل الجلسات حسب التاريخ' : 'Session History by Date'}
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportHistoryAsPdf}
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
    </section>
  )
}
