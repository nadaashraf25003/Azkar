import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BackendErrorState } from '../components/BackendErrorState'
import { AddSeerahModal } from '../components/AddSeerahModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useSeerah, useDeleteSeerahEvent, type SeerahEvent } from '../hooks/useSeerah'

export function SeerahPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState<'all' | 'Makkah' | 'Madinah'>('all')

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

  const { data, isLoading, isError, refetch } = useSeerah()
  const deleteMutation = useDeleteSeerahEvent()

  const filteredEvents = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    const all = data ?? []

    return all.filter((event) => {
      const matchesPeriod =
        periodFilter === 'all' ||
        (event.period && event.period.toLowerCase() === periodFilter.toLowerCase())

      const haystack = `${event.yearLabelAr} ${event.yearLabelEn} ${event.titleAr} ${event.titleEn} ${event.summaryAr} ${event.summaryEn}`.toLowerCase()
      const matchesSearch = normalized.length === 0 || haystack.includes(normalized)

      return matchesPeriod && matchesSearch
    })
  }, [data, search, periodFilter])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleDeleteClick = (event: SeerahEvent) => {
    setDeleteTarget({
      isOpen: true,
      id: event.id,
      title: event.titleAr || event.titleEn,
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', title: '' })
      showToast(
        language === 'ar'
          ? 'تم حذف حدث السيرة بنجاح من الخادم.'
          : 'Seerah event deleted successfully from backend.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الحدث من الخادم.'
            : 'Failed to delete event from backend.')
      )
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="mt-3 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'جارٍ تحميل السيرة النبوية من الخادم...' : 'Loading Seerah from backend...'}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return <BackendErrorState />
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {language === 'ar'
                  ? 'وضع تحكم المشرف نشط (السيرة النبوية)'
                  : 'Admin Control Active (Prophetic Seerah)'}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة أحداث جديدة أو حذفها مباشرة من الخادم'
                  : 'You can add or delete events directly from the backend database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/seerah"
              className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-[var(--bg)] px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-400"
            >
              <span>{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              {language === 'ar' ? 'صفحات من السيرة العطرة' : 'Moments from the Seerah'}
            </p>
            <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
              {language === 'ar' ? 'السيرة النبوية' : 'Prophetic Biography'}
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? 'محطات مختصرة وموثقة من حياة النبي محمد صلى الله عليه وسلم مع دروس عملية في الأخلاق والثبات.'
                : 'A concise timeline from the life of Prophet Muhammad (peace be upon him) with practical lessons.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-amber-500"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة حدث' : 'Add Event'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Period Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              periodFilter === 'all'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>{language === 'ar' ? 'جميع الأحداث' : 'All Events'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {data?.length ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter('Makkah')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              periodFilter === 'Makkah'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>🕋</span>
            <span className="ms-1">{language === 'ar' ? 'العهد المكي' : 'Makkah Period'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter('Madinah')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              periodFilter === 'Madinah'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-emerald-500',
            ].join(' ')}
          >
            <span>🕌</span>
            <span className="ms-1">{language === 'ar' ? 'العهد المدني' : 'Madinah Period'}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={language === 'ar' ? 'ابحث في أحداث ومواقف السيرة النبوية...' : 'Search Seerah events...'}
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-amber-500"
          />
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600">
            📜
          </div>
          <p className="font-title text-base font-bold text-[var(--text-strong)]">
            {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching events found'}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'جرّب البحث بكلمات أخرى أو اختر عهداً مختلفاً.'
              : 'Try searching with different keywords or pick another period.'}
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="group relative rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-amber-500/40 hover:shadow-md md:p-6"
            >
              {/* Header Badges and Admin Delete Button */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                    {language === 'ar' ? event.yearLabelAr : event.yearLabelEn}
                  </span>

                  <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {event.period === 'Makkah'
                      ? (language === 'ar' ? 'العهد المكي' : 'Makkah')
                      : (language === 'ar' ? 'العهد المدني' : 'Madinah')}
                  </span>
                </div>

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(event)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
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

              <h2
                className="font-title text-xl font-bold text-[var(--text-strong)]"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {language === 'ar' ? event.titleAr : event.titleEn}
              </h2>

              <p className="mt-2.5 text-sm leading-8 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? event.summaryAr : event.summaryEn}
              </p>

              {event.lessonsAr && event.lessonsAr.length > 0 ? (
                <div className="mt-4 border-t border-[var(--line)]/60 pt-3.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <p className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                    {language === 'ar' ? '💡 الدروس والعبر المستفادة:' : '💡 Lessons Learned:'}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {(language === 'ar' ? event.lessonsAr : event.lessonsEn).map((lesson, idx) => (
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
        initialPeriod={periodFilter === 'Madinah' ? 'Madinah' : 'Makkah'}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة حدث السيرة بنجاح إلى الخادم.'
              : 'New Seerah event added successfully to the backend server.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف حدث السيرة من الخادم"
        titleEn="Confirm Seerah Event Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا الحدث نهائياً من قاعدة بيانات السيرة النبوية في الخادم؟"
        messageEn="Are you sure you want to permanently delete this event from the backend Seerah database?"
        itemTitle={deleteTarget.title}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', title: '' })}
      />
    </section>
  )
}

