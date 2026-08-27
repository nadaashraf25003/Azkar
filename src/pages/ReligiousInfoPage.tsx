import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BackendErrorState } from '../components/BackendErrorState'
import { AddReligiousInfoModal } from '../components/AddReligiousInfoModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useReligiousInfo, useDeleteReligiousInfo, type ReligiousInfoItem } from '../hooks/useReligiousInfo'

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  aqeedah: { ar: 'العقيدة', en: 'Aqeedah' },
  fiqh: { ar: 'الفقه', en: 'Fiqh' },
  quran: { ar: 'القرآن', en: 'Quran' },
  seerah: { ar: 'السيرة', en: 'Seerah' },
  akhlaq: { ar: 'الأخلاق', en: 'Manners' },
  dua: { ar: 'الدعاء', en: 'Dua' },
}

export function ReligiousInfoPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

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

  const { data, isLoading, isError, refetch } = useReligiousInfo(activeCategory)
  const deleteMutation = useDeleteReligiousInfo()

  const categories = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.map((item) => item.category)))
  }, [data])

  const filteredItems = useMemo(() => {
    if (!data) return []
    const normalized = search.trim().toLowerCase()

    return data.filter((item) => {
      const categoryMatch = activeCategory === 'all' || item.category === activeCategory
      const haystack = `${item.titleAr} ${item.titleEn} ${item.contentAr} ${item.contentEn}`.toLowerCase()
      const searchMatch = normalized.length === 0 || haystack.includes(normalized)

      return categoryMatch && searchMatch
    })
  }, [activeCategory, data, search])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleDeleteClick = (item: ReligiousInfoItem) => {
    setDeleteTarget({
      isOpen: true,
      id: item.id,
      title: item.titleAr || item.titleEn,
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', title: '' })
      showToast(
        language === 'ar'
          ? 'تم حذف المعلومة الدينية بنجاح من الخادم.'
          : 'Religious information deleted successfully from backend.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف المعلومة من الخادم.'
            : 'Failed to delete item from backend.')
      )
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-500)] border-t-transparent" />
        <p className="mt-3 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'جارٍ تحميل المعلومات الدينية من الخادم...' : 'Loading religious information from backend...'}
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
                  ? 'وضع تحكم المشرف نشط (المعلومات الدينية)'
                  : 'Admin Control Active (Religious Info)'}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة معلومات جديدة أو حذفها مباشرة من الخادم'
                  : 'You can add or delete items directly from the backend server'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/religious-info"
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
              <span>{language === 'ar' ? 'إضافة معلومة جديدة' : 'Add New Info'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand-500)]/10 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
              {language === 'ar' ? 'مرجع مبسط وموثق' : 'Verified Islamic Reference'}
            </p>
            <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
              {language === 'ar' ? 'معلومات دينية' : 'Religious Information'}
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
              {language === 'ar'
                ? 'قسم يجمع معلومات مختصرة وموثقة في العقيدة والفقه والسيرة والأخلاق والدعاء.'
                : 'A section with concise insights in aqeedah, fiqh, seerah, manners, and supplications.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <span>+</span>
                <span>{language === 'ar' ? 'إضافة معلومة' : 'Add Info'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:grid-cols-[1fr_auto] md:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث في المعلومات الدينية بالكلمة المفتاحية أو العنوان...'
              : 'Search religious information by title or keyword...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)]"
        />

        <select
          value={activeCategory}
          onChange={(event) => setActiveCategory(event.target.value)}
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none"
        >
          <option value="all">{language === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {language === 'ar'
                ? (CATEGORY_LABELS[category]?.ar ?? category)
                : (CATEGORY_LABELS[category]?.en ?? category)}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-500)]/10 text-2xl text-[var(--brand-600)]">
            📖
          </div>
          <p className="font-title text-base font-bold text-[var(--text-strong)]">
            {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching information found'}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'جرّب البحث بكلمات أخرى أو اختر قسماً مختلفاً.'
              : 'Try searching with different keywords or pick another category.'}
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة معلومة لهذا القسم' : 'Add Info to this Category'}</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--brand-500)]/40 hover:shadow-md"
            >
              {/* Top Meta & Admin Delete Button */}
              <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[var(--brand-500)]/15 px-3 py-1 text-[var(--brand-600)]">
                  {language === 'ar'
                    ? (CATEGORY_LABELS[item.category]?.ar ?? item.category)
                    : (CATEGORY_LABELS[item.category]?.en ?? item.category)}
                </span>

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
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
        initialCategory={activeCategory === 'all' ? 'aqeedah' : activeCategory}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة المعلومة الدينية بنجاح إلى الخادم.'
              : 'New religious info added successfully to the backend server.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteMutation.isPending}
        titleAr="تأكيد حذف المعلومة الدينية من الخادم"
        titleEn="Confirm Religious Info Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذه المعلومة الدينية نهائياً من قاعدة البيانات في الخادم؟"
        messageEn="Are you sure you want to permanently delete this religious info from the backend database?"
        itemTitle={deleteTarget.title}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', title: '' })}
      />
    </section>
  )
}

