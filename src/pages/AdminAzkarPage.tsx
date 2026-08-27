import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import {
  useDeleteZikr,
  useAdhkarCategories,
  useAllAdhkar,
  type BackendZikr,
} from '../hooks/useAdhkar'
import { ZikrCard } from '../components/ZikrCard'
import { AddZikrModal } from '../components/AddZikrModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import type { AzkarCategory, ZikrItem } from '../types/azkar'

export function AdminAzkarPage() {
  const { language } = useSettings()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all')
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

  // Fetch directly from backend
  const { data: backendCategories = [], isLoading: isCatLoading } = useAdhkarCategories()
  const { data: rawAllAdhkar = [], isLoading: isAdhkarLoading, refetch } = useAllAdhkar()
  const deleteZikrMutation = useDeleteZikr()

  const categoriesList = useMemo(() => {
    return Array.isArray(backendCategories)
      ? backendCategories
      : (backendCategories as any)?.value || []
  }, [backendCategories])

  const allAdhkarList = useMemo(() => {
    return Array.isArray(rawAllAdhkar)
      ? rawAllAdhkar
      : (rawAllAdhkar as any)?.value || []
  }, [rawAllAdhkar])

  // Map backend Category ID to frontend category tag
  const categoryIdToNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const cat of categoriesList) {
      map.set(cat.id, cat.name?.toLowerCase() || 'general')
    }
    return map
  }, [categoriesList])

  // Convert backend items to ZikrItem format for ZikrCard display
  const allZikrItems = useMemo<ZikrItem[]>(() => {
    return allAdhkarList.map((item: BackendZikr) => {
      const catName = categoryIdToNameMap.get(item.categoryId) || 'general'
      return {
        id: item.id,
        category: catName as AzkarCategory,
        title: item.transliteration || '',
        text: item.arabicText,
        textEn: item.translation,
        count: item.repeatCount,
        reference: item.source,
        benefit: item.fadl,
      }
    })
  }, [allAdhkarList, categoryIdToNameMap])

  // Filter by category and search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allZikrItems.filter((item, index) => {
      const rawBackendItem = allAdhkarList[index]
      const matchesCategory =
        selectedCategoryId === 'all' ||
        rawBackendItem?.categoryId === selectedCategoryId

      const matchesQuery =
        query.length === 0 ||
        item.text.toLowerCase().includes(query) ||
        (item.textEn && item.textEn.toLowerCase().includes(query)) ||
        (item.benefit && item.benefit.toLowerCase().includes(query)) ||
        (item.reference && item.reference.toLowerCase().includes(query)) ||
        (item.title && item.title.toLowerCase().includes(query))

      return matchesCategory && matchesQuery
    })
  }, [allZikrItems, allAdhkarList, selectedCategoryId, searchQuery])

  // Count items per backend category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of categoriesList) {
      counts[cat.id] = 0
    }
    for (const item of allAdhkarList) {
      if (counts[item.categoryId] !== undefined) {
        counts[item.categoryId]++
      } else {
        counts[item.categoryId] = 1
      }
    }
    return counts
  }, [categoriesList, allAdhkarList])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
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
      showNotification(
        'success',
        language === 'ar'
          ? 'تم حذف الذكر بنجاح من قاعدة البيانات على الخادم.'
          : 'Zikr deleted successfully from backend database.'
      )
    } catch (err: any) {
      showNotification(
        'error',
        err?.message ||
          (language === 'ar'
            ? 'تعذر حذف الذكر من الخادم. يرجى المحاولة مرة أخرى.'
            : 'Failed to delete Zikr on server. Please try again.')
      )
    }
  }

  const selectedCategoryObj = categoriesList.find((c: any) => c.id === selectedCategoryId)
  const initialCatEnum = (selectedCategoryObj?.name?.toLowerCase() || 'morning') as AzkarCategory

  const isLoading = isCatLoading || isAdhkarLoading

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
              📿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-[var(--brand-500)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)]">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'إدارة أذكارك اليومية' : 'Daily Azkar Management'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'إضافة وحذف وتعديل الأذكار اليومية مباشرة على قاعدة بيانات الخادم'
                  : 'Add, moderate, and delete daily Azkar directly on the backend database'}
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
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--brand-500)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{language === 'ar' ? 'معاينة الموقع العام' : 'View Public Site'}</span>
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
              <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add New Zikr'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي أذكار الخادم' : 'Total Backend Azkar'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {allAdhkarList.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'الفئات النشطة' : 'Categories'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-[var(--brand-600)] sm:text-2xl">
              {categoriesList.length}
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
            onClick={() => setSelectedCategoryId('all')}
            className={[
              'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
              selectedCategoryId === 'all'
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
            ].join(' ')}
          >
            <span>{language === 'ar' ? 'جميع الأذكار' : 'All Azkar'}</span>
            <span className="ms-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
              {allAdhkarList.length}
            </span>
          </button>

          {categoriesList.map((cat: any) => {
            const isSelected = selectedCategoryId === cat.id
            const count = categoryCounts[cat.id] || 0
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={[
                  'rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                  isSelected
                    ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                    : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-amber-500',
                ].join(' ')}
              >
                <span>{language === 'ar' ? cat.arabicName || cat.name : cat.name}</span>
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
                ? 'ابحث في الأذكار بالكلمة المفتاحية، الفضل، أو المصدر...'
                : 'Search Azkar by keyword, benefit, or reference...'
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
            {language === 'ar' ? 'جاري جلب الأذكار من الخادم...' : 'Fetching Azkar from backend...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-500">
            📿
          </div>
          <h3 className="font-title text-base font-bold text-[var(--text-strong)] sm:text-lg">
            {language === 'ar' ? 'لا توجد أذكار في هذه الفئة' : 'No Azkar Found in this Category'}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يمكنك إضافة ذكر جديد الآن ليتم حفظه في الخادم.'
              : 'You can add a new Zikr now to save it to the backend server.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-amber-700"
          >
            <span>+</span>
            <span>{language === 'ar' ? 'إضافة ذكر جديد' : 'Add New Zikr'}</span>
          </button>
        </div>
      ) : (
        /* Azkar Cards Grid */
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <ZikrCard
              key={item.id}
              zikr={item}
              language={language}
              currentCount={0}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onReset={() => {}}
              showTypeTitle={true}
              isAdmin={true}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* ADD ZIKR MODAL */}
      <AddZikrModal
        isOpen={isAddModalOpen}
        initialCategory={initialCatEnum}
        categoryId={selectedCategoryId === 'all' ? undefined : selectedCategoryId}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showNotification(
            'success',
            language === 'ar'
              ? 'تمت إضافة الذكر الجديد بنجاح إلى الخادم.'
              : 'New Zikr added successfully to the backend server.'
          )
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget.isOpen}
        isLoading={deleteZikrMutation.isPending}
        titleAr="تأكيد حذف الذكر من الخادم"
        titleEn="Confirm Backend Zikr Deletion"
        messageAr="هل أنت متأكد من رغبتك في حذف هذا الذكر نهائياً من قاعدة البيانات في الخادم؟ لا يمكن التراجع عن هذا الإجراء."
        messageEn="Are you sure you want to permanently delete this Zikr from the backend database? This action cannot be undone."
        itemTitle={deleteTarget.titleSnippet}
        confirmTextAr="نعم، حذف من الخادم"
        confirmTextEn="Yes, Delete from Server"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget({ isOpen: false, id: '', titleSnippet: '' })}
      />
    </section>
  )
}

