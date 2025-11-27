'use client'

import { useState } from 'react'
import { newsApi } from '@/lib/api'

export default function CreateNewsForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const data = await newsApi.createNews(title, content)

      if (data.news) {
        setMessage('Новину успішно створено!')
        setTitle('')
        setContent('')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(data.error || 'Помилка створення новини')
      }
    } catch (error) {
      setMessage('Помилка з\'єднання з сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Заголовок
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Заголовок новини"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Контент
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Текст новини..."
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes('успішно')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {loading ? 'Створення...' : 'Опублікувати'}
      </button>
    </form>
  )
}

