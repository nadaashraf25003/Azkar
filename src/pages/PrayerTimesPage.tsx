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
  }
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

export function PrayerTimesPage() {
  const { language } = useSettings()
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState('')
  const [heading, setHeading] = useState<number | null>(null)

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
    queryFn: async () => {
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
      return json.data.timings
    },
    enabled: Boolean(coords),
    staleTime: 60_000,
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

  const timings = prayerQuery.data

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
