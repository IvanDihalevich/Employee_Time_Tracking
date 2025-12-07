import { prisma } from '../lib/prisma'

// Стандартні свята України (за новим календарем)
const standardHolidays = [
  // Січень
  { name: 'Новий рік', date: new Date(new Date().getFullYear(), 0, 1), type: 'public_holiday' },
  
  // Лютий
  { name: 'День закоханих', date: new Date(new Date().getFullYear(), 1, 14), type: 'public_holiday' },
  
  // Березень
  { name: 'Міжнародний жіночий день', date: new Date(new Date().getFullYear(), 2, 8), type: 'public_holiday' },
  
  // Квітень/Травень - Великдень буде розраховано динамічно
  { name: 'День праці', date: new Date(new Date().getFullYear(), 4, 1), type: 'public_holiday' },
  
  // Травень
  { name: 'День пам\'яті та примирення', date: new Date(new Date().getFullYear(), 4, 8), type: 'public_holiday' },
  { name: 'День Перемоги над нацизмом', date: new Date(new Date().getFullYear(), 4, 9), type: 'public_holiday' },
  { name: 'День Конституції України', date: new Date(new Date().getFullYear(), 5, 28), type: 'public_holiday' },
  
  // Серпень
  { name: 'День Незалежності України', date: new Date(new Date().getFullYear(), 7, 24), type: 'public_holiday' },
  
  // Жовтень
  { name: 'День захисників України', date: new Date(new Date().getFullYear(), 9, 14), type: 'public_holiday' },
  
  // Грудень
  { name: 'День Святого Миколая', date: new Date(new Date().getFullYear(), 11, 19), type: 'public_holiday' },
  { name: 'Різдво Христове', date: new Date(new Date().getFullYear(), 11, 25), type: 'public_holiday' },
]

// Функція для розрахунку Великодня (алгоритм Гауса)
function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

async function seedHolidays() {
  try {
    console.log('🌱 Початок додавання стандартних свят...')
    
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    // Створюємо масив свят для поточного та наступного року
    const holidaysToCreate = []
    
    for (let year = currentYear; year <= nextYear; year++) {
      // Розраховуємо Великдень для кожного року
      const easter = calculateEaster(year)
      
      const yearHolidays = standardHolidays.map(holiday => {
        // Оновлюємо рік для всіх свят
        const date = new Date(holiday.date)
        date.setFullYear(year)
        return {
          name: holiday.name,
          date: date,
          type: holiday.type,
        }
      })
      
      // Додаємо Великдень
      yearHolidays.push({
        name: 'Великдень (Пасха)',
        date: easter,
        type: 'public_holiday',
      })
      
      holidaysToCreate.push(...yearHolidays)
    }
    
    let created = 0
    let skipped = 0
    
    for (const holiday of holidaysToCreate) {
      // Перевіряємо, чи свято вже існує
      const existing = await prisma.holiday.findFirst({
        where: {
          name: holiday.name,
          date: {
            gte: new Date(holiday.date.getFullYear(), holiday.date.getMonth(), holiday.date.getDate()),
            lt: new Date(holiday.date.getFullYear(), holiday.date.getMonth(), holiday.date.getDate() + 1),
          },
        },
      })
      
      if (!existing) {
        await prisma.holiday.create({
          data: holiday,
        })
        created++
        console.log(`✅ Додано: ${holiday.name} - ${holiday.date.toLocaleDateString('uk-UA')}`)
      } else {
        skipped++
        console.log(`⏭️  Пропущено (вже існує): ${holiday.name} - ${holiday.date.toLocaleDateString('uk-UA')}`)
      }
    }
    
    console.log(`\n✨ Готово! Створено: ${created}, Пропущено: ${skipped}`)
  } catch (error) {
    console.error('❌ Помилка при додаванні свят:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedHolidays()
  .then(() => {
    console.log('🎉 Скрипт завершено успішно!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Помилка:', error)
    process.exit(1)
  })

