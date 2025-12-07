'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
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

    authApi.getMe()
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 text-lg">{t('dashboard.manageRequests')}</p>
          </div>

          {/* Вкладки */}
          <div className="mb-6">
            <div className="bg-white rounded-xl p-2 inline-flex shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === 'requests'
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 {t('dashboard.myRequests') || 'Мої запити'}
              </button>
              <button
                onClick={() => setActiveTab('daysOff')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === 'daysOff'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 {t('dashboard.daysOffStats') || 'Мої вихідні'}
              </button>
            </div>
          </div>

          {/* Контент вкладок */}
          {activeTab === 'requests' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    📝
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t('dashboard.submitRequest')}
                  </h2>
                </div>
                <TimeOffRequestForm />
              </div>
              <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    📋
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t('dashboard.myRequests')}
                  </h2>
                </div>
                <DaysOffCompact />
                <TimeOffRequestsList />
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  📊
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('dashboard.daysOffStats') || 'Мої вихідні'}
                </h2>
              </div>
              <DaysOffStats />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

