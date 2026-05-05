'use client'

import { useEffect, useState } from 'react'
import { timeOffApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface Stats {
  vacation: {
    available: number
  }
  sickLeave: {
    available: number
  }
}

export default function DaysOffCompact() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await timeOffApi.getStats()
        if (data.vacation) {
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  if (!stats) {
    return null
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
      <div className="flex-1 rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-indigo-50/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🏖️
            </span>
            <span className="text-sm font-semibold text-slate-700">{t('timeOff.vacation') || 'Відпустка'}</span>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-sky-800">{stats.vacation.available.toFixed(1)}</div>
            <div className="text-xs text-slate-600">{t('dashboard.available') || 'доступно'}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-pink-50/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🏥
            </span>
            <span className="text-sm font-semibold text-slate-700">{t('timeOff.sickLeave') || 'Лікарняні'}</span>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-rose-800">{stats.sickLeave.available.toFixed(1)}</div>
            <div className="text-xs text-slate-600">{t('dashboard.available') || 'доступно'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

