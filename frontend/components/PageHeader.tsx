import type { ReactNode } from 'react'
import Link from 'next/link'

type PageHeaderProps = {
  title: string
  description?: string
  icon?: ReactNode
  backHref?: string
  backLabel?: string
}

export default function PageHeader({
  title,
  description,
  icon,
  backHref,
  backLabel,
}: PageHeaderProps) {
  return (
    <header className="mb-8 lg:mb-10">
      {backHref && backLabel && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 border-l-4 border-indigo-600 pl-4 sm:pl-5">
          <h1 className="font-display flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {icon != null && (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-2xl text-white shadow-md shadow-primary-600/25"
                aria-hidden
              >
                {icon}
              </span>
            )}
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
