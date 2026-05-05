'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { adminApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { translateBackendError } from '@/lib/errorTranslations'

export type ManagedUser = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  createdAt: string
  startDate?: string | null
  jobTitle?: string | null
  gradeLevel?: number | null
  managerId?: string | null
}

type AdminUserManageModalProps = {
  user: ManagedUser
  currentAdminId: string
  adminCount: number
  onClose: () => void
  /** Оновити список; якщо передано user — оновити дані у відкритій формі */
  onSaved: (updated?: ManagedUser) => void
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export default function AdminUserManageModal({
  user,
  currentAdminId,
  adminCount,
  onClose,
  onSaved,
}: AdminUserManageModalProps) {
  const { t } = useLanguage()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>(user.role)
  const [startDate, setStartDate] = useState(toDateInput(user.startDate))
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? '')
  const [gradeLevel, setGradeLevel] = useState<number>(user.gradeLevel ?? 0)
  const [managerId, setManagerId] = useState<string>(user.managerId ?? '')
  const [managerOptions, setManagerOptions] = useState<Array<{ id: string; name: string }>>([])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState(false)

  const isSelf = user.id === currentAdminId
  const onlyOneAdmin = adminCount <= 1
  const lockRoleToAdmin = user.role === 'ADMIN' && onlyOneAdmin

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setStartDate(toDateInput(user.startDate))
    setJobTitle(user.jobTitle ?? '')
    setGradeLevel(user.gradeLevel ?? 0)
    setManagerId(user.managerId ?? '')
    setNewPassword('')
    setConfirmPassword('')
    setMessage('')
    setDeleteArmed(false)
  }, [user])

  useEffect(() => {
    let mounted = true
    adminApi
      .getUsers()
      .then((data) => {
        if (!mounted) return
        const users = (data.users as Array<{ id: string; name: string }> | undefined) ?? []
        const options = users
          .filter((u) => u.id !== user.id)
          .map((u) => ({ id: u.id, name: u.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setManagerOptions(options)
      })
      .catch(() => {
        if (!mounted) return
        setManagerOptions([])
      })
    return () => {
      mounted = false
    }
  }, [user.id])

  const showMessage = (text: string, ok: boolean) => {
    setMessage(ok ? `✅ ${text}` : text)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload: {
        name?: string
        email?: string
        role?: 'ADMIN' | 'EMPLOYEE'
        startDate?: string | null
        jobTitle?: string | null
        gradeLevel?: number
        managerId?: string | null
      } = {}

      if (name.trim() !== user.name) payload.name = name.trim()
      if (email.trim() !== user.email) payload.email = email.trim()
      if (role !== user.role) payload.role = role

      const nextStart = startDate.trim()
      const prev = toDateInput(user.startDate)
      if (nextStart !== prev) {
        payload.startDate = nextStart === '' ? null : nextStart
      }

      const nextTitle = jobTitle.trim()
      const prevTitle = (user.jobTitle ?? '').trim()
      if (nextTitle !== prevTitle) {
        payload.jobTitle = nextTitle === '' ? null : nextTitle
      }

      const nextLevel = Number.isFinite(gradeLevel) ? gradeLevel : 0
      const prevLevel = user.gradeLevel ?? 0
      if (nextLevel !== prevLevel) {
        payload.gradeLevel = nextLevel
      }

      const nextManager = managerId.trim()
      const prevManager = (user.managerId ?? '').trim()
      if (nextManager !== prevManager) {
        payload.managerId = nextManager === '' ? null : nextManager
      }

      if (Object.keys(payload).length === 0) {
        showMessage(t('common.noChanges'), false)
        setSaving(false)
        return
      }

      const data = await adminApi.updateUser(user.id, payload)
      if (data.error) {
        showMessage(translateBackendError(data.error, t), false)
      } else {
        showMessage(t('admin.userUpdated'), true)
        if (data.user) {
          onSaved(data.user as ManagedUser)
        } else {
          onSaved()
        }
      }
    } catch {
      showMessage(t('news.connectionError'), false)
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    setMessage('')
    if (!newPassword || newPassword.length < 6) {
      showMessage(t('profile.minPasswordLength'), false)
      return
    }
    if (newPassword !== confirmPassword) {
      showMessage(t('profile.passwordsNotMatch'), false)
      return
    }
    setSaving(true)
    try {
      const data = await adminApi.resetUserPassword(user.id, newPassword)
      if (data.error) {
        showMessage(translateBackendError(data.error, t), false)
      } else {
        showMessage(t('admin.passwordChanged'), true)
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      showMessage(t('news.connectionError'), false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteArmed) {
      setDeleteArmed(true)
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const data = await adminApi.deleteUser(user.id)
      if (data.error) {
        showMessage(translateBackendError(data.error, t), false)
        setDeleteArmed(false)
      } else {
        onSaved()
        onClose()
      }
    } catch {
      showMessage(t('news.connectionError'), false)
      setDeleteArmed(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        className="card-surface max-h-[92vh] w-full max-w-lg overflow-y-auto shadow-card-lg scrollbar-app"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-user-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-sm">
          <h2 id="manage-user-title" className="font-display text-lg font-bold text-slate-900 sm:text-xl">
            {t('admin.manageUser')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100"
            aria-label={t('common.cancel')}
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-5">
          {message && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                message.startsWith('✅')
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              {message.startsWith('✅') ? message.replace(/^✅\s*/, '') : message}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t('auth.name')}</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t('auth.email')}</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t('admin.jobTitle')}</label>
              <input
                className="input-field"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t('admin.jobTitlePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t('admin.gradeLevel')}</label>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  max={99}
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-slate-500">{t('admin.gradeLevelHint')}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t('admin.manager')}</label>
                <select
                  className="input-field cursor-pointer"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <option value="">{t('admin.noManager')}</option>
                  {managerOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t('admin.roleLabel')}</label>
              <select
                className="input-field cursor-pointer"
                value={role}
                disabled={lockRoleToAdmin}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
              >
                <option value="EMPLOYEE">{t('admin.employee')}</option>
                <option value="ADMIN">{t('admin.administrator')}</option>
              </select>
              {lockRoleToAdmin && (
                <p className="mt-1 text-xs text-amber-700">{t('errors.cannotDemoteLastAdmin')}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t('admin.workStartDate')}</label>
              <input className="input-field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">{t('admin.workStartDateHint')}</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">
              {saving ? t('common.loading') : t('admin.saveUser')}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-2 text-sm font-bold text-slate-800">{t('admin.resetPasswordTitle')}</h3>
            <p className="mb-3 text-xs text-slate-600">{t('admin.resetPasswordHint')}</p>
            <div className="space-y-3">
              <input
                className="input-field"
                type="password"
                autoComplete="new-password"
                placeholder={t('profile.newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                className="input-field"
                type="password"
                autoComplete="new-password"
                placeholder={t('profile.confirmNewPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                disabled={saving}
                onClick={handleResetPassword}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                {t('admin.applyPassword')}
              </button>
            </div>
          </div>

          <div className="border-t border-rose-200/80 pt-4">
            <h3 className="mb-1 text-sm font-bold text-rose-800">{t('admin.dangerZone')}</h3>
            <p className="mb-3 text-xs text-slate-600">{t('admin.deleteUserConfirm')}</p>
            <button
              type="button"
              disabled={saving || isSelf}
              onClick={handleDelete}
              className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                deleteArmed
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isSelf ? t('errors.cannotDeleteSelf') : deleteArmed ? t('admin.confirmDelete') : t('admin.deleteUser')}
            </button>
            {deleteArmed && !isSelf && (
              <button type="button" className="mt-2 w-full text-xs font-semibold text-slate-600 hover:text-slate-900" onClick={() => setDeleteArmed(false)}>
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
