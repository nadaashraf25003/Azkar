import { useMemo } from 'react'
import { useFavorites } from '../context/FavoritesContext'
import type { Language, ZikrItem } from '../types/azkar'

interface ZikrCardProps {
  zikr: ZikrItem
  language: Language
  currentCount: number
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onReset: (id: string) => void
}

export function ZikrCard({
  zikr,
  language,
  currentCount,
  onIncrement,
  onDecrement,
  onReset,
}: ZikrCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isDone = currentCount >= zikr.count

  const progress = useMemo(() => {
    if (zikr.count === 0) {
      return 0
    }
    return Math.min(100, Math.round((currentCount / zikr.count) * 100))
  }, [currentCount, zikr.count])

  const readOutLoud = () => {
    if (typeof speechSynthesis === 'undefined') {
      return
    }

    const utterance = new SpeechSynthesisUtterance(zikr.text)
    utterance.lang = 'ar-SA'
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }

  return (
    <article
      onClick={() => {
        if (!isDone) {
          onIncrement(zikr.id)
        }
      }}
      className={[
        'group rounded-3xl border p-5 shadow-sm transition hover:shadow-lg',
        isDone ? '' : 'cursor-pointer',
        isDone
          ? 'border-[var(--ok)] bg-[var(--brand-100)]'
          : 'border-[var(--line)] bg-[var(--panel)]',
      ].join(' ')}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-title text-lg leading-relaxed text-[var(--text-strong)] md:text-xl" dir="rtl">
          {language === 'ar' ? zikr.text : zikr.textEn}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            toggleFavorite(zikr.id)
          }}
          className={[
            'rounded-full border px-3 py-1 text-xs font-semibold transition',
            isFavorite(zikr.id)
              ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
              : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand-500)]',
          ].join(' ')}
        >
          {isFavorite(zikr.id)
            ? language === 'ar'
              ? 'مفضل'
              : 'Saved'
            : language === 'ar'
              ? 'حفظ'
              : 'Save'}
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--line)] bg-[var(--brand-100)] p-3 text-sm">
        <p className="mb-2 text-[var(--text)]">{language === 'ar' ? 'فضل الذكر' : 'Benefit'}</p>
        <p className="font-medium text-[var(--text-strong)]" dir="rtl">
          {zikr.benefit}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {language === 'ar' ? 'المصدر' : 'Reference'}: {zikr.reference}
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {language === 'ar' ? 'الهدف' : 'Target'}: {zikr.count}
        </p>
        <p
          className={[
            'rounded-full px-3 py-1 text-xs font-bold',
            isDone
              ? 'bg-[var(--ok)]/20 text-[var(--ok)]'
              : 'bg-[var(--brand-100)] text-[var(--brand-700)]',
          ].join(' ')}
        >
          {currentCount}/{zikr.count}
        </p>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--brand-500)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDecrement(zikr.id)
          }}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--brand-500)]"
        >
          -1
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            if (!isDone) {
              onIncrement(zikr.id)
            }
          }}
          disabled={isDone}
          className={[
            'rounded-xl px-3 py-2 text-sm font-semibold text-white transition',
            isDone
              ? 'cursor-not-allowed bg-[var(--muted)]'
              : 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)]',
          ].join(' ')}
        >
          +1
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onReset(zikr.id)
          }}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--warn)]"
        >
          {language === 'ar' ? 'إعادة' : 'Reset'}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            readOutLoud()
          }}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--brand-500)]"
        >
          {language === 'ar' ? 'استماع' : 'Listen'}
        </button>
      </div>
    </article>
  )
}
