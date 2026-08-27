import { useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import {
  useDeviceReports,
  useDeviceReportSummary,
  useClearOldDeviceLogs,
  type DeviceReport,
} from '../hooks/useDeviceReports'

function formatDateTime(utcStr: string, language: 'ar' | 'en'): string {
  if (!utcStr) return '-'
  try {
    const d = new Date(utcStr)
    return d.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return utcStr
  }
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase()
  if (p.includes('android')) return '🤖'
  if (p.includes('ios') || p.includes('iphone') || p.includes('ipad')) return '🍏'
  if (p.includes('windows')) return '🪟'
  if (p.includes('mac')) return '🍎'
  if (p.includes('linux')) return '🐧'
  return '🌐'
}

export function AdminReportsPage() {
  const { language } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // Queries
  const {
    data: reports = [],
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useDeviceReports(searchQuery)

  const {
    data: summary,
    refetch: refetchSummary,
  } = useDeviceReportSummary()

  const clearLogsMutation = useClearOldDeviceLogs()

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item: DeviceReport) => {
      const matchPlatform =
        selectedPlatform === 'all' ||
        item.platform.toLowerCase() === selectedPlatform.toLowerCase()
      return matchPlatform
    })
  }, [reports, selectedPlatform])

  const handleRefreshAll = () => {
    void refetchReports()
    void refetchSummary()
    showToast(language === 'ar' ? 'تم تحديث تقارير الأجهزة بنجاح.' : 'Reports refreshed successfully.')
  }

  const handleExportCsv = () => {
    if (filteredReports.length === 0) return

    const headers = ['Device Identifier', 'Device / Browser Model', 'Platform', 'Total Visits', 'First Seen', 'Last Active']
    const rows = filteredReports.map((r) => [
      `"${r.deviceIdentifier}"`,
      `"${r.deviceName.replace(/"/g, '""')}"`,
      `"${r.platform}"`,
      r.totalVisits,
      `"${formatDateTime(r.firstSeenUtc, 'en')}"`,
      `"${formatDateTime(r.lastActiveUtc, 'en')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `azkar-device-reports-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearOldLogs = async () => {
    const confirm = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من رغبتك في تنظيف سجلات الأجهزة الأقدم من 90 يوماً؟'
        : 'Are you sure you want to clear device logs older than 90 days?'
    )
    if (!confirm) return

    try {
      const res = await clearLogsMutation.mutateAsync(90)
      showToast(
        language === 'ar'
          ? `تم حذف ${res?.deletedCount ?? 0} سجلاً قديماً بنجاح.`
          : `Cleaned up ${res?.deletedCount ?? 0} old logs.`
      )
    } catch (err: any) {
      showToast(err?.message || 'Failed to clear old logs')
    }
  }

  const platformsList = useMemo(() => {
    if (!summary?.devicesByPlatform) return []
    return Object.entries(summary.devicesByPlatform)
  }, [summary])

  return (
    <section className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {notification ? (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[var(--panel)] px-4 py-3 text-emerald-600 shadow-2xl transition-all animate-bounce dark:text-emerald-400">
          <span className="text-lg">✅</span>
          <span className="text-xs font-bold sm:text-sm">{notification}</span>
        </div>
      ) : null}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-[var(--panel)] p-5 shadow-lg md:p-7">
        <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-2xl text-indigo-600 shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Portal'}
                </span>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {language === 'ar' ? 'متصل بالخادم' : 'Live Backend Sync'}
                </span>
              </div>
              <h1 className="mt-1 font-title text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
                {language === 'ar' ? 'تقارير الأجهزة ومستخدمي التطبيق' : 'Devices & Visitor Reports'}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {language === 'ar'
                  ? 'سجل وإحصائيات جميع الأجهزة الفريدة التي فتحت التطبيق وتوزيع الأنظمة والزيارات'
                  : 'Analytics and logs of all devices entering the app, platforms breakdown & visits'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-indigo-500"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <span>📥</span>
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={handleClearOldLogs}
              disabled={clearLogsMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <span>🧹</span>
              <span>{language === 'ar' ? 'تنظيف السجلات' : 'Clean Old Logs'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي الأجهزة الفريدة' : 'Unique Devices'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-indigo-600 sm:text-2xl">
              {summary?.totalUniqueDevices ?? reports.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'إجمالي مرات الفتح' : 'Total App Opens'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-emerald-600 sm:text-2xl">
              {summary?.totalAppOpens ?? '-'}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'أجهزة نشطة اليوم' : 'Active Today'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-amber-600 sm:text-2xl">
              {summary?.activeToday ?? '-'}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 text-center">
            <p className="text-xs font-medium text-[var(--muted)]">
              {language === 'ar' ? 'أجهزة هذا الأسبوع' : 'Active This Week'}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-sky-600 sm:text-2xl">
              {summary?.activeThisWeek ?? '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Filter Pills */}
      {platformsList.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)]">
            {language === 'ar' ? 'توزيع الأنظمة:' : 'Platforms:'}
          </span>

          <button
            type="button"
            onClick={() => setSelectedPlatform('all')}
            className={[
              'rounded-xl border px-3 py-1.5 text-xs font-bold transition',
              selectedPlatform === 'all'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-indigo-500',
            ].join(' ')}
          >
            {language === 'ar' ? 'الكل' : 'All'} ({reports.length})
          </button>

          {platformsList.map(([platform, count]) => (
            <button
              key={platform}
              type="button"
              onClick={() => setSelectedPlatform(platform)}
              className={[
                'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition',
                selectedPlatform === platform
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-indigo-500',
              ].join(' ')}
            >
              <span>{getPlatformIcon(platform)}</span>
              <span>{platform}</span>
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                {count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث بمعرف الجهاز، نوع المتصفح، أو نظام التشغيل...'
              : 'Search by device ID, browser model, or OS...'
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

      {/* Devices List / Table */}
      {isReportsLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--muted)]">
            {language === 'ar' ? 'جاري جلب تقارير الأجهزة من الخادم...' : 'Fetching device reports...'}
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-600">
            📱
          </div>
          <p className="font-title text-base font-bold text-[var(--text-strong)]">
            {language === 'ar' ? 'لا توجد أجهزة مسجلة بعد' : 'No device records found'}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {language === 'ar'
              ? 'يتم تسجيل وتحديث نشاط الأجهزة تلقائياً عند فتح المستخدمين للتطبيق.'
              : 'Device activity is automatically recorded and updated when users open the application.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--bg)] text-[11px] font-bold text-[var(--muted)] uppercase">
                <tr>
                  <th className="px-4 py-3.5 text-start">
                    {language === 'ar' ? 'الجهاز / المتصفح' : 'Device / Browser'}
                  </th>
                  <th className="px-4 py-3.5 text-start">
                    {language === 'ar' ? 'نظام التشغيل' : 'Platform'}
                  </th>
                  <th className="px-4 py-3.5 text-start">
                    {language === 'ar' ? 'معرف الجهاز (ID)' : 'Device Identifier'}
                  </th>
                  <th className="px-4 py-3.5 text-center">
                    {language === 'ar' ? 'عدد الزيارات' : 'Visits'}
                  </th>
                  <th className="px-4 py-3.5 text-start">
                    {language === 'ar' ? 'أول دخول' : 'First Seen'}
                  </th>
                  <th className="px-4 py-3.5 text-start">
                    {language === 'ar' ? 'آخر نشاط' : 'Last Active'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredReports.map((device) => (
                  <tr
                    key={device.deviceIdentifier}
                    className="transition hover:bg-[var(--line)]/15"
                  >
                    {/* Device / Browser Model */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getPlatformIcon(device.platform)}</span>
                        <span className="font-semibold text-[var(--text-strong)] line-clamp-1">
                          {device.deviceName || 'Web Browser'}
                        </span>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="px-4 py-3.5">
                      <span className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--text)]">
                        {device.platform}
                      </span>
                    </td>

                    {/* Device Identifier */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[var(--muted)]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          {device.deviceIdentifier}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(device.deviceIdentifier)}
                          className="rounded-md border border-[var(--line)] p-1 text-[10px] hover:border-indigo-500 hover:text-[var(--text)]"
                          title={language === 'ar' ? 'نسخ المعرف' : 'Copy ID'}
                        >
                          {copiedId === device.deviceIdentifier ? '✓' : '📋'}
                        </button>
                      </div>
                    </td>

                    {/* Visits */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {device.totalVisits}
                      </span>
                    </td>

                    {/* First Seen */}
                    <td className="px-4 py-3.5 text-[11px] text-[var(--muted)] whitespace-nowrap">
                      {formatDateTime(device.firstSeenUtc, language)}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3.5 text-[11px] font-semibold text-[var(--text-strong)] whitespace-nowrap">
                      {formatDateTime(device.lastActiveUtc, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
