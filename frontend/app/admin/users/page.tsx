'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { authApi, adminApi } from '@/lib/api'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import AccrualForm from '@/components/AccrualForm'
import AdminUserManageModal, { type ManagedUser } from '@/components/AdminUserManageModal'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { getDateLocale } from '@/lib/dateLocale'

interface User extends ManagedUser {
  vacationDays?: number
  sickLeaveDays?: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const dateLocale = getDateLocale(language)
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAccrualModal, setShowAccrualModal] = useState(false)
  const [manageUser, setManageUser] = useState<ManagedUser | null>(null)

  const adminCount = users.filter((x) => x.role === 'ADMIN').length

  const handleUserSaved = (updated?: ManagedUser) => {
    void fetchUsers()
    if (updated) setManageUser(updated)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    authApi
      .getMe()
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
    return <LoadingScreen />
  }

  return (
    <div className="app-shell min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <PageHeader
          title={t('admin.userList')}
          description={`${t('admin.totalUsers')}: ${users.length}`}
          icon="👥"
          backHref="/admin/dashboard"
          backLabel={t('admin.backToPanel')}
        />

        <div className="card-surface p-6 sm:p-8">
          {users.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-5xl opacity-90">👥</div>
              <p className="text-lg font-medium text-slate-600">{t('admin.noUsers')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="card-surface flex flex-col border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-xl font-bold text-white shadow-md">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.role === 'ADMIN' && (
                      <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Admin
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{u.name}</h3>
                  <p className="mt-1 flex items-start gap-2 break-all text-sm text-slate-600">
                    <span className="shrink-0" aria-hidden>
                      📧
                    </span>
                    {u.email}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span aria-hidden>📅</span>
                    {t('calendar.registered')}: {format(new Date(u.createdAt), 'd MMMM yyyy', { locale: dateLocale })}
                  </p>
                  <div className="mt-4 flex flex-1 flex-col gap-3 border-t border-slate-200/80 pt-4">
                    <span
                      className={`inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-violet-100 text-violet-800' : 'bg-primary-100 text-primary-800'
                      }`}
                    >
                      {u.role === 'ADMIN' ? `👑 ${t('admin.administrator')}` : `👤 ${t('admin.employee')}`}
                    </span>
                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setManageUser(u)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        ⚙️ {t('admin.manageUserAction')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(u)
                          setShowAccrualModal(true)
                        }}
                        className="btn-primary w-full py-2.5 text-sm"
                      >
                        💰 {t('admin.accrueDays') || 'Нарахувати вихідні'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {manageUser && (
        <AdminUserManageModal
          user={manageUser}
          currentAdminId={user.id}
          adminCount={adminCount}
          onClose={() => setManageUser(null)}
          onSaved={handleUserSaved}
        />
      )}

      {showAccrualModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            className="card-surface max-h-[90vh] w-full max-w-md overflow-y-auto shadow-card-lg scrollbar-app"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accrual-modal-title"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <h2 id="accrual-modal-title" className="font-display text-xl font-bold text-slate-900">
                {t('admin.accrueDaysTitle') || 'Нарахування вихідних'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAccrualModal(false)
                  setSelectedUser(null)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label={t('common.cancel')}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AccrualForm
                userId={selectedUser.id}
                userName={selectedUser.name}
                onSuccess={() => {
                  setShowAccrualModal(false)
                  setSelectedUser(null)
                  fetchUsers()
                }}
                onCancel={() => {
                  setShowAccrualModal(false)
                  setSelectedUser(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
