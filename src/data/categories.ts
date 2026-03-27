import type { AzkarCategory } from '../types/azkar'

export interface CategoryMeta {
  id: AzkarCategory
  labelAr: string
  labelEn: string
}

export const AZKAR_CATEGORIES: CategoryMeta[] = [
  { id: 'morning', labelAr: 'أذكار الصباح', labelEn: 'Morning' },
  { id: 'evening', labelAr: 'أذكار المساء', labelEn: 'Evening' },
  { id: 'sleep', labelAr: 'أذكار النوم', labelEn: 'Sleep' },
  { id: 'afterPrayer', labelAr: 'بعد الصلاة', labelEn: 'After Prayer' },
  { id: 'general', labelAr: 'أذكار عامة', labelEn: 'General' },
]

export function categoryLabel(id: AzkarCategory, language: 'ar' | 'en'): string {
  const category = AZKAR_CATEGORIES.find((item) => item.id === id)
  if (!category) {
    return id
  }

  return language === 'ar' ? category.labelAr : category.labelEn
}
