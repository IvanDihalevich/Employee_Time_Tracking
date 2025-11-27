'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import NewsList from '@/components/NewsList'

export default function NewsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
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
          setUser(data.user)
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
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Новини компанії
          </h1>
          <NewsList isAdmin={user.role === 'ADMIN'} />
        </div>
      </div>
    </div>
  )
}

