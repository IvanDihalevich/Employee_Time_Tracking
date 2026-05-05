'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authApi } from '@/lib/api'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface NavbarProps {
  user: {
    name: string
    role: string
    avatarUrl?: string | null
  }
}

function NavLink({
  href,
  children,
  onNavigate,
}: {
  href: string
  children: ReactNode
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
        active
          ? 'bg-sky-400/20 text-white ring-1 ring-sky-400/50'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    authApi.logout()
    router.push('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  const employeeLinks = (
    <>
      <NavLink href="/dashboard" onNavigate={closeMobile}>
        <span aria-hidden>🏠</span>
        {t('navbar.home')}
      </NavLink>
      <NavLink href="/hierarchy" onNavigate={closeMobile}>
        <span aria-hidden>👥</span>
        {t('navbar.hierarchy')}
      </NavLink>
      <NavLink href="/news" onNavigate={closeMobile}>
        <span aria-hidden>📰</span>
        {t('navbar.news')}
      </NavLink>
      <NavLink href="/calendar" onNavigate={closeMobile}>
        <span aria-hidden>📅</span>
        {t('navbar.calendar')}
      </NavLink>
    </>
  )

  const adminLinks = (
    <>
      <NavLink href="/admin/dashboard" onNavigate={closeMobile}>
        <span aria-hidden>👑</span>
        {t('navbar.adminPanel')}
      </NavLink>
      <NavLink href="/admin/hierarchy" onNavigate={closeMobile}>
        <span aria-hidden>👥</span>
        {t('navbar.hierarchy')}
      </NavLink>
      <NavLink href="/admin/requests" onNavigate={closeMobile}>
        <span aria-hidden>📋</span>
        {t('navbar.requests')}
      </NavLink>
      <NavLink href="/admin/news" onNavigate={closeMobile}>
        <span aria-hidden>📰</span>
        {t('navbar.news')}
      </NavLink>
    </>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-900 shadow-lg shadow-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 cursor-default select-none items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg text-white shadow-md shadow-sky-500/30" aria-hidden>
                ⏰
              </div>
              <span className="font-display hidden text-xl font-bold tracking-tight text-white sm:inline">TimeTracker</span>
            </div>

            <div className="ml-2 hidden items-center gap-1 sm:ml-6 sm:flex">
              {user.role === 'ADMIN' ? adminLinks : employeeLinks}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-200 ring-1 ring-slate-600 hover:bg-slate-800 sm:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Menu"
            >
              <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
            </button>

            <Link
              href="/profile"
              className="hidden max-w-[10rem] items-center gap-2 truncate rounded-xl border border-slate-600 bg-slate-800/90 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition-colors hover:border-sky-500/50 hover:text-white sm:flex lg:max-w-xs"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-7 w-7 shrink-0 rounded-lg border border-slate-600 object-cover"
                />
              ) : (
                <span className="shrink-0 text-base" aria-hidden>
                  👤
                </span>
              )}
              <span className="truncate">{user.name}</span>
              {user.role === 'ADMIN' && (
                <span className="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200 ring-1 ring-amber-400/40">
                  Admin
                </span>
              )}
            </Link>

            <div className="flex items-center gap-0.5 rounded-xl border border-slate-600 bg-slate-800/90 p-1">
              <button
                type="button"
                onClick={() => setLanguage('uk')}
                className={`rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                  language === 'uk' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                }`}
                title="Українська"
              >
                🇺🇦
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                  language === 'en' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                }`}
                title="English"
              >
                🇺🇸
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-900/40 transition-all hover:from-rose-600 hover:to-red-700 sm:inline-flex"
            >
              {t('navbar.logout')}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="mobile-nav" className="border-t border-slate-700 py-3 sm:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {user.role === 'ADMIN' ? adminLinks : employeeLinks}
              <Link
                href="/profile"
                onClick={closeMobile}
                className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-lg border border-slate-600 object-cover"
                  />
                ) : (
                  <span aria-hidden>👤</span>
                )}{' '}
                {t('profile.title')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMobile()
                  handleLogout()
                }}
                className="mt-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-md"
              >
                {t('navbar.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
