'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { timeOffApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { getDateLocale } from '@/lib/dateLocale'

interface TimeOffRequest {
  id: string
  type: 'VACATION' | 'SICK_LEAVE'
  startDate: string
  endDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
  createdAt: string
}

export default function TimeOffRequestsList() {
  const { t, language } = useLanguage()
  const dateLocale = getDateLocale(language)
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await timeOffApi.getRequests()
      if (data.requests) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-gray-500">{t('dashboard.noRequests')}</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return t('timeOff.approved')
      case 'REJECTED':
        return t('timeOff.rejected')
      default:
        return t('timeOff.pending')
    }
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 transition-all transform hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                request.type === 'VACATION' 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                  : 'bg-gradient-to-br from-red-400 to-red-500'
              }`}>
                {request.type === 'VACATION' ? '🏖️' : '🏥'}
              </div>
              <div>
                <span className="font-bold text-gray-800 text-lg">
                  {request.type === 'VACATION' ? t('timeOff.vacation') : t('timeOff.sickLeave')}
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusText(request.status)}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm font-semibold text-gray-700">
              📅 {format(new Date(request.startDate), 'd MMMM yyyy', { locale: dateLocale })} -{' '}
              {format(new Date(request.endDate), 'd MMMM yyyy', { locale: dateLocale })}
            </p>
          </div>
          <p className="text-sm text-gray-700 font-medium mb-3 bg-white rounded-lg p-3 border border-gray-100">
            {request.reason}
          </p>
          <p className="text-xs text-gray-500 font-medium">
            ⏰ {t('admin.created')}: {format(new Date(request.createdAt), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
          </p>
        </div>
      ))}
    </div>
  )
}

