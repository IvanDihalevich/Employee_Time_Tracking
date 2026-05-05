import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

// Отримати ієрархію користувачів (для авторизованих)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        gradeLevel: true,
        managerId: true,
        avatarUrl: true,
      } as any,
      orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }] as any,
    })

    res.json({ users })
  } catch (error) {
    console.error('Error fetching hierarchy:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

