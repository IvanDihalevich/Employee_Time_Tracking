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
    <div className="flex gap-4 mb-6">
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏖️</span>
            <span className="text-sm font-semibold text-gray-700">
              {t('timeOff.vacation') || 'Відпустка'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {stats.vacation.available.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">
              {t('dashboard.available') || 'доступно'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-sm font-semibold text-gray-700">
              {t('timeOff.sickLeave') || 'Лікарняні'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-700">
              {stats.sickLeave.available.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">
              {t('dashboard.available') || 'доступно'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

