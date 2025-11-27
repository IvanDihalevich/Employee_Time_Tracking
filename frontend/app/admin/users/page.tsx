'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale/uk'
import { authApi, adminApi } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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
            fetchUsers()
          }
        } else {
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
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
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="mb-4 text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              ← Назад до панелі
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Список працівників
            </h1>
            <p className="text-gray-600 text-lg">Всього працівників: {users.length}</p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border-2 border-gray-100">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-600 font-medium text-lg">Немає працівників</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.role === 'ADMIN' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-md">
                          👑 ADMIN
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{u.name}</h3>
                    <p className="text-gray-600 mb-1 flex items-center gap-2">
                      <span>📧</span>
                      {u.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                      <span>📅</span>
                      Зареєстровано: {format(new Date(u.createdAt), 'd MMMM yyyy', { locale: uk })}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'ADMIN' ? '👑 Адміністратор' : '👤 Працівник'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

