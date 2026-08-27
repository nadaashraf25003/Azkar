import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAddTasbeehPreset } from '../hooks/useTasbeeh'

export interface AddTasbeehModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdItem?: any) => void
}

export function AddTasbeehModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTasbeehModalProps) {
  const { language } = useSettings()
  const addMutation = useAddTasbeehPreset()

  const [name, setName] = useState('')
  const [arabicText, setArabicText] = useState('')
  const [transliteration, setTransliteration] = useState('')
  const [benefit, setBenefit] = useState('')
  const [targetCount, setTargetCount] = useState<number | string>(33)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName('')
      setArabicText('')
      setTransliteration('')
      setBenefit('')
      setTargetCount(33)
      setFormError('')
    }
  }, [isOpen])

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

    if (!name.trim()) {
      setFormError(
        language === 'ar'
          ? 'يرجى كتابة اسم الذكر أو التسبيح.'
          : 'Please enter the preset name.'
      )
      return
    }

    const textToSave = arabicText.trim() || name.trim()

    try {
      const created = await addMutation.mutateAsync({
        name: name.trim(),
        arabicText: textToSave,
        transliteration: transliteration.trim() || name.trim(),
        benefit: benefit.trim() || (language === 'ar' ? 'أجر عظيم وذكر لله تعالى' : 'Great reward and remembrance of Allah'),
        targetCount: Number(targetCount) || 33,
        isCustom: false,
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
            : 'A server error occurred while adding the preset.')
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
        className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--brand-500)]/30 bg-[var(--brand-500)]/15 text-xl text-[var(--brand-600)] shadow-inner">
              📿
            </div>
            <div>
              <h2 className="font-title text-xl font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'إضافة ذكر جديد للعداد' : 'Add New Tasbeeh Preset'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {language === 'ar'
                  ? 'حفظ ذكر وتسبيح جديد مباشرة في قاعدة بيانات العداد بالخادم'
                  : 'Save a new Tasbeeh preset directly to backend database'}
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

          {/* Preset Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'اسم الذكر / التسبيح' : 'Tasbeeh Name'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: سبحان الله وبحمده سبحان الله العظيم'
                  : 'e.g. SubhanAllah wa bihamdihi'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
              required
            />
          </div>

          {/* Arabic Text (Optional if same as name) */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'النص بالتشكيل (اختياري)' : 'Arabic Text with Harakat (Optional)'}
            </label>
            <input
              type="text"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ العَظِيم'
                  : 'Arabic formatted text...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
            />
          </div>

          {/* Target Count & Benefit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'العدد المستهدف الافتراضي' : 'Target Count'} *
              </label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
                {language === 'ar' ? 'النطق بالإنجليزية / Translation' : 'Transliteration'}
              </label>
              <input
                type="text"
                value={transliteration}
                onChange={(e) => setTransliteration(e.target.value)}
                placeholder="SubhanAllah"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
              />
            </div>
          </div>

          {/* Benefit / Reward */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'الفضل والأجر المستفاد (اختياري)' : 'Benefit & Reward (Optional)'}
            </label>
            <textarea
              rows={2}
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن'
                  : 'e.g. Light on the tongue, heavy in the scale...'
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-500)]/20"
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
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-600)] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[var(--brand-700)] active:scale-95 disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{language === 'ar' ? 'جاري الحفظ في الخادم...' : 'Saving to server...'}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{language === 'ar' ? 'حفظ الذكر في الخادم' : 'Save to Server'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
