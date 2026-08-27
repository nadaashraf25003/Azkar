import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { AddMessageModal } from '../components/AddMessageModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useMessagesData,
  useDeleteMessage,
} from '../hooks/useMessagesData'
import type { MessageItem } from '../types/message'

const CATEGORY_TABS: { id: string; ar: string; en: string }[] = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'religious', ar: 'دينية', en: 'Religious' },
  { id: 'reflection', ar: 'خواطر', en: 'Reflections' },
  { id: 'quran', ar: 'آيات', en: 'Quran' },
  { id: 'hadith', ar: 'حديث', en: 'Hadith' },
  { id: 'dua', ar: 'دعاء', en: 'Dua' },
  { id: 'motivation', ar: 'تحفيز', en: 'Motivation' },
  { id: 'gratitude', ar: 'شكر', en: 'Gratitude' },
  { id: 'wisdom', ar: 'حكمة', en: 'Wisdom' },
  { id: 'community', ar: 'مجتمع', en: 'Community' },
  { id: 'action', ar: 'عمل', en: 'Action' },
]

export function AdminMessagesPage() {
  const { language } = useSettings()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean
    id: string
    titleSnippet: string
  }>({
    isOpen: false,
    id: '',
    titleSnippet: '',
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Query all from backend
  const { data: allItems = [], isLoading, refetch } = useMessagesData()
  const deleteMutation = useDeleteMessage()

  // Stats calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const tab of CATEGORY_TABS) {
      if (tab.id === 'all') {
        counts[tab.id] = allItems.length
      } else {
        counts[tab.id] = allItems.filter(
          (m) => m.type.toLowerCase() === tab.id.toLowerCase()
        ).length
      }
    }
    return counts
  }, [allItems])

  // Filtered list
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allItems.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.type.toLowerCase() === selectedCategory.toLowerCase()

      const matchesQuery =
        query.length === 0 ||
        item.textAr.toLowerCase().includes(query) ||
        item.textEn.toLowerCase().includes(query) ||
        item.authorAr.toLowerCase().includes(query) ||
        item.authorEn.toLowerCase().includes(query)

      return matchesCat && matchesQuery
    })
  }, [allItems, selectedCategory, searchQuery])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const handleDeleteClick = (item: MessageItem) => {
    setDeleteTarget({
      isOpen: true,
      id: item.id,
      titleSnippet: (language === 'ar' ? item.textAr : item.textEn).substring(0, 75) + '...',
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })
      showNotification(
        'success',
        language === 'ar'
          ? 'تم حذف الرسالة بنجاح من قاعدة البيانات في الخادم.'
          : 'Message deleted successfully from backend database.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الرسالة من الخادم.'
            : 'Failed to delete message from server.')
      )
    }
  }

  return (
    <section className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {notification ? (
        <div
          className={[
            'fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl transition-all animate-bounce',
            notification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400',
          ].join(' ')}
        >
          <span className="text-lg">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="text-xs font-bold sm:text-sm">{notification.message}</span>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-2xl text-indigo-600 shadow-inner">
              💌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-[var(--brand-500)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)]">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة الرسائل اليومية والخواطر' : 'Daily Messages Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل الرسائل اليومية الملهمة مباشرة في الخادم'
                  : 'Add, moderate, and delete daily inspirational messages directly on backend'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{language === 'ar' ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>

            <Link
              to="/messages"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{language === 'ar' ? 'معاينة الصفحة العامة' : 'View Public Page'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 sm:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{language === 'ar' ? 'إضافة رسالة جديدة' : 'Add New Message'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي الرسائل' : 'Total Messages'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-indigo-600 sm:text-2xl">
              {allItems.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'دينية وخاطرة' : 'Religious & Reflections'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {(categoryCounts['religious'] ?? 0) + (categoryCounts['reflection'] ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'آيات وأحاديث' : 'Quran & Hadith'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {(categoryCounts['quran'] ?? 0) + (categoryCounts['hadith'] ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'تحفيز وحكمة' : 'Motivation & Wisdom'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-sky-600 sm:text-2xl">
              {(categoryCounts['motivation'] ?? 0) + (categoryCounts['wisdom'] ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => {
            const count = categoryCounts[tab.id] ?? 0
            const isSelected = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={[
                  'shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-indigo-500',
                ].join(' ')}
              >
                <span>{language === 'ar' ? tab.ar : tab.en}</span>
                <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث في نصوص الرسائل، الكلمات المفتاحية، أو المصدر...'
                : 'Search messages by text, keyword, or source...'
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري جلب الرسائل من الخادم...' : 'Fetching messages from server...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-600">
            💌
          </div>
          <h3 className="font-title text-base font-bold text-[var(--text-strong)] sm:text-lg">
            {language === 'ar' ? 'لا توجد رسائل في هذا القسم' : 'No Messages Found'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يمكنك إضافة رسالة أو خاطرة جديدة الآن ليتم حفظها في الخادم.'
              : 'You can add a new message now to save it directly on the backend.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            <span>+</span>
            <span>{language === 'ar' ? 'إضافة رسالة جديدة' : 'Add New Message'}</span>
          </button>
        </div>
      ) : (
        /* Messages Grid */
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-indigo-500/40 hover:shadow-md md:p-6"
            >
              {/* Header with category tag and Delete button */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  {CATEGORY_TABS.find((t) => t.id === item.type)?.ar || item.type}
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                  title={language === 'ar' ? 'حذف من الخادم' : 'Delete from backend'}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                </button>
              </div>

              <p className="text-base leading-8 text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.textAr : item.textEn}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)]/60 pt-3 text-xs text-[var(--muted)]">
                <span>
                  {language === 'ar' ? 'المصدر' : 'Source'}: {language === 'ar' ? item.authorAr : item.authorEn}
                </span>
                <span className="text-[10px]">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ADD MESSAGE MODAL */}
      <AddMessageModal
        isOpen={isAddModalOpen}
        initialCategory={selectedCategory !== 'all' ? selectedCategory : 'religious'}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showNotification(
            'success',
            language === 'ar'
              ? 'تمت إضافة الرسالة بنجاح إلى قاعدة بيانات الخادم.'
              : 'New message added successfully to backend database.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف الرسالة من الخادم"
        titleEn="Confirm Message Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً من قاعدة البيانات في الخادم؟ لا يمكن التراجع عن هذا الإجراء."
        messageEn="Are you sure you want to permanently delete this message from the backend database? This action cannot be undone."
        itemTitle={deleteTarget.titleSnippet}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })}
      />
    </section>
  )
}
