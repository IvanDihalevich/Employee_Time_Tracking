'use client'

import { useState } from 'react'
import { timeOffApi } from '@/lib/api'

export default function TimeOffRequestForm() {
  const [type, setType] = useState<'VACATION' | 'SICK_LEAVE'>('VACATION')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const data = await timeOffApi.createRequest({ type, startDate, endDate, reason })

      if (data.request) {
        setMessage('Запит успішно створено!')
        setStartDate('')
        setEndDate('')
        setReason('')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(data.error || 'Помилка створення запиту')
      }
    } catch (error) {
      setMessage('Помилка з\'єднання з сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Тип запиту */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Тип запиту
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'VACATION' | 'SICK_LEAVE')}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
        >
          <option value="VACATION">🏖️ Відпустка</option>
          <option value="SICK_LEAVE">🏥 Лікарняний</option>
        </select>
      </div>

      {/* Дати */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Дата початку
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Дата закінчення
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          />
        </div>
      </div>

      {/* Причина */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Причина
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 resize-none"
          placeholder="Детально опишіть причину вашого запиту..."
        />
      </div>

      {/* Повідомлення */}
      {message && (
        <div
          className={`p-4 rounded-xl font-medium shadow-md animate-fade-in ${
            message.includes('успішно')
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes('успішно') ? (
              <span className="text-xl">✅</span>
            ) : (
              <span className="text-xl">⚠️</span>
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Кнопка відправки */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Відправка...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>📤</span>
            Подати запит
          </span>
        )}
      </button>
    </form>
  )
}

