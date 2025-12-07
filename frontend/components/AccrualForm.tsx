'use client'

import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface AccrualFormProps {
  userId: string
  userName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AccrualForm({ userId, userName, onSuccess, onCancel }: AccrualFormProps) {
  const { t } = useLanguage()
  const [type, setType] = useState<'VACATION' | 'SICK_LEAVE'>('VACATION')
  const [days, setDays] = useState('')
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!days || parseFloat(days) <= 0) {
      setMessage(`❌ ${t('admin.days') || 'Введіть кількість днів'} > 0`)
      setLoading(false)
      return
    }

    try {
      const data: any = {
        type,
        days: parseFloat(days),
        reason: reason || undefined,
      }

      if (startDate) {
        data.startDate = startDate
      }

      const result = await adminApi.accrueDays(userId, data)

      if (result.success) {
        setMessage(`✅ ${t('admin.accrueSuccess') || 'Вихідні успішно нараховані'}`)
        setTimeout(() => {
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        setMessage(`❌ ${result.error || t('common.error') || 'Помилка'}`)
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message || t('common.error') || 'Помилка сервера'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <p className="text-gray-700 font-medium">
          {t('admin.selectUser') || 'Користувач'}: <span className="font-bold text-primary-600">{userName}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('admin.selectType') || 'Тип вихідних'} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('VACATION')}
            className={`p-4 rounded-xl border-2 font-semibold transition-all ${
              type === 'VACATION'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            🏖️ {t('timeOff.vacation') || 'Відпустка'}
          </button>
          <button
            type="button"
            onClick={() => setType('SICK_LEAVE')}
            className={`p-4 rounded-xl border-2 font-semibold transition-all ${
              type === 'SICK_LEAVE'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300'
            }`}
          >
            🏥 {t('timeOff.sickLeave') || 'Лікарняні'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('admin.days') || 'Кількість днів'} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0.5"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
          placeholder="1.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('admin.reason') || 'Причина нарахування (опціонально)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
          placeholder={t('admin.reason') || 'Опишіть причину нарахування...'}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('admin.startDate') || 'Дата початку роботи (якщо встановлюється вперше)'}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('dashboard.startDateInfo') || 'Заповніть, якщо потрібно встановити або змінити дату початку роботи'}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl font-medium ${
            message.includes('✅')
              ? 'bg-green-50 text-green-800 border-2 border-green-200'
              : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? t('common.loading') || 'Завантаження...' : t('admin.accrueDays') || 'Нарахувати'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            {t('common.cancel') || 'Скасувати'}
          </button>
        )}
      </div>
    </form>
  )
}

