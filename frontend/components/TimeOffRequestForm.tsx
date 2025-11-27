'use client'

import { useState, useMemo } from 'react'
import { timeOffApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'

export default function TimeOffRequestForm() {
  const { t } = useLanguage()
  const [type, setType] = useState<'VACATION' | 'SICK_LEAVE'>('VACATION')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Отримуємо сьогоднішню дату в форматі YYYY-MM-DD
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date.toISOString().split('T')[0]
  }, [])

  // Обчислюємо мінімальну дату для поля закінчення (не раніше дати початку)
  const minEndDate = useMemo(() => {
    if (startDate && startDate >= today) {
      return startDate
    }
    return today
  }, [startDate, today])

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)
    
    // Якщо дата закінчення раніше нової дати початку, скидаємо її
    if (endDate && newStartDate && endDate < newStartDate) {
      setEndDate('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Додаткова валідація на фронтенді
    if (startDate < today) {
      setMessage(`❌ ${t('timeOff.startDatePast')}`)
      setLoading(false)
      return
    }

    if (endDate < today) {
      setMessage(`❌ ${t('timeOff.endDatePast')}`)
      setLoading(false)
      return
    }

    if (endDate < startDate) {
      setMessage(`❌ ${t('timeOff.endBeforeStart')}`)
      setLoading(false)
      return
    }

    try {
      const data = await timeOffApi.createRequest({ type, startDate, endDate, reason })

      if (data.request) {
        setMessage(`✅ ${t('timeOff.requestCreated')}`)
        setStartDate('')
        setEndDate('')
        setReason('')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(data.error ? translateBackendError(data.error, t) : t('timeOff.requestError'))
      }
    } catch (error) {
      setMessage(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Тип запиту */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('timeOff.type')}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'VACATION' | 'SICK_LEAVE')}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
        >
          <option value="VACATION">🏖️ {t('timeOff.vacation')}</option>
          <option value="SICK_LEAVE">🏥 {t('timeOff.sickLeave')}</option>
        </select>
      </div>

      {/* Дати */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {t('timeOff.startDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={today}
            required
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          />
          <p className="text-xs text-gray-500 mt-1">{t('timeOff.selectStartDate')}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {t('timeOff.endDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minEndDate}
            required
            disabled={!startDate}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {!startDate 
              ? t('timeOff.selectEndDate')
              : t('timeOff.cannotBeBefore')}
          </p>
        </div>
      </div>

      {/* Причина */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('timeOff.reason')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 resize-none"
          placeholder={t('timeOff.enterReason')}
        />
      </div>

      {/* Повідомлення */}
      {message && (
        <div
          className={`p-4 rounded-xl font-medium shadow-md animate-fade-in ${
            message.includes('✅') || message.includes(t('timeOff.requestCreated'))
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes('✅') || message.includes(t('timeOff.requestCreated')) ? (
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
            {t('common.loading')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>📤</span>
            {t('timeOff.createRequest')}
          </span>
        )}
      </button>
    </form>
  )
}

