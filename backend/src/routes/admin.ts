import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, requireAdmin, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

// Отримати всі запити (для адміна)
router.get('/requests', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.timeOffRequest.findMany({
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
    console.error('Error fetching requests:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Отримати статистику (для адміна)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [pendingRequests, approvedRequests, totalUsers] = await Promise.all([
      prisma.timeOffRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.timeOffRequest.count({
        where: { status: 'APPROVED' },
      }),
      prisma.user.count(),
    ])

    res.json({
      pendingRequests,
      approvedRequests,
      totalUsers,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Отримати всіх користувачів (для адміна)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        startDate: true,
        vacationDays: true,
        sickLeaveDays: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Нарахувати вихідні користувачу (для адміна)
router.post('/users/:userId/accrual', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const { userId } = req.params
    const { type, days, reason, startDate } = req.body

    if (!type || !['VACATION', 'SICK_LEAVE'].includes(type)) {
      return res.status(400).json({ error: 'Невірний тип вихідних' })
    }

    if (!days || days <= 0) {
      return res.status(400).json({ error: 'Кількість днів повинна бути більше 0' })
    }

    // Перевіряємо, чи існує користувач
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' })
    }

    // Оновлюємо кількість вихідних у користувача
    const updateData: any = {}
    if (type === 'VACATION') {
      updateData.vacationDays = (user.vacationDays || 0) + days
    } else {
      updateData.sickLeaveDays = (user.sickLeaveDays || 10) + days
    }

    // Оновлюємо startDate, якщо він переданий
    if (startDate) {
      updateData.startDate = new Date(startDate)
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Створюємо запис в історії нарахувань
    await prisma.daysAccrual.create({
      data: {
        userId,
        type,
        days,
        reason: reason || null,
        adminId: req.user.id,
      },
    })

    res.json({ success: true, message: 'Вихідні успішно нараховані' })
  } catch (error) {
    console.error('Error accruing days:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Отримати історію нарахувань користувача (для адміна)
router.get('/users/:userId/accruals', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const accruals = await prisma.daysAccrual.findMany({
      where: { userId },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json({ accruals })
  } catch (error) {
    console.error('Error fetching accruals:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Отримати повну статистику користувача (для адміна)
router.get('/users/:userId/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        startDate: true,
        vacationDays: true,
        sickLeaveDays: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' })
    }

    // Розраховуємо автоматичні вихідні
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    let autoVacationDays = 0
    
    if (user.startDate) {
      const startDate = new Date(user.startDate)
      const startYear = startDate.getFullYear()
      const startMonth = startDate.getMonth()
      
      if (startYear === currentYear) {
        const monthsWorked = currentDate.getMonth() - startMonth + 1
        autoVacationDays = monthsWorked * 1.5
      } else if (startYear < currentYear) {
        autoVacationDays = 18
      }
    }

    const autoSickLeaveDays = 10

    // Отримуємо використані дні
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    const approvedRequests = await prisma.timeOffRequest.findMany({
      where: {
        requesterId: userId,
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

    const totalVacationDays = autoVacationDays + (user.vacationDays || 0)
    const totalSickLeaveDays = autoSickLeaveDays + (user.sickLeaveDays || 10) - 10

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        startDate: user.startDate,
      },
      vacation: {
        total: totalVacationDays,
        used: usedVacationDays,
        available: Math.max(0, totalVacationDays - usedVacationDays),
        autoAccrued: autoVacationDays,
        manuallyAccrued: user.vacationDays || 0,
      },
      sickLeave: {
        total: totalSickLeaveDays,
        used: usedSickLeaveDays,
        available: Math.max(0, totalSickLeaveDays - usedSickLeaveDays),
        autoAccrued: autoSickLeaveDays,
        manuallyAccrued: (user.sickLeaveDays || 10) - 10,
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

