'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { newsApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { getDateLocale } from '@/lib/dateLocale'

interface News {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  publishedAt: string
  author: {
    name: string
    avatarUrl?: string | null
  }
}

interface NewsListProps {
  isAdmin?: boolean
}

export default function NewsList({ isAdmin = false }: NewsListProps) {
  const { t, language } = useLanguage()
  const dateLocale = getDateLocale(language)
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
      <div className="card-surface flex flex-col items-center justify-center gap-4 py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        <p className="font-medium text-slate-600">{t('news.loading')}</p>
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="card-surface py-16 text-center">
        <div className="mb-4 text-5xl opacity-90">📰</div>
        <p className="mb-2 text-xl font-semibold text-slate-700">{t('news.noNews')}</p>
        <p className="text-sm text-slate-500">{t('news.willAppear')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {news.map((item) => (
        <article
          key={item.id}
          className="card-surface overflow-hidden shadow-card transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-card-lg"
        >
          {/* Зображення, якщо є */}
          {item.imageUrl && (
            <div className="relative h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 md:h-80">
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
            <h2 className="font-display mb-4 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">{item.title}</h2>

            <div className="prose prose-lg mb-6 max-w-none">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700 md:text-lg">{item.content}</p>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200/90 pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                {item.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.author.avatarUrl}
                    alt={item.author.name}
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-lg font-bold text-white shadow-md">
                    {item.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.author.name}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(item.publishedAt), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 ring-1 ring-primary-100">
                  <span className="text-xs font-semibold text-primary-700">📝 {t('news.admin')}</span>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
