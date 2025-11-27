import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LanguageProvider from '@/components/LanguageProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Система обліку робочого часу',
  description: 'Додаток для відстеження та обліку робочого часу працівників',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

