'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          setName(data.user.name)
          setEmail(data.user.email)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Валідація пароля, якщо він змінюється
    if (showPasswordFields && newPassword) {
      if (newPassword.length < 6) {
        setMessage(`❌ ${t('profile.minPasswordLength')}`)
        setSaving(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setMessage(`❌ ${t('profile.passwordsNotMatch')}`)
        setSaving(false)
        return
      }

      if (!currentPassword) {
        setMessage(`❌ ${t('profile.currentPassword')}`)
        setSaving(false)
        return
      }
    }

    try {
      const updateData: any = {}
      
      if (name !== user.name) {
        updateData.name = name
      }
      
      if (email !== user.email) {
        updateData.email = email
      }
      
      if (showPasswordFields && newPassword) {
        updateData.currentPassword = currentPassword
        updateData.newPassword = newPassword
      }

      if (Object.keys(updateData).length === 0) {
        setMessage(`ℹ️ ${t('common.noChanges') || 'Немає змін для збереження'}`)
        setSaving(false)
        return
      }

      const data = await authApi.updateProfile(updateData)

      if (data.user) {
        setMessage(`✅ ${t('profile.profileUpdated')}`)
        setUser(data.user)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordFields(false)
        
        // Оновлюємо сторінку через 1.5 секунди
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage(`❌ ${data.error ? translateBackendError(data.error, t) : t('common.error')}`)
      }
    } catch (error: any) {
      setMessage(error.message ? translateBackendError(error.message, t) : `❌ ${t('news.connectionError')}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Завантаження профілю...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span>👤</span>
              <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                {t('profile.title')}
              </span>
            </h1>
            <p className="text-gray-600 text-lg">{t('profile.manageData')}</p>
          </div>

          {/* Форма профілю */}
          <div className="bg-white shadow-2xl rounded-2xl p-8 border-2 border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ім'я */}
              <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.name')} <span className="text-red-500">*</span>
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">👤</span>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full pl-12 pr-3 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
                    placeholder={t('auth.name')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">📧</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-3 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Роль (тільки для перегляду) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('profile.role')}
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {user.role === 'ADMIN' ? '👑' : '👤'}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {user.role === 'ADMIN' ? t('admin.administrator') : t('admin.employee')}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span className="ml-auto px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('profile.cannotChangeRole')}</p>
              </div>

              {/* Зміна пароля */}
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-800">
                    {t('profile.changePassword')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(!showPasswordFields)
                      if (showPasswordFields) {
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }
                    }}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    {showPasswordFields ? t('common.cancel') : t('profile.changePasswordButton')}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    {/* Поточний пароль */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.currentPassword')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xl">🔒</span>
                        </div>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required={showPasswordFields}
                          className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
                          placeholder={t('profile.currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-xl">{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Новий пароль */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.newPassword')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xl">🔐</span>
                        </div>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required={showPasswordFields}
                          className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
                          placeholder={t('profile.newPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-xl">{showNewPassword ? '👁️' : '👁️‍🗨️'}</span>
                        </button>
                      </div>
                      {newPassword && newPassword.length < 6 && (
                        <p className="text-xs text-amber-600 mt-1">{t('profile.minPasswordLength')}</p>
                      )}
                    </div>

                    {/* Підтвердження пароля */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.confirmNewPassword')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xl">🔐</span>
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required={showPasswordFields}
                          className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
                          placeholder={t('profile.confirmNewPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-xl">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{t('profile.passwordsNotMatch')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Повідомлення */}
              {message && (
                <div
                  className={`p-4 rounded-xl font-medium shadow-md animate-fade-in ${
                    message.includes('✅') || message.includes(t('profile.profileUpdated'))
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200'
                      : message.includes('ℹ️')
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-2 border-blue-200'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {message.includes('✅') ? '✅' : message.includes('ℹ️') ? 'ℹ️' : '⚠️'}
                    </span>
                    <span>{message.replace('✅ ', '').replace('❌ ', '').replace('ℹ️ ', '')}</span>
                  </div>
                </div>
              )}

              {/* Кнопка збереження */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>💾</span>
                    {t('profile.saveChanges')}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

