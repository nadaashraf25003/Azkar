import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { AZKAR_CATEGORIES } from '../data/categories'
import { useAddZikr, useAdhkarCategories, type BackendZikr } from '../hooks/useAdhkar'
import type { AzkarCategory } from '../types/azkar'

export interface AddZikrModalProps {
  isOpen: boolean
  initialCategory?: AzkarCategory
  categoryId?: string
  onClose: () => void
  onSuccess?: (createdItem: BackendZikr) => void
}

const QUICK_COUNTS = [1, 3, 7, 10, 33, 100]

export function AddZikrModal({
  isOpen,
  initialCategory = 'morning',
  categoryId: propCategoryId,
  onClose,
  onSuccess,
}: AddZikrModalProps) {
  const { language } = useSettings()
  const addZikrMutation = useAddZikr()
  const { data: backendCategories = [] } = useAdhkarCategories()

  const [category, setCategory] = useState<AzkarCategory>(initialCategory)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [textEn, setTextEn] = useState('')
  const [count, setCount] = useState<number>(1)
  const [reference, setReference] = useState('')
  const [benefit, setBenefit] = useState('')
  const [formError, setFormError] = useState('')

  // Resolve backend Category GUID
  const resolvedCategoryId = useMemo(() => {
    if (propCategoryId) return propCategoryId

    const list = Array.isArray(backendCategories)
      ? backendCategories
      : (backendCategories as any)?.value || []

    const matched = list.find(
      (c: any) => c.name?.toLowerCase() === category.toLowerCase()
    )
    return matched?.id || list[0]?.id || ''
  }, [backendCategories, category, propCategoryId])

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory)
      setTitle('')
      setText('')
      setTextEn('')
      setCount(1)
      setReference('')
      setBenefit('')
      setFormError('')
    }
  }, [isOpen, initialCategory])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !addZikrMutation.isPending) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, addZikrMutation.isPending, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!text.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة نص الذكر باللغة العربية.'
          : 'Please enter the Arabic text of the Zikr.'
      )
      return
    }

    if (count < 1) {
      setFormError(
        language === 'ar'
          ? 'عدد التكرار يجب أن يكون 1 على الأقل.'
          : 'Repeat count must be at least 1.'
      )
      return
    }

    if (!resolvedCategoryId) {
      setFormError(
        language === 'ar'
          ? 'لم يتم العثور على تصنيف مناسب في الخادم.'
          : 'No corresponding category found on the backend.'
      )
      return
    }

    try {
      const created = await addZikrMutation.mutateAsync({
        categoryId: resolvedCategoryId,
        arabicText: text.trim(),
        translation: textEn.trim() || undefined,
        transliteration: title.trim() || undefined,
        repeatCount: Number(count) || 1,
        source: reference.trim() || undefined,
        fadl: benefit.trim() || undefined,
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ في الخادم أثناء حفظ الذكر.'
            : 'A server error occurred while adding the Zikr.')
      )
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={addZikrMutation.isPending ? undefined : onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Box */}
      <div
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl transition-all sm:p-7"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Glow accent */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[var(--brand-500)]/15 blur-3xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--brand-500)]/30 bg-[var(--brand-500)]/10 text-xl text-[var(--brand-600)]">
                ✨
              </div>
              <div>
                <h3 className="font-title text-lg font-bold text-[var(--text-strong)] sm:text-xl">
                  {language === 'ar' ? 'إضافة ذكر جديد إلى أذكارك اليومية' : 'Add New Daily Zikr'}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {language === 'ar'
                    ? 'سيتم إضافة الذكر فوراً إلى القائمة اليومية وحفظه'
                    : 'The Zikr will be added immediately to the daily collection'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={addZikrMutation.isPending}
              onClick={onClose}
              className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)]">
                {language === 'ar' ? 'تصنيف الذكر' : 'Category'} *
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {AZKAR_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={[
                        'rounded-xl border px-3 py-2 text-xs font-semibold transition',
                        isSelected
                          ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white shadow-sm'
                          : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--brand-500)]',
                      ].join(' ')}
                    >
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Arabic Text (Main) */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)]">
                {language === 'ar' ? 'نص الذكر باللغة العربية' : 'Arabic Text'} *
              </label>
              <textarea
                required
                rows={3}
                dir="rtl"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اكتب نص الذكر أو الدعاء كاملاً مع التشكيل إن أمكن...'
                    : 'Enter the full Arabic Zikr text...'
                }
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5 font-title text-base leading-relaxed text-[var(--text-strong)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
              />
            </div>

            {/* Title / Tag & Repeat Count in 2 columns */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title / Tag */}
              <div>
                <label className="block text-xs font-bold text-[var(--muted)]">
                  {language === 'ar' ? 'عنوان أو نوع الذكر (اختياري)' : 'Title / Tag (Optional)'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: قرآن، سنة، تسبيح' : 'e.g. Quran, Sunnah, Tasbeeh'}
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)]"
                />
              </div>

              {/* Repeat Count */}
              <div>
                <label className="block text-xs font-bold text-[var(--muted)]">
                  {language === 'ar' ? 'عدد مرات التكرار (الهدف)' : 'Repeat Target Count'} *
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-center text-sm font-bold text-[var(--text-strong)] outline-none focus:border-[var(--brand-500)]"
                  />
                  {/* Quick count buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COUNTS.map((qc) => (
                      <button
                        key={qc}
                        type="button"
                        onClick={() => setCount(qc)}
                        className={[
                          'rounded-lg border px-2 py-1 text-xs font-semibold transition',
                          count === qc
                            ? 'border-[var(--brand-500)] bg-[var(--brand-500)]/15 text-[var(--brand-600)] font-bold'
                            : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]',
                        ].join(' ')}
                      >
                        {qc}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit (Fadl) */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)]">
                {language === 'ar' ? 'فضل الذكر وثوابه' : 'Benefit / Reward'}
              </label>
              <input
                type="text"
                value={benefit}
                onChange={(e) => setBenefit(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'مثال: حماية من الشرور، حفظ من الله طوال اليوم...'
                    : 'e.g. Protection from harm, sins forgiven...'
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            {/* Reference (Source) */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)]">
                {language === 'ar' ? 'المصدر أو المرجع' : 'Reference / Source'}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'مثال: رواه الترمذي، صحيح البخاري، سورة الإخلاص...'
                    : 'e.g. Sahih al-Bukhari, Tirmidhi...'
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            {/* Translation (English - optional) */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)]">
                {language === 'ar' ? 'الترجمة الإنجليزية (اختياري)' : 'English Translation (Optional)'}
              </label>
              <textarea
                rows={2}
                dir="ltr"
                value={textEn}
                onChange={(e) => setTextEn(e.target.value)}
                placeholder="English translation or meaning..."
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--text)] outline-none transition focus:border-[var(--brand-500)]"
              />
            </div>

            {/* Form Error alert */}
            {formError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600">
                {formError}
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--line)] pt-4">
              <button
                type="button"
                disabled={addZikrMutation.isPending}
                onClick={onClose}
                className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--line)]"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={addZikrMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-500)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--brand-600)] active:scale-95 disabled:opacity-50"
              >
                {addZikrMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>{language === 'ar' ? 'إضافة الذكر' : 'Add Zikr'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
