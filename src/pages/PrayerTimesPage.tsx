import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { calculateQiblaBearing, getQiblaMapsUrl } from '../utils/qibla'

interface PrayerPreferences {
  method: number
  school: 0 | 1
  timeFormat: '12' | '24'
}

interface Coordinates {
  latitude: number
  longitude: number
}

interface TimingsResponse {
  data: {
    timings: Record<string, string>
    date: {
      hijri: {
        date: string
        weekday: {
          ar: string
          en: string
        }
        month: {
          ar: string
          en: string
        }
        year: string
      }
    }
  }
}

interface PrayerData {
  timings: Record<string, string>
  hijri: {
    date: string
    weekdayAr: string
    weekdayEn: string
    monthAr: string
    monthEn: string
    year: string
  }
}

interface CalendarResponse {
  data: Array<{
    date: {
      gregorian: {
        date: string
      }
      hijri: {
        date: string
        weekday: {
          ar: string
          en: string
        }
        month: {
          ar: string
          en: string
        }
        year: string
      }
    }
  }>
}

interface CalendarDay {
  gregorianDate: string
  monthNumber: number
  dayNumber: number
  hijriDayNumber: number
  hijriDate: string
  hijriWeekdayAr: string
  hijriWeekdayEn: string
  hijriMonthAr: string
  hijriMonthEn: string
  hijriYear: string
}

interface MonthCalendarCell {
  dayNumber: number
  dayData?: CalendarDay
}

interface HijriMonthGroup {
  key: string
  monthAr: string
  monthEn: string
  year: string
  days: CalendarDay[]
}

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

function cleanTime(value: string): string {
  return value.split(' ')[0]
}

function formatTime(value: string, format: '12' | '24'): string {
  const normalized = cleanTime(value)
  if (format === '24') {
    return normalized
  }

  const [hourText, minuteText] = normalized.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return normalized
  }

  const period = hour >= 12 ? 'PM' : 'AM'
  const twelveHour = hour % 12 || 12
  return `${twelveHour}:${minute.toString().padStart(2, '0')} ${period}`
}

function parseHijriDateParts(value: string): { day: string; month: string; year: string } {
  const [day = '', month = '', year = ''] = value.split('-')
  return { day, month, year }
}

function parseGregorianDateParts(value: string): { day: number; month: number; year: number } {
  const [dayText = '1', monthText = '1', yearText = '1970'] = value.split('-')
  return {
    day: Number(dayText),
    month: Number(monthText),
    year: Number(yearText),
  }
}

function getTodayGregorianKey(): string {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = String(today.getFullYear())
  return `${day}-${month}-${year}`
}

function buildMonthCalendarCells(
  days: CalendarDay[],
): Array<MonthCalendarCell | null> {
  if (days.length === 0) {
    return []
  }

  const sortedDays = [...days].sort((a, b) => a.hijriDayNumber - b.hijriDayNumber)
  const weekDayToIndex: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }

  const firstDayOffset = weekDayToIndex[sortedDays[0].hijriWeekdayEn] ?? 0
  const daysInMonth = Math.max(...sortedDays.map((item) => item.hijriDayNumber))
  const dayMap = new Map(sortedDays.map((item) => [item.hijriDayNumber, item]))
  const cells: Array<MonthCalendarCell | null> = []

  for (let i = 0; i < firstDayOffset; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      dayNumber: day,
      dayData: dayMap.get(day),
    })
  }

  return cells
}

