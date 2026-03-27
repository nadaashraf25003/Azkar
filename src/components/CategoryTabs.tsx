import { AZKAR_CATEGORIES } from '../data/categories'
import type { AzkarCategory, Language } from '../types/azkar'

interface CategoryTabsProps {
  activeCategory: AzkarCategory
  onSelect: (category: AzkarCategory) => void
  language: Language
}

export function CategoryTabs({
  activeCategory,
  onSelect,
  language,
}: CategoryTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {AZKAR_CATEGORIES.map((category) => {
        const active = category.id === activeCategory

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={[
              'rounded-2xl border px-3 py-2 text-sm font-semibold transition',
              active
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--brand-500)]',
            ].join(' ')}
          >
            {language === 'ar' ? category.labelAr : category.labelEn}
          </button>
        )
      })}
    </div>
  )
}
