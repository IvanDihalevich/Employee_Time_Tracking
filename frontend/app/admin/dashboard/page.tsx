'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, adminApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats()
      if (data.pendingRequests !== undefined) {
        setStats({
          pendingRequests: data.pendingRequests,
          approvedRequests: data.approvedRequests,
          totalUsers: data.totalUsers,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

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
            fetchStats()
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
        <PageHeader title={t('admin.dashboard')} description={t('admin.manageRequests')} icon="👑" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="card-surface overflow-hidden border-amber-200/60 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl text-white shadow-md">
                ⏳
              </div>
              <dl className="min-w-0">
                <dt className="truncate text-sm font-semibold text-slate-600">{t('admin.pendingRequests')}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight text-slate-900">{stats.pendingRequests}</dd>
              </dl>
            </div>
          </div>

          <div className="card-surface overflow-hidden border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl text-white shadow-md">
                ✅
              </div>
              <dl className="min-w-0">
                <dt className="truncate text-sm font-semibold text-slate-600">{t('admin.approvedCount')}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight text-slate-900">{stats.approvedRequests}</dd>
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="card-surface group flex w-full cursor-pointer border-primary-200/50 bg-white p-6 text-left transition-all hover:border-primary-300 hover:shadow-card-lg"
          >
            <div className="flex w-full items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-xl text-white shadow-md shadow-primary-600/25 transition-transform group-hover:scale-105">
                👥
              </div>
              <dl className="min-w-0 flex-1">
                <dt className="truncate text-sm font-semibold text-slate-600">{t('admin.users')}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight text-slate-900">{stats.totalUsers}</dd>
              </dl>
              <span className="text-primary-500 transition-transform group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
