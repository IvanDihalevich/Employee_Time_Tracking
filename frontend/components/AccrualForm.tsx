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
        <p className="font-medium text-slate-700">
          {t('admin.selectUser') || 'Користувач'}: <span className="font-bold text-primary-600">{userName}</span>
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
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
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('admin.days') || 'Кількість днів'} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.5"
          min="0.5"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          required
          className="input-field text-slate-900"
          placeholder="1.5"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('admin.reason') || 'Причина нарахування (опціонально)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="input-field resize-none text-slate-900"
          placeholder={t('admin.reason') || 'Опишіть причину нарахування...'}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('admin.startDate') || 'Дата початку роботи (якщо встановлюється вперше)'}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input-field text-slate-900"
        />
        <p className="mt-1 text-xs text-slate-500">
          {t('dashboard.startDateInfo') || 'Заповніть, якщо потрібно встановити або змінити дату початку роботи'}
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            message.includes('✅')
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
              : 'border-rose-200 bg-rose-50/90 text-rose-900'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-bold">
          {loading ? t('common.loading') || 'Завантаження...' : t('admin.accrueDays') || 'Нарахувати'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            {t('common.cancel') || 'Скасувати'}
          </button>
        )}
      </div>
    </form>
  )
}

