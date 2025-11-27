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

    const { title, content, imageUrl } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок та контент обов\'язкові' })
    }

    // Обробка imageUrl - якщо це base64, обмежуємо розмір
    let processedImageUrl = null
    if (imageUrl) {
      // Якщо це base64, перевіряємо розмір (макс 16MB для MongoDB)
      if (imageUrl.startsWith('data:image')) {
        // Обмежуємо base64 до розумного розміру (наприклад, 1MB)
        if (imageUrl.length > 1000000) {
          return res.status(400).json({ error: 'Зображення занадто велике. Максимальний розмір: 1MB' })
        }
        processedImageUrl = imageUrl
      } else {
        // Якщо це URL, просто зберігаємо
        processedImageUrl = imageUrl
      }
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        ...(processedImageUrl && { imageUrl: processedImageUrl }),
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
  } catch (error: any) {
    console.error('Error creating news:', error)
    // Детальніша інформація про помилку для відлагодження
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Новина з таким заголовком вже існує' })
    }
    if (error.message?.includes('imageUrl')) {
      return res.status(400).json({ error: 'Помилка з полем imageUrl. Можливо, база даних не оновлена. Запустіть: npm run prisma:push' })
    }
    res.status(500).json({ 
      error: 'Помилка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router

