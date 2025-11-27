'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale/uk'
import { adminApi, timeOffApi } from '@/lib/api'

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
    return <div className="text-center py-4">Завантаження...</div>
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-gray-500">Немає запитів</div>
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
        return 'Схвалено'
      case 'REJECTED':
        return 'Відхилено'
      default:
        return 'Очікує'
    }
  }

  return (
    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-100">
      <div className="space-y-4 p-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  request.type === 'VACATION' 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                    : 'bg-gradient-to-br from-red-400 to-red-500'
                }`}>
                  {request.type === 'VACATION' ? '🏖️' : '🏥'}
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">
                    {request.type === 'VACATION' ? 'Відпустка' : 'Лікарняний'}
                  </span>
                  <span
                    className={`ml-3 px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{request.requester.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                  <span>📧</span>
                  {request.requester.email}
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-gray-700">
                📅 {format(new Date(request.startDate), 'd MMMM yyyy', { locale: uk })} -{' '}
                {format(new Date(request.endDate), 'd MMMM yyyy', { locale: uk })}
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-3 bg-white rounded-lg p-3 border border-gray-200 font-medium">
              {request.reason}
            </p>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
              <span>⏰</span>
              Створено: {format(new Date(request.createdAt), 'd MMMM yyyy, HH:mm', { locale: uk })}
            </p>
            {request.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusChange(request.id, 'APPROVED')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ✅ Схвалити
                </button>
                <button
                  onClick={() => handleStatusChange(request.id, 'REJECTED')}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ❌ Відхилити
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

