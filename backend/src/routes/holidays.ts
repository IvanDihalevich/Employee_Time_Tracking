import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, requireAdmin, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

// Отримати всі свята
router.get('/', async (req, res: Response) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    res.json({ holidays })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Створити свято (тільки для адміна)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const { name, date, type } = req.body

    if (!name || !date || !type) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' })
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        type,
      },
    })

    res.status(201).json({ holiday })
  } catch (error) {
    console.error('Error creating holiday:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

