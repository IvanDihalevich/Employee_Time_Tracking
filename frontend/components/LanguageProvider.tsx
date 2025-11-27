'use client'

import { LanguageProvider as Provider } from '@/lib/contexts/LanguageContext'

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>
}

