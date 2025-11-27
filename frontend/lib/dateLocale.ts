import uk from 'date-fns/locale/uk'
import enUS from 'date-fns/locale/en-US'
import { Locale } from 'date-fns'

export function getDateLocale(language: 'uk' | 'en'): Locale {
  return language === 'uk' ? uk : enUS
}

