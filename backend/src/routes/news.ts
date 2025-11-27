import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, requireAdmin, AuthRequest } from '../lib/auth'
import { Response } from 'express'

const router = Router()

// Отримати всі новини
router.get('/', async (req, res: Response) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    res.json({ news })
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Створити новину (тільки для адміна)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок та контент обов\'язкові' })
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    res.status(201).json({ news })
  } catch (error) {
    console.error('Error creating news:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

