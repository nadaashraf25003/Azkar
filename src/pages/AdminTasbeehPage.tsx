import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { AddTasbeehModal } from '../components/AddTasbeehModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import {
  useTasbeehPresets,
  useDeleteTasbeehPreset,
  type BackendTasbeehPreset,
} from '../hooks/useTasbeeh'

export function AdminTasbeehPage() {
  const { language } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
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
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Query presets from backend
  const { data: allPresets = [], isLoading, refetch } = useTasbeehPresets()
  const deleteMutation = useDeleteTasbeehPreset()

  // Filtered list
  const filteredPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allPresets.filter((item) => {
      return (
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.arabicText.toLowerCase().includes(query) ||
        item.transliteration.toLowerCase().includes(query) ||
        item.benefit.toLowerCase().includes(query)
      )
    })
  }, [allPresets, searchQuery])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const handleDeleteClick = (item: BackendTasbeehPreset) => {
    setDeleteTarget({
      isOpen: true,
      id: item.id,
      title: item.name || item.arabicText,
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', title: '' })
      showNotification(
        'success',
        language === 'ar'
          ? 'تم حذف ذكر التسبيح بنجاح من الخادم.'
          : 'Tasbeeh preset deleted successfully from backend.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الذكر من الخادم.'
            : 'Failed to delete preset from server.')
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
      <div className="relative overflow-hidden rounded-3xl border border-[var(--brand-500)]/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand-500)]/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--brand-500)]/30 bg-[var(--brand-500)]/15 text-2xl text-[var(--brand-600)] shadow-inner">
              📿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[var(--brand-500)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-700)] dark:text-[var(--brand-400)]">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة أذكار وتسبيحات العداد' : 'Tasbeeh Presets Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل أذكار التسبيح والأعداد المستهدفة مباشرة في الخادم'
                  : 'Add, manage, and delete tasbeeh presets and target counts directly on the backend'}
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
              to="/counter/tasbeeh"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{language === 'ar' ? 'معاينة صفحة العداد' : 'View Tasbeeh Page'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-600)] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[var(--brand-700)] active:scale-95 sm:text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add New Preset'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي أذكار العداد' : 'Total Tasbeeh Presets'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-[var(--brand-600)] sm:text-2xl">
              {allPresets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'أذكار أساسية (افتراضية)' : 'System Presets'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {allPresets.filter((p) => !p.isCustom).length}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'أذكار مخصصة' : 'Custom Presets'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {allPresets.filter((p) => p.isCustom).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث في نصوص الأذكار، التشكيل، أو الفضل المستفاد...'
              : 'Search tasbeeh presets by text or benefit...'
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
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

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-500)] border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري جلب أذكار العداد من الخادم...' : 'Fetching tasbeeh presets from server...'}
          </p>
        </div>
      ) : filteredPresets.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-500)]/10 text-2xl text-[var(--brand-600)]">
            📿
          </div>
          <h3 className="font-title text-base font-bold text-[var(--text-strong)] sm:text-lg">
            {language === 'ar' ? 'لا توجد أذكار مطابقة' : 'No Presets Found'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يمكنك إضافة ذكر وتسبيح جديد للعداد الآن ليتم حفظه في الخادم.'
              : 'You can add a new tasbeeh preset now to save it directly on backend.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-600)] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[var(--brand-700)]"
          >
            <span>+</span>
            <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add New Preset'}</span>
          </button>
        </div>
      ) : (
        /* Presets Grid */
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPresets.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--brand-500)]/40 hover:shadow-md md:p-6"
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--brand-500)]/15 px-3 py-1 text-xs font-bold text-[var(--brand-700)] dark:text-[var(--brand-400)]">
                    {language === 'ar' ? `الهدف: ${item.targetCount}` : `Target: ${item.targetCount}`}
                  </span>
                  {item.isCustom ? (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                      {language === 'ar' ? 'مخصص' : 'Custom'}
                    </span>
                  ) : null}
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

              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]" dir="rtl">
                {item.arabicText || item.name}
              </h2>

              {item.transliteration ? (
                <p className="mt-1 text-xs text-[var(--muted)]" dir="ltr">
                  {item.transliteration}
                </p>
              ) : null}

              {item.benefit ? (
                <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)]">
                  <p className="font-semibold text-[var(--brand-700)] dark:text-[var(--brand-400)]">
                    {language === 'ar' ? '💡 الفضل والأجر:' : '💡 Benefit:'}
                  </p>
                  <p className="mt-0.5 text-[var(--muted)]">{item.benefit}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {/* ADD TASBEEH MODAL */}
      <AddTasbeehModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showNotification(
            'success',
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
