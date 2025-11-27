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

export default router

