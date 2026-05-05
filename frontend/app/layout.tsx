import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import LanguageProvider from '@/components/LanguageProvider'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-display' })

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
    <html lang="uk" className={`${inter.variable} ${manrope.variable}`}>
      <body className={`${inter.className} font-sans antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

