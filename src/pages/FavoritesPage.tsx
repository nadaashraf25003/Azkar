import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ZikrCard } from '../components/ZikrCard'
import { useFavorites } from '../context/FavoritesContext'
import { useSettings } from '../context/SettingsContext'
import { useAzkarData } from '../hooks/useAzkarData'
import { useTasbeehCounters } from '../hooks/useTasbeehCounters'
import { useMessagesData } from '../hooks/useMessagesData'

export function FavoritesPage() {
  const { favoriteIds } = useFavorites()
  const { language } = useSettings()
  const { data, isLoading } = useAzkarData()
  const { counters, increment, decrement, resetCounter } = useTasbeehCounters()
  const { data: messagesData, isLoading: messagesLoading } = useMessagesData()
  const { toggleFavorite } = useFavorites()

  const favorites = useMemo(() => {
    if (!data) {
      return []
    }

    return data.filter((item) => favoriteIds.includes(item.id))
  }, [data, favoriteIds])

  const favoriteMessages = useMemo(() => {
    if (!messagesData) return []
    return messagesData.filter((m) => favoriteIds.includes(m.id))
  }, [messagesData, favoriteIds])

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

  function getTypeLabel(type: string) {
    const labels = TYPE_LABELS[type]
    return labels ? (language === 'ar' ? labels.ar : labels.en) : type
  }

  if (isLoading || messagesLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading favorites...</p>
  }

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-[var(--text-strong)]">
        {language === 'ar' ? 'المفضلة' : 'Favorites'}
      </h1>

      {favorites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'لم تقم بإضافة أذكار للمفضلة بعد.'
            : 'No favorites yet. Save Azkar from Today page.'}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.map((item) => (
            <ZikrCard
              key={item.id}
              zikr={item}
              language={language}
              currentCount={counters[item.id] ?? 0}
              onIncrement={increment}
              onDecrement={decrement}
              onReset={resetCounter}
            />
          ))}
        </div>
      )}

      {/** Saved messages section rendered as cards */}
      <h2 className="mt-6 font-semibold text-[var(--text-strong)]">{language === 'ar' ? 'الرسائل المحفوظة' : 'Saved Messages'}</h2>

      {favoriteMessages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لم تقم بحفظ أية رسائل بعد.' : 'You have no saved messages.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favoriteMessages.map((m) => (
            <article key={m.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">{getTypeLabel(m.type)}</span>
                <span className="text-xs font-semibold text-[var(--muted)]">#{m.id}</span>
              </div>

              <h3 className="text-lg font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? m.titleAr : m.titleEn}</h3>

              <p className="mt-2 leading-7 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? m.textAr : m.textEn}</p>

              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
                <p className="text-sm font-semibold text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 'بقلم' : 'By'}: {language === 'ar' ? m.authorAr : m.authorEn}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleFavorite(m.id)} className="rounded-lg px-3 py-2 text-xs font-semibold border border-[var(--line)]">
                  {language === 'ar' ? 'إزالة من المفضلة' : 'Remove Favorite'}
                </button>

                <Link to={`/messages/type/${m.type}`} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:border-[var(--brand-500)]">
                  {language === 'ar' ? 'عرض النوع' : 'View Type'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
