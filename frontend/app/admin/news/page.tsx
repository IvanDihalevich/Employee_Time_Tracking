'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import NewsList from '@/components/NewsList'
import CreateNewsForm from '@/components/CreateNewsForm'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function AdminNewsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    authApi
      .getMe()
      .then((data) => {
        if (data.user) {
          if (data.user.role !== 'ADMIN') {
            router.push('/dashboard')
          } else {
            setUser(data.user)
          }
        } else {
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  if (loading || !user) {
    return <LoadingScreen />
  }

  return (
    <div className="app-shell min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <PageHeader title={t('admin.manageNews')} description={t('news.manageNews')} icon="📝" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="card-surface sticky top-20 p-6 shadow-card-lg lg:top-24">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-xl text-white shadow-md">
                  ✏️
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900">{t('admin.createNews')}</h2>
              </div>
              <CreateNewsForm />
            </div>
          </div>
          <div className="lg:col-span-2">
            <NewsList isAdmin={true} />
          </div>
        </div>
      </main>
    </div>
  )
}
