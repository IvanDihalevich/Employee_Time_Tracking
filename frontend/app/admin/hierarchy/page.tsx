'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'
import { authApi, adminApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'

type HierarchyUser = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  jobTitle?: string | null
  gradeLevel?: number | null
  managerId?: string | null
  avatarUrl?: string | null
}

function buildTree(users: HierarchyUser[]) {
  const byId = new Map<string, HierarchyUser>()
  const children = new Map<string | null, HierarchyUser[]>()

  for (const u of users) byId.set(u.id, u)

  const normalizedManager = (u: HierarchyUser): string | null => {
    if (!u.managerId) return null
    if (!byId.has(u.managerId)) return null
    if (u.managerId === u.id) return null
    return u.managerId
  }

  for (const u of users) {
    const key = normalizedManager(u)
    const arr = children.get(key) ?? []
    arr.push(u)
    children.set(key, arr)
  }

  const sort = (arr: HierarchyUser[]) =>
    arr.sort((a, b) => {
      const ga = a.gradeLevel ?? 0
      const gb = b.gradeLevel ?? 0
      if (ga !== gb) return ga - gb
      return a.name.localeCompare(b.name)
    })

  for (const [k, arr] of children.entries()) {
    children.set(k, sort(arr))
  }

  const roots = children.get(null) ?? []
  return { roots, children }
}

function TreeNode({
  user,
  childrenMap,
  expanded,
  toggle,
  depth,
  pathSet,
}: {
  user: HierarchyUser
  childrenMap: Map<string | null, HierarchyUser[]>
  expanded: Set<string>
  toggle: (id: string) => void
  depth: number
  pathSet: Set<string>
}) {
  const direct = childrenMap.get(user.id) ?? []
  const hasChildren = direct.length > 0
  const isExpanded = expanded.has(user.id)

  const isCycle = pathSet.has(user.id)
  const nextPath = useMemo(() => {
    const next = new Set(pathSet)
    next.add(user.id)
    return next
  }, [pathSet, user.id])

  return (
    <div className="relative">
      <div
        className="card-surface relative flex items-start gap-3 border-slate-200/80 bg-white p-4 shadow-sm"
        style={{ marginLeft: depth * 18 }}
      >
        <div className="mt-0.5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(user.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300">
              ·
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 truncate font-display text-base font-bold text-slate-900">{user.name}</div>
            {user.role === 'ADMIN' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Admin
              </span>
            )}
            {(user.gradeLevel ?? 0) > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                L{user.gradeLevel ?? 0}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {user.jobTitle ? user.jobTitle : <span className="text-slate-400">—</span>}
          </div>
          <div className="mt-1 truncate text-xs text-slate-500">{user.email}</div>
          {isCycle && <div className="mt-2 text-xs font-semibold text-rose-700">Cycle detected</div>}
        </div>
      </div>

      {hasChildren && isExpanded && !isCycle && (
        <div className="mt-2 space-y-2 border-l-2 border-slate-200 pl-3">
          {direct.map((c) => (
            <TreeNode
              key={c.id}
              user={c}
              childrenMap={childrenMap}
              expanded={expanded}
              toggle={toggle}
              depth={depth + 1}
              pathSet={nextPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminHierarchyPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<HierarchyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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
          }
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    if (!user) return
    let mounted = true
    adminApi
      .getHierarchy()
      .then((data) => {
        if (!mounted) return
        if (data.users) setUsers(data.users)
      })
      .catch((e) => console.error('Error fetching hierarchy:', e))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [user])

  const { roots, children } = useMemo(() => buildTree(users), [users])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAllTop = () => {
    const next = new Set<string>()
    for (const r of roots) {
      if ((children.get(r.id) ?? []).length > 0) next.add(r.id)
    }
    setExpanded(next)
  }

  if (loading || !user) return <LoadingScreen />

  return (
    <div className="app-shell min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <PageHeader
          title={t('admin.hierarchyTitle')}
          description={t('admin.hierarchyDescription')}
          icon="👥"
          backHref="/admin/dashboard"
          backLabel={t('admin.backToPanel')}
        />

        <div className="card-surface p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={expandAllTop}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              {t('admin.expandTop')}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(new Set())}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              {t('admin.collapseAll')}
            </button>
            <div className="ml-auto text-sm text-slate-500">
              {t('admin.totalUsers')}: <span className="font-semibold text-slate-800">{users.length}</span>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-5xl opacity-90">🧭</div>
              <p className="text-lg font-medium text-slate-600">{t('admin.noUsers')}</p>
            </div>
          ) : roots.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-600">{t('admin.hierarchyNoRoots')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roots.map((r) => (
                <TreeNode
                  key={r.id}
                  user={r}
                  childrenMap={children}
                  expanded={expanded}
                  toggle={toggle}
                  depth={0}
                  pathSet={new Set()}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

