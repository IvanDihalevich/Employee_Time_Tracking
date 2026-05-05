'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'
import AvatarCropModal from '@/components/AvatarCropModal'

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null)
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
          setAvatarUrl(data.user.avatarUrl ?? null)
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

      if (avatarUrl !== (user.avatarUrl ?? null)) {
        updateData.avatarUrl = avatarUrl
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
        setAvatarUrl(data.user.avatarUrl ?? null)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordFields(false)
        
        // Оновлюємо сторінку через 1.5 секунди (щоб оновився Navbar)
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
    return <LoadingScreen />
  }

  return (
    <div className="app-shell min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <PageHeader title={t('profile.title')} description={t('profile.manageData')} icon="👤" />

        <div className="card-surface p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Аватарка */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">{t('profile.avatar')}</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">👤</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={avatarBusy || saving}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setAvatarBusy(true)
                          try {
                            const dataUrl: string = await new Promise((resolve, reject) => {
                              const reader = new FileReader()
                              reader.onload = () => resolve(String(reader.result))
                              reader.onerror = () => reject(new Error('read-error'))
                              reader.readAsDataURL(file)
                            })
                            setAvatarCropSrc(dataUrl)
                          } catch {
                            setMessage(`❌ ${t('profile.avatarError')}`)
                          } finally {
                            setAvatarBusy(false)
                            e.target.value = ''
                          }
                        }}
                      />
                      {avatarBusy ? t('common.loading') : t('profile.chooseAvatar')}
                    </label>

                    {avatarUrl && (
                      <button
                        type="button"
                        disabled={avatarBusy || saving}
                        onClick={() => setAvatarUrl(null)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                      >
                        {t('profile.removeAvatar')}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{t('profile.avatarHint')}</p>
              </div>

              {avatarCropSrc && (
                <AvatarCropModal
                  src={avatarCropSrc}
                  onCancel={() => setAvatarCropSrc(null)}
                  onSave={(dataUrl) => {
                    setAvatarUrl(dataUrl)
                    setAvatarCropSrc(null)
                  }}
                />
              )}

              {/* Ім'я */}
              <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
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
                    className="input-field pl-12"
                    placeholder={t('auth.name')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
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
                    className="input-field pl-12"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Роль (тільки для перегляду) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  {t('profile.role')}
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
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
                <p className="mt-1 text-xs text-slate-500">{t('profile.cannotChangeRole')}</p>
              </div>

              {/* Зміна пароля */}
              <div className="border-t border-slate-200 pt-6">
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
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                    {/* Поточний пароль */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="input-field pl-12 pr-12"
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
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="input-field pl-12 pr-12"
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
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="input-field pl-12 pr-12"
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
                className="btn-primary w-full py-4 text-lg disabled:scale-100"
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
      </main>
    </div>
  )
}

