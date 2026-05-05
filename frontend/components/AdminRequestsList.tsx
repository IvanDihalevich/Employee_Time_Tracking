'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { adminApi, timeOffApi } from '@/lib/api'
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
  requester: {
    name: string
    email: string
  }
}

export default function AdminRequestsList() {
  const { t, language } = useLanguage()
  const dateLocale = getDateLocale(language)
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await adminApi.getRequests()
      if (data.requests) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const data = await timeOffApi.updateRequestStatus(id, status)
      if (data.request) {
        // Оновлюємо список запитів
        await fetchRequests()
        // Оновлюємо сторінку для оновлення статистики
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  if (loading) {
    return (
      <div className="card-surface flex items-center justify-center gap-2 py-12 text-sm font-medium text-slate-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        {t('common.loading')}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="card-surface py-14 text-center text-slate-500">
        <p className="font-medium">{t('admin.noRequests')}</p>
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
    <div className="card-surface overflow-hidden p-4 sm:p-6">
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-5 shadow-sm transition-shadow hover:border-primary-200/80 hover:shadow-md"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl text-white ${
                    request.type === 'VACATION'
                      ? 'bg-gradient-to-br from-sky-400 to-blue-600'
                      : 'bg-gradient-to-br from-rose-400 to-red-600'
                  }`}
                >
                  {request.type === 'VACATION' ? '🏖️' : '🏥'}
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-800">
                    {request.type === 'VACATION' ? t('timeOff.vacation') : t('timeOff.sickLeave')}
                  </span>
                  <span className={`ml-2 inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-bold text-slate-800">{request.requester.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600 sm:justify-end">
                  <span aria-hidden>📧</span>
                  <span className="break-all">{request.requester.email}</span>
                </p>
              </div>
            </div>
            <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-sm font-semibold text-slate-700">
                📅 {format(new Date(request.startDate), 'd MMMM yyyy', { locale: dateLocale })} —{' '}
                {format(new Date(request.endDate), 'd MMMM yyyy', { locale: dateLocale })}
              </p>
            </div>
            <p className="mb-3 rounded-lg border border-slate-100 bg-white p-3 text-sm font-medium text-slate-700">{request.reason}</p>
            <p className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <span aria-hidden>⏰</span>
              {t('admin.created')}: {format(new Date(request.createdAt), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
            </p>
            {request.status === 'PENDING' && (
              <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange(request.id, 'APPROVED')}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg"
                >
                  ✅ {t('admin.approve')}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(request.id, 'REJECTED')}
                  className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-red-700 hover:shadow-lg"
                >
                  ❌ {t('admin.reject')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

