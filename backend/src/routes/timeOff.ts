import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

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

export default router

