import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMessagesData } from '../hooks/useMessagesData'
import { BackendErrorState } from '../components/BackendErrorState'
import { AddMessageModal } from '../components/AddMessageModal'

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
    imageUrl: 'https://alfasih.net/wp-content/uploads/2024/03/%D8%AE%D9%84%D9%81%D9%8A%D8%A7%D8%AA-%D8%A7%D9%8A%D8%A7%D8%AA-%D9%82%D8%B1%D8%A7%D9%86%D9%8A%D8%A92.webp',
  },
  {
    type: 'dua',
    titleAr: 'أدعية وأذكار',
    titleEn: 'Dua and Azkar',
    imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.yMxGAR_o8LNLb-F8aD5wxAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    type: 'hadith',
    titleAr: 'حديث نبوي',
    titleEn: 'Prophetic Hadith',
    imageUrl: 'https://i.pinimg.com/736x/ec/3a/aa/ec3aaaded18b8f9fae3c4317a93ffc3f.jpg',
  },
  {
    type: 'reflection',
    titleAr: 'عبارات وخواطر',
    titleEn: 'Words and Reflections',
    imageUrl: 'https://i.pinimg.com/originals/f1/02/0f/f1020fde3bb12e110ef922a74d762522.jpg',
  },
  {
    type: 'gratitude',
    titleAr: 'شكر وامتنان',
    titleEn: 'Gratitude and Thanks',
    imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.xY8fYexxlbKPcBv1pjyJSQHaFl?w=620&h=468&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    type: 'wisdom',
    titleAr: 'حكمة',
    titleEn: 'Wisdom',
    imageUrl: 'https://www.i7lm.com/wp-content/uploads/2018/11/unnamed.jpg',
  },
  {
    type: 'community',
    titleAr: 'مجتمع وحياة',
    titleEn: ' Community and Life',
    imageUrl: 'https://www.mosoah.com/wp-content/uploads/2020/02/%D8%B9%D9%87.jpg',
  },
  {
    type: 'action',
    titleAr: 'عمل وخطوات',
    titleEn: 'Work and Steps',
    imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.fdVQRRFPyFdLfhaoXcC2OwHaDt?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
]

export function MessagesPage() {
  const { language } = useSettings()

  // Admin authentication state
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const isAdmin = isAdminAuthenticated || viewerRole === 'admin'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useMessagesData()

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

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
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-3 text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل الرسائل من الخادم...' : 'Loading messages from backend...'}</p>
      </div>
    )
  }

  if (isError || !data) {
    return <BackendErrorState onRetry={() => refetch()} />
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
                  ? 'يمكنك إضافة رسائل جديدة وتعديلها وإدارتها من لوحة التحكم'
                  : 'You can add and manage messages directly on the backend'}
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

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 md:p-7">
        <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
              {language === 'ar' ? 'رسائل ملهمة يومية' : 'Daily Inspirational Messages'}
            </p>
            <h1 className="mt-2 font-title text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl">
              {language === 'ar' ? 'اختر نوع الرسائل' : 'Choose Message Type'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
              {language === 'ar'
                ? 'واجهة تفاعلية لاكتشاف الرسائل والأدعية والخواطر حسب التصنيف. اضغط أي بطاقة للانتقال مباشرة.'
                : 'Explore messages by category. Tap any card to open that type page directly.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                {language === 'ar' ? `إجمالي الرسائل: ${data.length}` : `Total messages: ${data.length}`}
              </span>
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                {language === 'ar' ? `عدد الأنواع: ${typeCards.length}` : `Types: ${typeCards.length}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2 text-xs font-bold text-[var(--text)] transition hover:border-indigo-500"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة رسالة' : 'Add Message'}</span>
              </button>
            ) : null}
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
                    +{card.count}
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

      {/* ADD MESSAGE MODAL */}
      <AddMessageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة الرسالة بنجاح إلى الخادم.'
              : 'New message added successfully to the backend server.'
          )
        }}
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