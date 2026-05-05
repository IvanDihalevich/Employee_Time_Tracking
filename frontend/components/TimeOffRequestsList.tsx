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
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        {t('common.loading')}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm font-medium text-slate-500">
        {t('dashboard.noRequests')}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 ring-1 ring-rose-200/80'
      default:
        return 'bg-amber-100 text-amber-900 ring-1 ring-amber-200/80'
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
    <div className="scrollbar-app max-h-[600px] space-y-3 overflow-y-auto overflow-x-hidden pr-1">
      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-sm transition-shadow hover:border-primary-200/80 hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                  request.type === 'VACATION'
                    ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
                    : 'bg-gradient-to-br from-rose-400 to-red-600 text-white'
                }`}
              >
                {request.type === 'VACATION' ? '🏖️' : '🏥'}
              </div>
              <span className="truncate text-base font-bold text-slate-800">
                {request.type === 'VACATION' ? t('timeOff.vacation') : t('timeOff.sickLeave')}
              </span>
            </div>
            <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(request.status)}`}>
              {getStatusText(request.status)}
            </span>
          </div>
          <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2">
            <p className="text-sm font-semibold text-slate-700">
              📅 {format(new Date(request.startDate), 'd MMMM yyyy', { locale: dateLocale })} —{' '}
              {format(new Date(request.endDate), 'd MMMM yyyy', { locale: dateLocale })}
            </p>
          </div>
          <p className="mb-3 rounded-lg border border-slate-100 bg-white p-3 text-sm font-medium text-slate-700">{request.reason}</p>
          <p className="text-xs font-medium text-slate-500">
            ⏰ {t('admin.created')}: {format(new Date(request.createdAt), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
          </p>
        </div>
      ))}
    </div>
  )
}

