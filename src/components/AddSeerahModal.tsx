import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddSeerahEvent } from '../hooks/useSeerah'

export interface AddSeerahModalProps {
  isOpen: boolean
  initialPeriod?: 'Makkah' | 'Madinah'
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

export function AddSeerahModal({
  isOpen,
  initialPeriod = 'Makkah',
  onClose,
  onSuccess,
}: AddSeerahModalProps) {
  const { language } = useSettings()
  const addMutation = useAddSeerahEvent()

  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState<'Makkah' | 'Madinah'>(initialPeriod)
  const [yearHijri, setYearHijri] = useState<number | string>(1)
  const [order, setOrder] = useState<number | string>(1)
  const [description, setDescription] = useState('')
  const [lessons, setLessons] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setPeriod(initialPeriod)
      setYearHijri(initialPeriod === 'Makkah' ? -1 : 1)
      setOrder(1)
      setDescription('')
      setLessons('')
      setFormError('')
    }
  }, [isOpen, initialPeriod])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !addMutation.isPending) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, addMutation.isPending, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة عنوان حدث السيرة النبوية.'
          : 'Please enter the title of the Seerah event.'
      )
      return
    }

    if (!description.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة تفاصيل وشرح الحدث.'
          : 'Please enter the event description.'
      )
      return
    }

    // Format lessons (split by newline or semicolon)
    const formattedLessons = lessons
      .split(/[\n;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join('; ')

    try {
      const created = await addMutation.mutateAsync({
        title: title.trim(),
        period,
        yearHijri: Number(yearHijri) || 0,
        order: Number(order) || 0,
        description: description.trim(),
        lessonsLearned: formattedLessons || (language === 'ar' ? 'الثبات والصبر والاقتداء بالنبي صلى الله عليه وسلم' : 'Patience and following the Prophet'),
      })

      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      setFormError(
        err?.message ||
          (language === 'ar'
            ? 'حدث خطأ في الخادم أثناء حفظ حدث السيرة.'
            : 'A server error occurred while adding the event.')
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-xl text-amber-600 shadow-inner">
              📜
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة حدث جديد في السيرة' : 'Add New Seerah Event'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ محطة جديدة من السيرة النبوية مباشرة في قاعدة بيانات الخادم'
                  : 'Save a new moment of the Prophetic biography directly to the database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={addMutation.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] text-sm text-[var(--muted)] transition hover:bg-[var(--line)]/30 hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          ) : null}

          {/* Period Selection (Makkah / Madinah) */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'العهد النبوي (الفترة)' : 'Period'} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPeriod('Makkah')
                  if (Number(yearHijri) > 0) setYearHijri(-1)
                }}
                className={[
                  'flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition sm:text-sm',
                  period === 'Makkah'
                    ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-amber-500',
                ].join(' ')}
              >
                <span>🕋</span>
                <span>{language === 'ar' ? 'العهد المكي (قبل الهجرة)' : 'Makkah Period (Pre-Hijrah)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPeriod('Madinah')
                  if (Number(yearHijri) <= 0) setYearHijri(1)
                }}
                className={[
                  'flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition sm:text-sm',
                  period === 'Madinah'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:border-emerald-500',
                ].join(' ')}
              >
                <span>🕌</span>
                <span>{language === 'ar' ? 'العهد المدني (بعد الهجرة)' : 'Madinah Period (Post-Hijrah)'}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'عنوان الحدث / الغزوة / الموقف' : 'Event Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: حادثة شق الصدر، بيعة العقبة الأولى، صلح الحديبية...'
                  : 'e.g. The First Pledge of Aqabah, Treaty of Hudaybiyyah...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          {/* Year Hijri & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'السنة الهجرية (مثال: 2 هـ أو -1)' : 'Year Hijri (e.g. 2 AH or -1)'} *
              </label>
              <input
                type="number"
                value={yearHijri}
                onChange={(e) => setYearHijri(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'الترتيب الزمني (Order)' : 'Timeline Order'} *
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'تفاصيل وشرح الحدث' : 'Event Description & Details'} *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب تفاصيل الموقف النبوي والوقائع التاريخية...'
                  : 'Write full details and chronological events...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'الدروس والعبر المستفادة (افصل بينها بسطر جديد أو فاصلة منقوطة ;)' : 'Lessons Learned (separate with newlines or ;)'}
            </label>
            <textarea
              rows={2}
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: أهمية التخطيط والأخذ بالأسباب؛ الثقة بنصر الله؛ الرحمة بالضعفاء'
                  : 'e.g. Reliance on Allah; Strategic planning; Compassion'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={addMutation.isPending}
              className="rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-xs font-bold text-[var(--text)] transition hover:bg-[var(--line)]/30"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ الحدث في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
