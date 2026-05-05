'use client'

import type { ReactNode } from 'react'
import { useLanguage } from '@/lib/contexts/LanguageContext'

type AuthSplitShellProps = {
  emoji: string
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthSplitShell({ emoji, title, subtitle, children }: AuthSplitShellProps) {
  const { language, setLanguage } = useLanguage()

  const languageToggle = (
    <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-md shadow-slate-900/10 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setLanguage('uk')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          language === 'uk' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="Українська"
      >
        🇺🇦
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          language === 'en' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="English"
      >
        🇺🇸
      </button>
    </div>
  )

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-5">{languageToggle}</div>

      <aside className="relative flex shrink-0 flex-col justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 px-6 py-10 text-white lg:min-h-screen lg:w-[44%] lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/2 hidden h-px w-32 -translate-y-1/2 bg-gradient-to-r from-white/40 to-transparent lg:block" />
        <div className="relative z-10 max-w-lg pr-20 sm:pr-24 lg:pr-0">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-lg backdrop-blur-sm">
            {emoji}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">TimeTracker</p>
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-indigo-100/95 sm:text-base">{subtitle}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col justify-center px-4 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-14 lg:py-12 lg:pt-12">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
