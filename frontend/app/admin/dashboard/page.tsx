'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, adminApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
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

    authApi.getMe()
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
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600 text-lg">{t('admin.manageRequests')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-yellow-50 overflow-hidden shadow-xl rounded-xl border-2 border-yellow-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-gray-600 truncate">
                        {t('admin.pendingRequests')}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.pendingRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 overflow-hidden shadow-xl rounded-xl border-2 border-green-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-gray-600 truncate">
                        {t('admin.approvedCount')}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.approvedRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/admin/users')}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-primary-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-xl font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-gray-600 truncate">
                        {t('admin.users')}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                  <div className="ml-2">
                    <span className="text-primary-600 text-lg">→</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

