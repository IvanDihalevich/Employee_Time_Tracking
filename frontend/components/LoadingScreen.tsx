'use client'

import { useLanguage } from '@/lib/contexts/LanguageContext'

type LoadingScreenProps = {
  message?: string
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useLanguage()

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div
          className="mx-auto h-12 w-12 rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin"
          role="status"
          aria-label={message ?? t('common.loading')}
        />
        <p className="mt-4 text-sm font-medium text-slate-600">{message ?? t('common.loading')}</p>
      </div>
    </div>
  )
}
