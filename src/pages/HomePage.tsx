import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryTabs } from '../components/CategoryTabs'
import { ZikrCard } from '../components/ZikrCard'
import { AddZikrModal } from '../components/AddZikrModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  useAdhkarCategories,
  useAdhkarByCategory,
  useDeleteZikr,
  type BackendZikr,
} from '../hooks/useAdhkar'
import { useDailyMessage } from '../hooks/useDailyMessage'
import { useTasbeehCounters } from '../hooks/useTasbeehCounters'
import type { AzkarCategory, ZikrItem } from '../types/azkar'
import { getAutoDailyCategory } from '../utils/time'

export function HomePage() {
  const initialCategory = getAutoDailyCategory()
  const [activeCategory, setActiveCategory] = useState<AzkarCategory>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const { language } = useSettings()

  // Admin authentication state
  const [isAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [viewerRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const isAdmin = isAdminAuthenticated || viewerRole === 'admin'

  // Add / Delete Modals state
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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Backend calls directly
  const { data: backendCategories, isLoading: isCatLoading } = useAdhkarCategories()

  const categoriesList = useMemo(() => {
    return Array.isArray(backendCategories)
      ? backendCategories
      : (backendCategories as any)?.value || []
  }, [backendCategories])

  const matchedBackendCategory = useMemo(() => {
    return categoriesList.find(
      (cat: any) => cat.name?.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [categoriesList, activeCategory])

  const { data: backendZikrs = [], isLoading: isZikrsLoading } = useAdhkarByCategory(
    matchedBackendCategory?.id
  )

  const deleteZikrMutation = useDeleteZikr()
  const { data: dailyMessage } = useDailyMessage()
  const { counters, increment, decrement, resetCounter } = useTasbeehCounters()

  const displayData = useMemo<ZikrItem[]>(() => {
    const list = Array.isArray(backendZikrs)
      ? backendZikrs
      : (backendZikrs as any)?.value || []

    return list.map((item: BackendZikr) => ({
      id: item.id,
      category: activeCategory,
      title: item.transliteration || '',
      text: item.arabicText,
      textEn: item.translation,
      count: item.repeatCount,
      reference: item.source,
      benefit: item.fadl,
    }))
  }, [backendZikrs, activeCategory])

  const isLoading = isCatLoading || isZikrsLoading


  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleDeleteClick = (zikr: ZikrItem) => {
    setDeleteTarget({
      isOpen: true,
      id: zikr.id,
      titleSnippet: zikr.text.substring(0, 80) + (zikr.text.length > 80 ? '...' : ''),
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await deleteZikrMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })
      showToast(
        language === 'ar'
          ? 'تم حذف الذكر بنجاح من أذكارك اليومية.'
          : 'Zikr deleted successfully from daily list.'
      )
    } catch (err: any) {
      showToast(
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الذكر. يرجى المحاولة لاحقاً.'
            : 'Failed to delete Zikr. Please try again.')
      )
    }
  }

  const filtered = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()

    return displayData.filter((item) => {
      return (
        normalized.length === 0 ||
        item.text.toLowerCase().includes(normalized) ||
        (item.textEn && item.textEn.toLowerCase().includes(normalized)) ||
        (item.benefit && item.benefit.toLowerCase().includes(normalized)) ||
        (item.reference && item.reference.toLowerCase().includes(normalized))
      )
    })
  }, [displayData, searchQuery])

  const progressPercent = useMemo(() => {
    if (filtered.length === 0) {
      return 0
    }

    const completed = filtered.filter((item) => (counters[item.id] ?? 0) >= item.count).length
    return Math.round((completed / filtered.length) * 100)
  }, [counters, filtered])

  return (
    <section className="space-y-4 md:space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 shadow-2xl transition-all">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 sm:text-sm">
            {toastMessage}
          </span>
        </div>
      ) : null}

      {/* ADMIN CONTROL BAR (Visible when Admin is logged in) */}
      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-sm text-amber-600">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-title text-xs font-bold text-amber-700 dark:text-amber-400 sm:text-sm">
                  {language === 'ar' ? 'تحكم المشرف مفعل' : 'Admin Mode Active'}
                </span>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {language === 'ar' ? 'إضافة وحذف الأذكار' : 'Add & Delete Controls'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                {language === 'ar'
                  ? 'يمكنك إضافة أذكار جديدة أو حذف أي ذكر بالنقر على أيقونة الحذف في البطاقة.'
                  : 'You can add new Azkar or delete existing ones directly from the cards.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/azkar"
              className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-[var(--panel)] px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-500/10"
            >
              <span>⚙️</span>
              <span>{language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add Zikr'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Banner */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'خطة اليوم' : 'Today plan'}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
            {language === 'ar' ? 'أذكارك اليومية' : 'Your Daily Azkar'}
          </h1>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--brand-500)] bg-[var(--brand-500)]/10 px-3 py-1.5 text-xs font-bold text-[var(--brand-600)] transition hover:bg-[var(--brand-500)] hover:text-white"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة ذكر لهذه الفئة' : 'Add Zikr to Category'}</span>
            </button>
          ) : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'المجموعة المقترحة تلقائيًا حسب الوقت. يمكنك التبديل والبحث بسهولة.'
            : 'The category is selected automatically by time. You can switch and search anytime.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
            {language === 'ar' ? 'إنجاز الفئة' : 'Category progress'}: {progressPercent}%
          </span>
          <span className="rounded-full bg-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {language === 'ar' ? 'تلقائي' : 'Auto'}: {initialCategory}
          </span>
          <span className="rounded-full bg-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {language === 'ar' ? 'العدد' : 'Count'}: {filtered.length}
          </span>
        </div>
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        language={language}
      />

      {dailyMessage ? (
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
              {language === 'ar' ? 'رسالة اليوم' : 'Message of the Day'}
            </p>
            <Link
              to={`/messages/type/${dailyMessage.type}`}
              className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-semibold transition hover:border-[var(--brand-500)]"
            >
              {language === 'ar' ? 'عرض النوع' : 'Open Type'}
            </Link>
          </div>

          <p className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? dailyMessage.titleAr : dailyMessage.titleEn}
          </p>
          <p className="mt-2 text-sm leading-8 text-[var(--text)]">
            {language === 'ar' ? dailyMessage.textAr : dailyMessage.textEn}
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
            {language === 'ar' ? 'بقلم' : 'By'}: {language === 'ar' ? dailyMessage.authorAr : dailyMessage.authorEn}
          </p>
        </article>
      ) : null}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث بالكلمة المفتاحية أو الفضل...'
              : 'Search by keyword or benefit...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[var(--brand-500)] border-t-transparent" />
          <p className="mt-2 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري تحميل الأذكار...' : 'Loading Azkar...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            {language === 'ar'
              ? 'لا توجد نتائج بهذه الفلاتر.'
              : 'No Azkar found for this filter.'}
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
            >
              <span>+</span>
              <span>{language === 'ar' ? 'إضافة ذكر جديد لهذه الفئة' : 'Add New Zikr'}</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <ZikrCard
              key={item.id}
              zikr={item}
              language={language}
              currentCount={counters[item.id] ?? 0}
              onIncrement={increment}
              onDecrement={decrement}
              onReset={resetCounter}
              showTypeTitle
              isAdmin={isAdmin}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* ADD ZIKR MODAL */}
      <AddZikrModal
        isOpen={isAddModalOpen}
        initialCategory={activeCategory}
        categoryId={matchedBackendCategory?.id}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === 'ar'
              ? 'تمت إضافة الذكر بنجاح إلى قاعدة بيانات الخادم.'
              : 'Zikr added successfully to backend database.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteZikrMutation.isPending}
        titleAr="تأكيد حذف الذكر اليومي"
        titleEn="Confirm Daily Zikr Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا الذكر نهائياً من قائمة أذكارك اليومية؟ لا يمكن التراجع عن هذا الإجراء."
        messageEn="Are you sure you want to permanently delete this Zikr from your Daily Azkar? This action cannot be undone."
        itemTitle={deleteTarget.titleSnippet}
        confirmTextAr="نعم، حذف الذكر"
        confirmTextEn="Yes, Delete Zikr"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })}
      />
    </section>
  )
}




