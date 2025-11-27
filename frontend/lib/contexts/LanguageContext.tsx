'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'uk' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uk')
  const [translations, setTranslations] = useState<any>(null)

  useEffect(() => {
    // Завантажуємо збережену мову з localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'uk' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Завантажуємо переклади
    const loadTranslations = async () => {
      try {
        const translations = await import(`../translations/${language}.json`)
        setTranslations(translations.default)
      } catch (error) {
        console.error('Error loading translations:', error)
        // Fallback до української
        const fallback = await import(`../translations/uk.json`)
        setTranslations(fallback.default)
      }
    }
    loadTranslations()
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    if (!translations) return key
    
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

