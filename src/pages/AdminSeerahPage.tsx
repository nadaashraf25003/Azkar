import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { AddSeerahModal } from '../components/AddSeerahModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useSeerah,
  useDeleteSeerahEvent,
  type SeerahEvent,
} from '../hooks/useSeerah'

export function AdminSeerahPage() {
  const { language } = useSettings()
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'Makkah' | 'Madinah'>('all')
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
  const { data: allItems = [], isLoading, refetch } = useSeerah()
  const deleteMutation = useDeleteSeerahEvent()

  // Stats calculation
  const makkahCount = useMemo(() => {
    return allItems.filter((e) => e.period?.toLowerCase() === 'makkah').length
  }, [allItems])

  const madinahCount = useMemo(() => {
    return allItems.filter((e) => e.period?.toLowerCase() === 'madinah').length
  }, [allItems])

  // Filtered list
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allItems.filter((item) => {
      const matchesPeriod =
        selectedPeriod === 'all' || item.period?.toLowerCase() === selectedPeriod.toLowerCase()

      const matchesQuery =
        query.length === 0 ||
        item.titleAr.toLowerCase().includes(query) ||
        item.titleEn.toLowerCase().includes(query) ||
        item.summaryAr.toLowerCase().includes(query) ||
        item.yearLabelAr.toLowerCase().includes(query) ||
        (item.lessonsAr && item.lessonsAr.some((l) => l.toLowerCase().includes(query)))

      return matchesPeriod && matchesQuery
    })
  }, [allItems, selectedPeriod, searchQuery])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const handleDeleteClick = (item: SeerahEvent) => {
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
          ? 'تم حذف حدث السيرة بنجاح من قاعدة البيانات في الخادم.'
          : 'Seerah event deleted successfully from backend database.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الحدث من الخادم.'
            : 'Failed to delete event from server.')
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
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-2xl text-amber-600 shadow-inner">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-[var(--brand-500)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)]">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة السيرة النبوية' : 'Prophetic Seerah Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل أحداث ومحطات السيرة النبوية مباشرة في الخادم'
                  : 'Add, moderate, and delete Prophetic Seerah events directly on the backend database'}
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
              to="/seerah"
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
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 active:scale-95 sm:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي أحداث السيرة' : 'Total Seerah Events'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {allItems.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'العهد المكي' : 'Makkah Period'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-700 sm:text-2xl">
              {makkahCount}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'العهد المدني' : 'Madinah Period'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {madinahCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Period Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedPeriod('all')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              selectedPeriod === 'all'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>{language === 'ar' ? 'جميع المحطات' : 'All Events'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {allItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('Makkah')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              selectedPeriod === 'Makkah'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>🕋</span>
            <span className="ms-1">{language === 'ar' ? 'العهد المكي' : 'Makkah Period'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {makkahCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('Madinah')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              selectedPeriod === 'Madinah'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-emerald-500',
            ].join(' ')}
          >
            <span>🕌</span>
            <span className="ms-1">{language === 'ar' ? 'العهد المدني' : 'Madinah Period'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {madinahCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث في أحداث السيرة بالكلمة المفتاحية، العنوان، أو الدروس المستفادة...'
                : 'Search Seerah events by title, keyword, or lessons...'
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري جلب أحداث السيرة من الخادم...' : 'Fetching Seerah events from server...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600">
            📜
          </div>
          <h3 className="font-title text-base font-bold text-[var(--text-strong)] sm:text-lg">
            {language === 'ar' ? 'لا توجد أحداث في هذا القسم' : 'No Events Found'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يمكنك إضافة محطة أو حدث جديد في السيرة الآن ليتم حفظه في الخادم.'
              : 'You can add a new Seerah event now to save it directly on the backend.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-amber-700"
          >
            <span>+</span>
            <span>{language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}</span>
          </button>
        </div>
      ) : (
        /* Events List */
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-amber-500/40 hover:shadow-md md:p-6"
            >
              {/* Header with tags and Delete button */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                    {language === 'ar' ? item.yearLabelAr : item.yearLabelEn}
                  </span>

                  <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {item.period === 'Makkah'
                      ? (language === 'ar' ? 'العهد المكي' : 'Makkah')
                      : (language === 'ar' ? 'العهد المدني' : 'Madinah')}
                  </span>

                  <span className="text-[11px] text-[var(--muted)]">
                    #{item.order}
                  </span>
                </div>

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
                className="font-title text-xl font-bold text-[var(--text-strong)]"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2.5 text-sm leading-8 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.summaryAr : item.summaryEn}
              </p>

              {item.lessonsAr && item.lessonsAr.length > 0 ? (
                <div className="mt-4 border-t border-[var(--line)]/60 pt-3.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <p className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                    {language === 'ar' ? '💡 الدروس والعبر المستفادة:' : '💡 Lessons Learned:'}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {(language === 'ar' ? item.lessonsAr : item.lessonsEn).map((lesson, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]"
                      >
                        <span className="mt-0.5 text-amber-500">•</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {/* ADD SEERAH MODAL */}
      <AddSeerahModal
        isOpen={isAddModalOpen}
        initialPeriod={selectedPeriod === 'Madinah' ? 'Madinah' : 'Makkah'}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showNotification(
            'success',
            language === 'ar'
              ? 'تمت إضافة حدث السيرة بنجاح إلى قاعدة بيانات الخادم.'
              : 'New Seerah event added successfully to backend database.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف حدث السيرة من الخادم"
        titleEn="Confirm Seerah Event Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا الحدث نهائياً من قاعدة بيانات السيرة النبوية في الخادم؟ لا يمكن التراجع عن هذا الإجراء."
        messageEn="Are you sure you want to permanently delete this event from the backend database? This action cannot be undone."
        itemTitle={deleteTarget.titleSnippet}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })}
      />
    </section>
  )
}
