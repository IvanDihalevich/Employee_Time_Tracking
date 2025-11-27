'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

interface NavbarProps {
  user: {
    name: string
    role: string
  }
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    authApi.logout()
    router.push('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-xl border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  ⏰
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  TimeTracker
                </h1>
              </div>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {user.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    👑 Панель адміна
                  </Link>
                  <Link
                    href="/admin/requests"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    📋 Запити
                  </Link>
                  <Link
                    href="/admin/news"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    📰 Новини
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    🏠 Головна
                  </Link>
                  <Link
                    href="/news"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    📰 Новини
                  </Link>
                  <Link
                    href="/calendar"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
                  >
                    📅 Календар
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-gray-50"
            >
              <span className="text-lg">👤</span>
              <span className="text-gray-800 font-semibold hover:text-primary-600 transition-colors">{user.name}</span>
              {user.role === 'ADMIN' && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                  ADMIN
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Вийти
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

