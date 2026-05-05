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
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('timeOff.type')}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'VACATION' | 'SICK_LEAVE')}
          className="input-field cursor-pointer font-medium text-slate-800"
        >
          <option value="VACATION">🏖️ {t('timeOff.vacation')}</option>
          <option value="SICK_LEAVE">🏥 {t('timeOff.sickLeave')}</option>
        </select>
      </div>

      {/* Дати */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t('timeOff.startDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={today}
            required
            className="input-field font-medium text-slate-800"
          />
          <p className="mt-1 text-xs text-slate-500">{t('timeOff.selectStartDate')}</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t('timeOff.endDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minEndDate}
            required
            disabled={!startDate}
            className="input-field font-medium text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            {!startDate 
              ? t('timeOff.selectEndDate')
              : t('timeOff.cannotBeBefore')}
          </p>
        </div>
      </div>

      {/* Причина */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('timeOff.reason')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={4}
          className="input-field resize-none font-medium text-slate-800"
          placeholder={t('timeOff.enterReason')}
        />
      </div>

      {/* Повідомлення */}
      {message && (
        <div
          className={`animate-fade-in rounded-xl border p-4 text-sm font-medium shadow-sm ${
            message.includes('✅') || message.includes(t('timeOff.requestCreated'))
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
              : 'border-rose-200 bg-rose-50/90 text-rose-900'
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
        className="btn-primary w-full py-4 text-lg"
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

