import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { AddReligiousInfoModal } from '../components/AddReligiousInfoModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useReligiousInfo,
  useDeleteReligiousInfo,
  type ReligiousInfoItem,
} from '../hooks/useReligiousInfo'

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  aqeedah: { ar: 'العقيدة', en: 'Aqeedah' },
  fiqh: { ar: 'الفقه', en: 'Fiqh' },
  quran: { ar: 'القرآن', en: 'Quran' },
  seerah: { ar: 'السيرة', en: 'Seerah' },
  akhlaq: { ar: 'الأخلاق', en: 'Manners' },
  dua: { ar: 'الدعاء', en: 'Dua' },
}

export function AdminReligiousInfoPage() {
  const { language } = useSettings()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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
  const { data: allItems = [], isLoading, refetch } = useReligiousInfo(
    selectedCategory === 'all' ? undefined : selectedCategory
  )
  const deleteMutation = useDeleteReligiousInfo()

  // Dynamic distinct categories
  const distinctCategories = useMemo(() => {
    const defaultCategories = ['aqeedah', 'fiqh', 'quran', 'seerah', 'akhlaq', 'dua']
    const fromData = allItems.map((item) => item.category.toLowerCase())
    return Array.from(new Set([...defaultCategories, ...fromData]))
  }, [allItems])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of allItems) {
      const cat = item.category.toLowerCase()
      counts[cat] = (counts[cat] || 0) + 1
    }
    return counts
  }, [allItems])

  // Filtered list
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()

      const matchesQuery =
        query.length === 0 ||
        item.titleAr.toLowerCase().includes(query) ||
        item.titleEn.toLowerCase().includes(query) ||
        item.contentAr.toLowerCase().includes(query) ||
        item.sourceAr.toLowerCase().includes(query)

      return matchesCategory && matchesQuery
    })
  }, [allItems, selectedCategory, searchQuery])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const handleDeleteClick = (item: ReligiousInfoItem) => {
    setDeleteTarget({
      isOpen: true,
      id: item.id,
      titleSnippet: item.titleAr || item.titleEn,
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
          ? 'تم حذف المعلومة الدينية بنجاح من قاعدة البيانات في الخادم.'
          : 'Religious info deleted successfully from backend database.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف المعلومة من الخادم.'
            : 'Failed to delete info from server.')
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
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-2xl text-emerald-600 shadow-inner">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-[var(--brand-500)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)]">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة المعلومات الدينية' : 'Religious Information Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل المقالات والمعلومات الدينية مباشرة في الخادم'
                  : 'Add, moderate, and delete Islamic articles and insights directly on the backend database'}
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
              to="/religious-info"
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 sm:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{language === 'ar' ? 'إضافة معلومة جديدة' : 'Add New Info'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي المقالات والمعلومات' : 'Total Articles'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {allItems.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'الأقسام النشطة' : 'Active Categories'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-[var(--brand-600)] sm:text-2xl">
              {distinctCategories.length}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'المعروض حالياً' : 'Displayed in Filter'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-[var(--text-strong)] sm:text-2xl">
              {filteredItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              selectedCategory === 'all'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-emerald-500',
            ].join(' ')}
          >
            <span>{language === 'ar' ? 'جميع المعلومات' : 'All Categories'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {allItems.length}
            </span>
          </button>

          {distinctCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
            const count = categoryCounts[cat.toLowerCase()] || 0
            const label = CATEGORY_LABELS[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-emerald-500',
                ].join(' ')}
              >
                <span>{language === 'ar' ? (label?.ar ?? cat) : (label?.en ?? cat)}</span>
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
                ? 'ابحث في المعلومات الدينية بالكلمة المفتاحية، العنوان، أو المصدر...'
                : 'Search religious information by title, keyword, or reference...'
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري جلب المعلومات من الخادم...' : 'Fetching religious information from server...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-600">
            📖
          </div>
          <h3 className="font-title text-base font-bold text-[var(--text-strong)] sm:text-lg">
            {language === 'ar' ? 'لا توجد معلومات في هذا القسم' : 'No Information Found'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يمكنك إضافة معلومة أو فائدة جديدة الآن ليتم حفظها في الخادم.'
              : 'You can add a new religious insight now to save it directly on the backend.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700"
          >
            <span>+</span>
            <span>{language === 'ar' ? 'إضافة معلومة جديدة' : 'Add New Info'}</span>
          </button>
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-emerald-500/40 hover:shadow-md"
            >
              {/* Header with category and Delete button */}
              <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-700 dark:text-emerald-400">
                  {language === 'ar'
                    ? (CATEGORY_LABELS[item.category]?.ar ?? item.category)
                    : (CATEGORY_LABELS[item.category]?.en ?? item.category)}
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

              <h2
                className="font-title text-lg font-bold text-[var(--text-strong)]"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2 text-sm leading-7 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.contentAr : item.contentEn}
              </p>

              <div className="mt-4 flex items-center gap-1.5 border-t border-[var(--line)]/60 pt-3 text-xs font-semibold text-[var(--muted)]">
                <span>📚</span>
                <span>{language === 'ar' ? 'المصدر' : 'Source'}:</span>
                <span>{language === 'ar' ? item.sourceAr : item.sourceEn}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ADD RELIGIOUS INFO MODAL */}
      <AddReligiousInfoModal
        isOpen={isAddModalOpen}
        initialCategory={selectedCategory === 'all' ? 'aqeedah' : selectedCategory}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showNotification(
            'success',
            language === 'ar'
              ? 'تمت إضافة المعلومة الدينية بنجاح إلى قاعدة بيانات الخادم.'
              : 'New religious info added successfully to the backend database.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف المعلومة الدينية من الخادم"
        titleEn="Confirm Religious Info Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذه المعلومة الدينية نهائياً من قاعدة البيانات في الخادم؟ لا يمكن التراجع عن هذا الإجراء."
        messageEn="Are you sure you want to permanently delete this religious info from the backend database? This action cannot be undone."
        itemTitle={deleteTarget.titleSnippet}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })}
      />
    </section>
  )
}
