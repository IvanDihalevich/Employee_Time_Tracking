'use client'

import { useState, useRef } from 'react'
import { newsApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'

export default function CreateNewsForm() {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Перевірка розміру файлу (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`❌ ${t('news.imageTooLarge')}`)
        return
      }

      // Перевірка типу файлу
      if (!file.type.startsWith('image/')) {
        setMessage(`❌ ${t('news.selectImage')}`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImageUrl(result)
        setImagePreview(result)
        setMessage('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const data = await newsApi.createNews(title, content, imageUrl || undefined)

      if (data.news) {
        setMessage(`✅ ${t('news.newsCreated')}`)
        setTitle('')
        setContent('')
        setImageUrl('')
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const errorMsg = data.error || data.details || `❌ ${t('news.newsError')}`
        setMessage(errorMsg ? translateBackendError(errorMsg, t) : `❌ ${t('news.newsError')}`)
      }
    } catch (error: any) {
      console.error('Error creating news:', error)
      const errorMsg = error.message || `❌ ${t('news.connectionError')}`
      setMessage(errorMsg ? translateBackendError(errorMsg, t) : `❌ ${t('news.connectionError')}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Заголовок */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('news.newsTitle')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-field font-medium text-slate-800"
          placeholder={t('news.newsTitle')}
        />
      </div>

      {/* Контент */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('news.content')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="input-field resize-none font-medium text-slate-800"
          placeholder={t('news.content')}
        />
      </div>

      {/* Завантаження зображення */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {t('news.image')} <span className="text-xs text-slate-400">({t('news.optional')})</span>
        </label>

        {!imagePreview ? (
          <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/30">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">📷</span>
              </div>
              <p className="font-medium text-slate-600">{t('news.uploadImage')}</p>
              <p className="text-xs text-slate-400">{t('news.maxSize')}</p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200">
              <img
                src={imagePreview}
                alt={t('news.image')}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 rounded-full bg-rose-600 p-2 text-white shadow-md transition-colors hover:bg-rose-700"
                title={t('common.delete')}
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              {t('news.imageReady')}
            </p>
          </div>
        )}
      </div>

      {/* Повідомлення */}
      {message && (
        <div
          className={`animate-fade-in rounded-xl border p-4 text-sm font-medium shadow-sm ${
            message.includes('✅') || message.includes(t('common.success'))
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
              : 'border-rose-200 bg-rose-50/90 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{message.includes('✅') ? '✅' : '⚠️'}</span>
            <span>{message.replace('✅ ', '').replace('❌ ', '')}</span>
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
            <span>📝</span>
            {t('news.publish')}
          </span>
        )}
      </button>
    </form>
  )
}
