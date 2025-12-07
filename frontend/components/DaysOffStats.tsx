'use client'

import { useEffect, useState } from 'react'
import { timeOffApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { format } from 'date-fns'

interface Stats {
  vacation: {
    total: number
    used: number
    available: number
    autoAccrued: number
    manuallyAccrued: number
  }
  sickLeave: {
    total: number
    used: number
    available: number
    autoAccrued: number
    manuallyAccrued: number
  }
  startDate: string | null
}

export default function DaysOffStats() {
  const { t, language } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await timeOffApi.getStats()
        if (data.vacation) {
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-4 text-gray-500">
        {t('common.error') || 'Помилка завантаження'}
      </div>
    )
  }

  const vacationPercentage = stats.vacation.total > 0 
    ? (stats.vacation.used / stats.vacation.total) * 100 
    : 0
  
  const sickLeavePercentage = stats.sickLeave.total > 0
    ? (stats.sickLeave.used / stats.sickLeave.total) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Відпустка */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              🏖️
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {t('timeOff.vacation') || 'Відпустка'}
              </h3>
              <p className="text-sm text-gray-600">
                {stats.startDate 
                  ? `${t('dashboard.startDate') || 'Початок роботи'}: ${format(new Date(stats.startDate), 'dd.MM.yyyy')}`
                  : t('dashboard.noStartDate') || 'Дата початку не встановлена'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-700">
              {stats.vacation.available.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {t('dashboard.available') || 'доступно'}
            </div>
          </div>
        </div>

        {/* Прогрес бар */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">
              {t('dashboard.used') || 'Використано'}: {stats.vacation.used.toFixed(1)} / {stats.vacation.total.toFixed(1)}
            </span>
            <span className="text-gray-600">
              {vacationPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(vacationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Деталі нарахування */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-gray-600 mb-1">
              {t('dashboard.autoAccrued') || 'Автоматично'}
            </div>
            <div className="text-lg font-bold text-blue-700">
              {stats.vacation.autoAccrued.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-gray-600 mb-1">
              {t('dashboard.manuallyAccrued') || 'Додатково'}
            </div>
            <div className="text-lg font-bold text-blue-700">
              {stats.vacation.manuallyAccrued.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Лікарняні */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              🏥
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {t('timeOff.sickLeave') || 'Лікарняні'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('dashboard.sickLeaveInfo') || '10 днів на рік'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-red-700">
              {stats.sickLeave.available.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {t('dashboard.available') || 'доступно'}
            </div>
          </div>
        </div>

        {/* Прогрес бар */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">
              {t('dashboard.used') || 'Використано'}: {stats.sickLeave.used.toFixed(1)} / {stats.sickLeave.total.toFixed(1)}
            </span>
            <span className="text-gray-600">
              {sickLeavePercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-pink-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(sickLeavePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Деталі нарахування */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="text-gray-600 mb-1">
              {t('dashboard.autoAccrued') || 'Автоматично'}
            </div>
            <div className="text-lg font-bold text-red-700">
              {stats.sickLeave.autoAccrued.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="text-gray-600 mb-1">
              {t('dashboard.manuallyAccrued') || 'Додатково'}
            </div>
            <div className="text-lg font-bold text-red-700">
              {stats.sickLeave.manuallyAccrued.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

