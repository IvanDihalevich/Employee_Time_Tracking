'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import TimeOffRequestForm from '@/components/TimeOffRequestForm'
import TimeOffRequestsList from '@/components/TimeOffRequestsList'
import DaysOffStats from '@/components/DaysOffStats'
import DaysOffCompact from '@/components/DaysOffCompact'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'daysOff'>('requests')

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
          if (data.user.role === 'ADMIN') {
            router.push('/admin/dashboard')
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
        <PageHeader title={t('dashboard.title')} description={t('dashboard.manageRequests')} icon="📊" />

        <div className="mb-8 inline-flex rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all sm:px-6 sm:text-base ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-600/25'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📋 {t('dashboard.myRequests') || 'Мої запити'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daysOff')}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all sm:px-6 sm:text-base ${
              activeTab === 'daysOff'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/25'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📊 {t('dashboard.daysOffStats') || 'Мої вихідні'}
          </button>
        </div>

        {activeTab === 'requests' ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="card-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-xl text-white shadow-md">
                  📝
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">{t('dashboard.submitRequest')}</h2>
              </div>
              <TimeOffRequestForm />
            </section>
            <section className="card-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl text-white shadow-md">
                  📋
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">{t('dashboard.myRequests')}</h2>
              </div>
              <DaysOffCompact />
              <TimeOffRequestsList />
            </section>
          </div>
        ) : (
          <section className="card-surface p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl text-white shadow-md">
                📊
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                {t('dashboard.daysOffStats') || 'Мої вихідні'}
              </h2>
            </div>
            <DaysOffStats />
          </section>
        )}
      </main>
    </div>
  )
}
