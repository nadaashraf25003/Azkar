export type AzkarCategory =
  | 'morning'
  | 'evening'
  | 'sleep'
  | 'afterPrayer'
  | 'general'

export type Language = 'ar' | 'en'

export interface ZikrItem {
  id: string
  category: AzkarCategory
  text: string
  textEn: string
  count: number
  reference: string
  benefit: string
}
