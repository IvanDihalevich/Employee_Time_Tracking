'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale/uk'
import { newsApi } from '@/lib/api'

interface News {
  id: string
  title: string
  content: string
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
    return <div className="text-center py-4">Завантаження...</div>
  }

  if (news.length === 0) {
    return <div className="text-center py-4 text-gray-500">Немає новин</div>
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.content}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Автор: {item.author.name}</span>
            <span>
              {format(new Date(item.publishedAt), 'd MMMM yyyy, HH:mm', { locale: uk })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

