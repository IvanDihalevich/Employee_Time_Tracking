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
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('news.newsTitle')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          placeholder={t('news.newsTitle')}
        />
      </div>

      {/* Контент */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('news.content')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 resize-none"
          placeholder={t('news.content')}
        />
      </div>

      {/* Завантаження зображення */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {t('news.image')} <span className="text-gray-400 text-xs">({t('news.optional')})</span>
        </label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50">
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
              <p className="text-gray-600 font-medium">{t('news.uploadImage')}</p>
              <p className="text-xs text-gray-400">{t('news.maxSize')}</p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
              <img
                src={imagePreview}
                alt={t('news.image')}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                title={t('common.delete')}
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {t('news.imageReady')}
            </p>
          </div>
        )}
      </div>

      {/* Повідомлення */}
      {message && (
        <div
          className={`p-4 rounded-xl font-medium shadow-md animate-fade-in ${
            message.includes('✅') || message.includes(t('common.success'))
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200'
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
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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
