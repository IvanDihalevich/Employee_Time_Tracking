'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()

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

  return <LoadingScreen />
}

