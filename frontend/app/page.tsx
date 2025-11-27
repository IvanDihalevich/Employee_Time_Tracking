'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getMe()
        .then((data) => {
          if (data.user) {
            if (data.user.role === 'ADMIN') {
              router.push('/admin/dashboard')
            } else {
              router.push('/dashboard')
            }
          } else {
            router.push('/login')
          }
        })
        .catch(() => {
          router.push('/login')
        })
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  )
}

