import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

interface AyaItem {
  id: string
  surah: string
  surahEn: string
  ayahNumber: number
  textAr: string
  textEn: string
  audioUrl: string
  surahAudioUrl: string
  reciter: string
  tafsirAr: string
  tafsirEn: string
}

type RepeatMode = 1 | 3 | 5

async function fetchAyat(): Promise<AyaItem[]> {
  const response = await fetch('/data/ayat.json')

  if (!response.ok) {
    throw new Error('Failed to load Ayat data')
  }

  return (await response.json()) as AyaItem[]
}

export function AyatPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(1)
  const [activeAyaId, setActiveAyaId] = useState<string | null>(null)
  const [playlistIds, setPlaylistIds] = useState<string[]>([])
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const [repeatLeft, setRepeatLeft] = useState(1)
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const [showTafsir, setShowTafsir] = useState<Record<string, boolean>>({})
  const playerRef = useRef<HTMLAudioElement | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ayat-data'],
    queryFn: fetchAyat,
    staleTime: Infinity,
  })

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return data
    }

    return data.filter((aya) => {
      const haystack = `${aya.surah} ${aya.surahEn} ${aya.textAr} ${aya.textEn}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [data, search])

  const activeAya = useMemo(
    () => filtered.find((aya) => aya.id === activeAyaId) ?? null,
    [activeAyaId, filtered],
  )

  const surahAudioUrl = filtered[0]?.surahAudioUrl ?? ''

  const startAyaPlayback = (ayaId: string) => {
    setPlaylistIds([ayaId])
    setPlaylistIndex(0)
    setActiveAyaId(ayaId)
    setRepeatLeft(repeatMode)

    window.setTimeout(() => {
      void playerRef.current?.play().catch(() => {})
    }, 0)
  }

  const startPlaylist = () => {
    if (filtered.length === 0) {
      return
    }

    const ids = filtered.map((aya) => aya.id)
    setPlaylistIds(ids)
    setPlaylistIndex(0)
    setActiveAyaId(ids[0] ?? null)
    setRepeatLeft(repeatMode)

    window.setTimeout(() => {
      void playerRef.current?.play().catch(() => {})
    }, 0)
  }

  const stopPlayback = () => {
    playerRef.current?.pause()
    if (playerRef.current) {
      playerRef.current.currentTime = 0
    }
    setPlaylistIds([])
    setActiveAyaId(null)
    setPlaylistIndex(0)
    setRepeatLeft(1)
  }

  const handleAudioEnded = () => {
    if (repeatLeft > 1) {
      setRepeatLeft((prev) => prev - 1)
      if (playerRef.current) {
        playerRef.current.currentTime = 0
        void playerRef.current.play().catch(() => {})
      }
      return
    }

    if (playlistIds.length > 0 && playlistIndex < playlistIds.length - 1) {
      const nextIndex = playlistIndex + 1
      setPlaylistIndex(nextIndex)
      setActiveAyaId(playlistIds[nextIndex] ?? null)
      setRepeatLeft(repeatMode)

      window.setTimeout(() => {
        void playerRef.current?.play().catch(() => {})
      }, 0)
      return
    }

    setPlaylistIds([])
    setPlaylistIndex(0)
    setRepeatLeft(1)
  }

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {language === 'ar' ? 'جارٍ تحميل الآيات...' : 'Loading ayat...'}
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-[var(--warn)]">
        {language === 'ar' ? 'تعذر تحميل الآيات.' : 'Failed to load ayat data.'}
      </p>
    )
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.18),transparent_35%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
            {language === 'ar' ? 'صفحة القرآن' : 'Quran Page'}
          </p>
          <h1 className="mt-1 font-title text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl md:text-5xl">
            {language === 'ar' ? 'آيات مع تلاوة وتفسير' : 'Ayat with Recitation and Tafsir'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--muted)] md:text-base">
            {language === 'ar'
              ? 'تشغيل متتالي للسورة، تكرار للآية للحفظ، وإظهار الترجمة والتفسير لكل آية.'
              : 'Playlist recitation, repeat-ayah memorization mode, and per-ayah translation and tafsir.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[var(--muted)]">
              {language === 'ar' ? `إجمالي الآيات: ${filtered.length}` : `Total Ayat: ${filtered.length}`}
            </span>
            <Link
              to="/recitations"
              className="rounded-full bg-[var(--brand-500)] px-3 py-1 text-white"
            >
              {language === 'ar' ? 'منصة تلاوات المستخدمين' : 'User Recitations Platform'}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:grid-cols-[1fr_auto_auto_auto] md:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث باسم السورة أو كلمات من الآية...'
              : 'Search by surah name or words from the aya...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />

        <select
          value={String(repeatMode)}
          onChange={(event) => setRepeatMode(Number(event.target.value) as RepeatMode)}
          className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
        >
          <option value="1">{language === 'ar' ? 'تكرار 1' : 'Repeat x1'}</option>
          <option value="3">{language === 'ar' ? 'تكرار 3' : 'Repeat x3'}</option>
          <option value="5">{language === 'ar' ? 'تكرار 5' : 'Repeat x5'}</option>
        </select>

        <button
          type="button"
          onClick={startPlaylist}
          className="rounded-xl bg-[var(--brand-500)] px-3 py-2 text-sm font-semibold text-white"
        >
          {language === 'ar' ? 'تشغيل متتالي' : 'Start Playlist'}
        </button>

        <button
          type="button"
          onClick={stopPlayback}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold"
        >
          {language === 'ar' ? 'إيقاف' : 'Stop'}
        </button>
      </div>

      {activeAya ? (
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <p className="text-xs text-[var(--muted)]">
            {language === 'ar'
              ? `الآن: ${activeAya.surah} - آية ${activeAya.ayahNumber}${playlistIds.length > 1 ? ` (قائمة ${playlistIndex + 1}/${playlistIds.length})` : ''}`
              : `Now playing: ${activeAya.surahEn} - Ayah ${activeAya.ayahNumber}${playlistIds.length > 1 ? ` (Playlist ${playlistIndex + 1}/${playlistIds.length})` : ''}`}
          </p>
          <audio
            ref={playerRef}
            controls
            autoPlay
            preload="none"
            className="mt-2 w-full"
            src={activeAya.audioUrl}
            onEnded={handleAudioEnded}
          />
        </article>
      ) : null}

      {surahAudioUrl ? (
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
          <p className="mb-2 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'تشغيل السورة كاملة' : 'Play full surah audio'}
          </p>
          <audio controls preload="none" className="w-full" src={surahAudioUrl} />
        </article>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching ayat found.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((aya) => (
            <article
              key={aya.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:p-5"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                  {language === 'ar' ? aya.surah : aya.surahEn}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[var(--muted)]">
                  {language === 'ar' ? `آية ${aya.ayahNumber}` : `Ayah ${aya.ayahNumber}`}
                </span>
              </div>

              <p className="font-title text-2xl leading-loose text-[var(--text-strong)]" dir="rtl">
                {aya.textAr}
              </p>

              {showTranslation[aya.id] ? (
                <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--text)]" dir="ltr">
                  {aya.textEn}
                </p>
              ) : null}

              {showTafsir[aya.id] ? (
                <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar'
                    ? aya.tafsirAr || 'لا يوجد تفسير متاح لهذه الآية حالياً.'
                    : aya.tafsirEn || 'No tafsir is currently available for this ayah.'}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startAyaPlayback(aya.id)}
                  className="rounded-lg bg-[var(--brand-500)] px-3 py-2 text-xs font-semibold text-white"
                >
                  {language === 'ar' ? `تشغيل وتكرار x${repeatMode}` : `Play & Repeat x${repeatMode}`}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowTranslation((prev) => ({ ...prev, [aya.id]: !prev[aya.id] }))
                  }
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
                >
                  {showTranslation[aya.id]
                    ? language === 'ar'
                      ? 'إخفاء الترجمة'
                      : 'Hide Translation'
                    : language === 'ar'
                      ? 'إظهار الترجمة'
                      : 'Show Translation'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTafsir((prev) => ({ ...prev, [aya.id]: !prev[aya.id] }))}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"
                >
                  {showTafsir[aya.id]
                    ? language === 'ar'
                      ? 'إخفاء التفسير'
                      : 'Hide Tafsir'
                    : language === 'ar'
                      ? 'إظهار التفسير'
                      : 'Show Tafsir'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
