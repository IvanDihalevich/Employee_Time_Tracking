import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

// Функція для розрахунку автоматичних вихідних
function calculateAutoAccruedDays(user: any): { vacationDays: number; sickLeaveDays: number } {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  
  // Лікарняні: 10 днів на рік
  const sickLeaveDays = 10
  
  // Відпустка: 1.5 дня на місяць роботи
  let vacationDays = 0
  if (user.startDate) {
    const startDate = new Date(user.startDate)
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    
    // Якщо почали працювати в поточному році
    if (startYear === currentYear) {
      // Розраховуємо з місяця початку роботи до поточного місяця (включно)
      const monthsWorked = currentDate.getMonth() - startMonth + 1
      vacationDays = monthsWorked * 1.5
    } else if (startYear < currentYear) {
      // Якщо працюють більше року, отримують 18 днів на рік (12 * 1.5)
      vacationDays = 18
    }
  }
  
  return { vacationDays, sickLeaveDays }
}

// Отримати всі запити користувача
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const requests = await prisma.timeOffRequest.findMany({
      where: {
        requesterId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        requester: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    res.json({ requests })
  } catch (error) {
    console.error('Error fetching time off requests:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Створити новий запит
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const { type, startDate, endDate, reason } = req.body

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' })
    }

    // Валідація дат
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Перевірка, що дати не в минулому
    if (start < today) {
      return res.status(400).json({ error: 'Дата початку не може бути в минулому' })
    }

    if (end < today) {
      return res.status(400).json({ error: 'Дата закінчення не може бути в минулому' })
    }

    // Перевірка, що дата закінчення не раніше дати початку
    if (end < start) {
      return res.status(400).json({ error: 'Дата закінчення не може бути раніше дати початку' })
    }

    const request = await prisma.timeOffRequest.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        requesterId: req.user.id,
      },
      include: {
        requester: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    res.status(201).json({ request })
  } catch (error) {
    console.error('Error creating time off request:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Оновити статус запиту (тільки для адміна)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ заборонено' })
    }

    const { status } = req.body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Невірний статус' })
    }

    const timeOffRequest = await prisma.timeOffRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        requester: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    res.json({ request: timeOffRequest })
  } catch (error) {
    console.error('Error updating time off request:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Отримати статистику вихідних користувача
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        startDate: true,
        vacationDays: true,
        sickLeaveDays: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' })
    }

    // Розраховуємо автоматичні вихідні
    const autoAccrued = calculateAutoAccruedDays(user)
    
    // Отримуємо використані дні з затверджених запитів
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    const approvedRequests = await prisma.timeOffRequest.findMany({
      where: {
        requesterId: req.user.id,
        status: 'APPROVED',
        startDate: { gte: yearStart },
        endDate: { lte: yearEnd },
      },
    })

    let usedVacationDays = 0
    let usedSickLeaveDays = 0

    approvedRequests.forEach((request) => {
      const days = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      if (request.type === 'VACATION') {
        usedVacationDays += days
      } else if (request.type === 'SICK_LEAVE') {
        usedSickLeaveDays += days
      }
    })

    // Загальна кількість = автоматичні + нараховані адміном
    const totalVacationDays = autoAccrued.vacationDays + (user.vacationDays || 0)
    const totalSickLeaveDays = autoAccrued.sickLeaveDays + (user.sickLeaveDays || 10) - 10 // Віднімаємо базові 10, щоб додати тільки додаткові

    const availableVacationDays = Math.max(0, totalVacationDays - usedVacationDays)
    const availableSickLeaveDays = Math.max(0, totalSickLeaveDays - usedSickLeaveDays)

    res.json({
      vacation: {
        total: totalVacationDays,
        used: usedVacationDays,
        available: availableVacationDays,
        autoAccrued: autoAccrued.vacationDays,
        manuallyAccrued: user.vacationDays || 0,
      },
      sickLeave: {
        total: totalSickLeaveDays,
        used: usedSickLeaveDays,
        available: availableSickLeaveDays,
        autoAccrued: autoAccrued.sickLeaveDays,
        manuallyAccrued: (user.sickLeaveDays || 10) - 10,
      },
      startDate: user.startDate,
    })
  } catch (error) {
    console.error('Error fetching time off stats:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

