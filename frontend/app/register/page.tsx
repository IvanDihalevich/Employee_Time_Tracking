'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import AuthSplitShell from '@/components/AuthSplitShell'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('profile.passwordsNotMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('profile.minPasswordLength'))
      return
    }

    setLoading(true)

    try {
      const data = await authApi.register(name, email, password)

      if (data.user) {
        router.push('/dashboard')
      } else {
        setError(data.error ? translateBackendError(data.error, t) : t('common.error'))
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err?.message ? translateBackendError(err.message, t) : t('news.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitShell emoji="✨" title={t('auth.createAccount')} subtitle={t('auth.joinSystem')}>
      <div className="card-surface border-slate-200/90 p-6 shadow-card-lg sm:p-8">
        <h2 className="font-display mb-6 text-center text-xl font-bold text-slate-900 sm:text-2xl">{t('auth.register')}</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-800 animate-fade-in"
              role="alert"
            >
              <span className="text-lg" aria-hidden>
                ⚠️
              </span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              {t('auth.name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400" aria-hidden>
                👤
              </span>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field pl-11"
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400" aria-hidden>
                📧
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-11"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              {t('auth.password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400" aria-hidden>
                🔒
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input-field pl-11 pr-11"
                placeholder={t('profile.minPasswordLength')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="mt-1 text-xs text-amber-700">{t('profile.minPasswordLength')}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400" aria-hidden>
                🔐
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input-field pl-11 pr-11"
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <span className="text-xl">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{t('profile.passwordsNotMatch')}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full py-3.5 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t('common.loading')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span aria-hidden>✨</span>
                {t('auth.registerButton')}
              </span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            {t('auth.loginButton')}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">{t('auth.agreeTerms')}</p>
    </AuthSplitShell>
  )
}
