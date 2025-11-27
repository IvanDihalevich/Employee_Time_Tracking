'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import uk from 'date-fns/locale/uk'
import { newsApi } from '@/lib/api'

interface News {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  publishedAt: string
  author: {
    name: string
  }
}

interface NewsListProps {
  isAdmin?: boolean
}

export default function NewsList({ isAdmin = false }: NewsListProps) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const data = await newsApi.getNews()
      if (data.news) {
        setNews(data.news)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Завантаження новин...</p>
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📰</div>
        <p className="text-gray-600 font-medium text-xl mb-2">Немає новин</p>
        <p className="text-gray-400 text-sm">Новини будуть відображатися тут</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {news.map((item) => (
        <article
          key={item.id}
          className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          {/* Зображення, якщо є */}
          {item.imageUrl && (
            <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Якщо зображення не завантажилось, приховуємо контейнер
                  e.currentTarget.parentElement!.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Заголовок */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {item.title}
            </h2>

            {/* Контент */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>

            {/* Футер з інформацією */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {item.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.publishedAt), 'd MMMM yyyy, HH:mm', { locale: uk })}
                  </p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full">
                  <span className="text-primary-600 text-xs font-semibold">📝 Адміністратор</span>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