export function PrayerTimesPage() {
  const { language } = useSettings()
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState('')
  const [heading, setHeading] = useState<number | null>(null)
  const [showYearCalendar, setShowYearCalendar] = useState(false)
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear())

  const [preferences, setPreferences] = useLocalStorage<PrayerPreferences>(
    'azkar-prayer-preferences',
    {
      method: 4,
      school: 0,
      timeFormat: '24',
    },
  )

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError('')
      },
      () => {
        setLocationError('Unable to access your location for prayer times.')
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  const enableCompass = async () => {
    type IOSDeviceOrientationEvent = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }

    const eventType = DeviceOrientationEvent as IOSDeviceOrientationEvent

    if (typeof eventType.requestPermission === 'function') {
      const permission = await eventType.requestPermission()
      if (permission !== 'granted') {
        return
      }
    }

    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading

      if (typeof webkitHeading === 'number') {
        setHeading(webkitHeading)
        return
      }

      if (typeof event.alpha === 'number') {
        setHeading(360 - event.alpha)
      }
    }

    window.addEventListener('deviceorientation', onOrientation, true)
  }

  const prayerQuery = useQuery({
    queryKey: ['prayer-times', coords, preferences.method, preferences.school],
    queryFn: async (): Promise<PrayerData | null> => {
      if (!coords) {
        return null
      }

      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${preferences.method}&school=${preferences.school}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times')
      }

      const json = (await response.json()) as TimingsResponse
      return {
        timings: json.data.timings,
        hijri: {
          date: json.data.date.hijri.date,
          weekdayAr: json.data.date.hijri.weekday.ar,
          weekdayEn: json.data.date.hijri.weekday.en,
          monthAr: json.data.date.hijri.month.ar,
          monthEn: json.data.date.hijri.month.en,
          year: json.data.date.hijri.year,
        },
      }
    },
    enabled: Boolean(coords),
    staleTime: 60_000,
  })

  const yearlyCalendarQuery = useQuery({
    queryKey: ['yearly-calendar', coords, preferences.method, preferences.school, calendarYear],
    queryFn: async (): Promise<CalendarDay[]> => {
      if (!coords) {
        return []
      }

      const allDays: CalendarDay[] = []
      let successfulMonths = 0

      for (let month = 1; month <= 12; month += 1) {
        let monthLoaded = false

        for (let attempt = 0; attempt < 2; attempt += 1) {
          const url = `https://api.aladhan.com/v1/calendar?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${preferences.method}&school=${preferences.school}&month=${month}&year=${calendarYear}`

          try {
            const response = await fetch(url)
            if (!response.ok) {
              continue
            }

            const payload = (await response.json()) as CalendarResponse
            const monthDays = payload.data.map((item) => {
              const { day, month: gregorianMonth } = parseGregorianDateParts(item.date.gregorian.date)
              const hijriParts = parseHijriDateParts(item.date.hijri.date)

              return {
                gregorianDate: item.date.gregorian.date,
                monthNumber: gregorianMonth,
                dayNumber: day,
                hijriDayNumber: Number(hijriParts.day),
                hijriDate: item.date.hijri.date,
                hijriWeekdayAr: item.date.hijri.weekday.ar,
                hijriWeekdayEn: item.date.hijri.weekday.en,
                hijriMonthAr: item.date.hijri.month.ar,
                hijriMonthEn: item.date.hijri.month.en,
                hijriYear: item.date.hijri.year,
              }
            })

            allDays.push(...monthDays)
            successfulMonths += 1
            monthLoaded = true
            break
          } catch {
            // Network hiccup: try once more before skipping this month.
          }
        }

        if (!monthLoaded) {
          // Continue with available months instead of failing the whole calendar.
        }
      }

      if (successfulMonths === 0) {
        throw new Error('Failed to fetch yearly calendar')
      }

      return allDays.sort((a, b) => {
        if (a.monthNumber !== b.monthNumber) {
          return a.monthNumber - b.monthNumber
        }

        return a.dayNumber - b.dayNumber
      })
    },
    enabled: showYearCalendar && Boolean(coords),
    staleTime: 300_000,
    retry: 1,
  })

  const qiblaBearing = useMemo(() => {
    if (!coords) {
      return null
    }

    return calculateQiblaBearing(coords.latitude, coords.longitude)
  }, [coords])

  const qiblaArrowRotation = useMemo(() => {
    if (qiblaBearing === null) {
      return null
    }

    if (heading === null) {
      return qiblaBearing
    }

    return (qiblaBearing - heading + 360) % 360
  }, [heading, qiblaBearing])

  const timings = prayerQuery.data?.timings
  const hijri = prayerQuery.data?.hijri
  const hijriParts = hijri ? parseHijriDateParts(hijri.date) : null
  const yearlyHijriMonths = useMemo(() => {
    const days = yearlyCalendarQuery.data ?? []
    const groups = new Map<string, HijriMonthGroup>()

    for (const day of days) {
      const key = `${day.hijriMonthEn}-${day.hijriYear}`
      const existing = groups.get(key)

      if (existing) {
        existing.days.push(day)
      } else {
        groups.set(key, {
          key,
          monthAr: day.hijriMonthAr,
          monthEn: day.hijriMonthEn,
          year: day.hijriYear,
          days: [day],
        })
      }
    }

    const list = Array.from(groups.values())

    return list.sort((a, b) => {
      const firstA = a.days[0]?.gregorianDate ?? '01-01-1970'
      const firstB = b.days[0]?.gregorianDate ?? '01-01-1970'
      const aParts = parseGregorianDateParts(firstA)
      const bParts = parseGregorianDateParts(firstB)

      if (aParts.year !== bParts.year) {
        return aParts.year - bParts.year
      }

      if (aParts.month !== bParts.month) {
        return aParts.month - bParts.month
      }

      return aParts.day - bParts.day
    })
  }, [yearlyCalendarQuery.data])
  const todayGregorianKey = useMemo(() => getTodayGregorianKey(), [])
  const weekDayLabels = language === 'ar' ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'مواقيت الصلاة' : 'Prayer Times'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {language === 'ar' ? 'توقيت الصلاة والقبلة' : 'Prayer Times and Qibla'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'يتم جلب المواقيت تلقائيًا حسب موقعك ويمكن تعديل طريقة الحساب.'
            : 'Times are loaded automatically from your location with customizable calculation preferences.'}
        </p>
        {hijri && hijriParts ? (
          <div className="mt-3 inline-flex overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
            <div className="flex min-w-[88px] flex-col items-center justify-center border-r border-[var(--line)] bg-[var(--brand-500)] px-3 py-2 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                {language === 'ar' ? 'هجري' : 'Hijri'}
              </p>
              <p className="text-2xl font-bold leading-none">{hijriParts.day || '--'}</p>
              <p className="mt-1 text-[11px] font-medium opacity-90">{hijriParts.year || hijri.year}</p>
            </div>

            <div className="px-3 py-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {language === 'ar' ? hijri.monthAr : hijri.monthEn}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {language === 'ar' ? hijri.weekdayAr : hijri.weekdayEn}
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--brand-700)]">
                {language === 'ar' ? `التقويم: ${hijri.date}` : `Calendar: ${hijri.date}`}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">
              {language === 'ar' ? 'الأوقات اليوم' : 'Today timings'}
            </h2>
            <button
              type="button"
              onClick={detectLocation}
              className="rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
            >
              {language === 'ar' ? 'تحديث الموقع' : 'Refresh location'}
            </button>
          </div>

          {coords ? (
            <p className="mb-4 break-all text-xs text-[var(--muted)]">
              {language === 'ar' ? 'الموقع:' : 'Location:'} {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </p>
          ) : (
            <p className="mb-4 text-sm text-[var(--muted)]">
              {language === 'ar' ? 'اضغط تحديث الموقع لعرض الأوقات.' : 'Press refresh location to load timings.'}
            </p>
          )}

          {locationError ? <p className="mb-4 text-sm text-[var(--warn)]">{locationError}</p> : null}

          {prayerQuery.isLoading ? (
            <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : null}

          {prayerQuery.isError ? (
            <p className="text-sm text-[var(--warn)]">
              {language === 'ar' ? 'تعذر جلب مواقيت الصلاة.' : 'Failed to load prayer timings.'}
            </p>
          ) : null}

          {timings ? (
            <div className="grid gap-2 md:grid-cols-2">
              {PRAYER_KEYS.map((key) => (
                <div
                  key={key}
                  className="rounded-xl border border-[var(--line)] bg-[var(--brand-100)] px-3 py-2"
                >
                  <p className="text-xs text-[var(--muted)]">{key}</p>
                  <p className="text-base font-semibold text-[var(--text-strong)]">
                    {formatTime(timings[key], preferences.timeFormat)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'تفضيلات الحساب' : 'Calculation preferences'}
          </h2>

          <label className="mb-3 block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'طريقة الحساب' : 'Method'}
            <select
              value={preferences.method}
              onChange={(event) =>
                setPreferences((prev) => ({ ...prev, method: Number(event.target.value) }))
              }
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            >
              <option value={2}>ISNA</option>
              <option value={3}>MWL</option>
              <option value={4}>Umm Al-Qura</option>
              <option value={5}>Egyptian</option>
            </select>
          </label>

          <label className="mb-3 block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'المذهب (العصر)' : 'Asr school'}
            <select
              value={preferences.school}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  school: Number(event.target.value) as 0 | 1,
                }))
              }
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            >
              <option value={0}>{language === 'ar' ? 'شافعي' : 'Shafi'}</option>
              <option value={1}>{language === 'ar' ? 'حنفي' : 'Hanafi'}</option>
            </select>
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {language === 'ar' ? 'تنسيق الوقت' : 'Time format'}
            <select
              value={preferences.timeFormat}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  timeFormat: event.target.value as '12' | '24',
                }))
              }
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            >
              <option value="24">24h</option>
              <option value="12">12h</option>
            </select>
          </label>
        </article>
      </div>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {language === 'ar' ? 'تقويم السنة الهجري' : 'Hijri yearly calendar'}
          </h2>

          <button
            type="button"
            onClick={() => setShowYearCalendar((prev) => !prev)}
            className="rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
          >
            {showYearCalendar
              ? language === 'ar'
                ? 'إخفاء تقويم السنة'
                : 'Hide yearly calendar'
              : language === 'ar'
                ? 'عرض تقويم كل أيام السنة'
                : 'Show all days of year'}
          </button>
        </div>

        {showYearCalendar ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarYear((prev) => prev - 1)}
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
              >
                {language === 'ar' ? 'السنة السابقة' : 'Previous year'}
              </button>
              <span className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]">
                {calendarYear}
              </span>
              <button
                type="button"
                onClick={() => setCalendarYear((prev) => prev + 1)}
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
              >
                {language === 'ar' ? 'السنة التالية' : 'Next year'}
              </button>
            </div>

            {!coords ? (
              <p className="text-sm text-[var(--muted)]">
                {language === 'ar'
                  ? 'فعّل الموقع أولاً لتحميل تقويم السنة.'
                  : 'Enable location first to load yearly calendar.'}
              </p>
            ) : null}

            {yearlyCalendarQuery.isLoading ? (
              <p className="text-sm text-[var(--muted)]">
                {language === 'ar' ? 'جاري تحميل تقويم السنة...' : 'Loading yearly calendar...'}
              </p>
            ) : null}

            {yearlyCalendarQuery.isError ? (
              <p className="text-sm text-[var(--warn)]">
                {language === 'ar' ? 'تعذر تحميل تقويم السنة.' : 'Failed to load yearly calendar.'}
              </p>
            ) : null}

            {yearlyCalendarQuery.data?.length ? (
              <div className="max-h-[460px] overflow-y-auto pr-1">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {yearlyHijriMonths.map((month) => {
                      const cells = buildMonthCalendarCells(month.days)

                      return (
                        <div key={month.key} className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-2">
                          <div className="mb-2 flex justify-center">
                            <span className="rounded-full bg-[var(--brand-500)] px-4 py-1 text-xs font-bold text-white">
                              {language === 'ar'
                                ? `${month.monthAr} ${month.year}`
                                : `${month.monthEn} ${month.year}`}
                            </span>
                          </div>

                          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-2">
                            <div className="mb-1 grid grid-cols-7 gap-1">
                              {weekDayLabels.map((label, index) => (
                                <div
                                  key={`${month.key}-weekday-${index}`}
                                  className="text-center text-xs font-bold text-[var(--text-strong)]"
                                >
                                  {label}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1" dir="ltr">
                              {cells.map((cell, index) => {
                                if (!cell) {
                                  return <div key={`${month.key}-empty-${index}`} className="h-6" />
                                }

                                const isToday = cell.dayData?.gregorianDate === todayGregorianKey

                                return (
                                  <div
                                    key={`${month.key}-day-${cell.dayNumber}`}
                                    className={[
                                      'flex h-6 items-center justify-center rounded-md text-xs font-medium',
                                      isToday
                                        ? 'bg-[var(--brand-500)] text-white'
                                        : 'text-[var(--text)] hover:bg-[var(--brand-100)]',
                                    ].join(' ')}
                                    title={
                                      cell.dayData
                                        ? language === 'ar'
                                          ? `هجري: ${cell.dayData.hijriDate} (${cell.dayData.hijriMonthAr} ${cell.dayData.hijriYear}) | ميلادي: ${cell.dayData.gregorianDate}`
                                          : `Hijri: ${cell.dayData.hijriDate} (${cell.dayData.hijriMonthEn} ${cell.dayData.hijriYear}) | Gregorian: ${cell.dayData.gregorianDate}`
                                        : undefined
                                    }
                                  >
                                    {cell.dayNumber}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'اتجاه القبلة' : 'Qibla direction'}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={enableCompass}
            className="w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold sm:w-auto"
          >
            {language === 'ar' ? 'تفعيل البوصلة' : 'Enable compass'}
          </button>
          <a
            href={getQiblaMapsUrl()}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-xl bg-[var(--brand-500)] px-3 py-2 text-center text-sm font-semibold text-white sm:w-auto"
          >
            {language === 'ar' ? 'فتح القبلة في الخرائط' : 'Open Qibla in Maps'}
          </a>
        </div>

        {qiblaBearing !== null ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {language === 'ar' ? 'زاوية القبلة:' : 'Qibla bearing:'} {qiblaBearing.toFixed(1)}°
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {language === 'ar'
              ? 'فعّل الموقع أولاً لحساب اتجاه القبلة.'
              : 'Enable location first to calculate Qibla bearing.'}
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-[var(--line)] bg-[var(--bg)]">
            <div className="absolute text-xs text-[var(--muted)]">N</div>
            <div
              className="text-3xl text-[var(--brand-600)] transition-transform"
              style={{ transform: `rotate(${qiblaArrowRotation ?? 0}deg)` }}
            >
              ▲
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
