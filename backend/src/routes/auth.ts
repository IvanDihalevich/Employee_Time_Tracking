import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../lib/auth'

const router = Router()

/** Тимчасово для Render: AUTH_ERROR_DETAIL=1 у Environment → у відповіді буде prismaCode/detail */
function authFailureReason(error: unknown): Record<string, string | undefined> {
  if (process.env.AUTH_ERROR_DETAIL !== '1') return {}
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return { prismaCode: error.code, detail: error.message.slice(0, 280) }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { prismaInit: String(error.errorCode ?? ''), detail: error.message.slice(0, 280) }
  }
  if (error instanceof Error) {
    return { detail: error.message.slice(0, 280) }
  }
  return {}
}

// Реєстрація
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      message: 'Реєстрація успішна',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: (user as any).avatarUrl ?? null,
      },
    })
  } catch (error) {
    console.error(
      'Registration error:',
      error instanceof Error ? error.stack ?? error.message : error
    )
    res.status(500).json({ error: 'Помилка сервера', ...authFailureReason(error) })
  }
})

// Вхід
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email та пароль обов\'язкові' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Невірний email або пароль' })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.json({
      message: 'Вхід успішний',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: (user as any).avatarUrl ?? null,
      },
    })
  } catch (error) {
    console.error(
      'Login error:',
      error instanceof Error ? error.stack ?? error.message : error
    )
    res.status(500).json({ error: 'Помилка сервера', ...authFailureReason(error) })
  }
})

// Отримати поточного користувача
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const payload = verifyToken(token)

    if (!payload) {
      return res.status(401).json({ error: 'Невірний токен' })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      } as any,
    })

    if (!user) {
      return res.status(401).json({ error: 'Користувач не знайдений' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

// Оновити профіль користувача
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Не авторизовано' })
    }

    const payload = verifyToken(token)

    if (!payload) {
      return res.status(401).json({ error: 'Невірний токен' })
    }

    const { name, email, currentPassword, newPassword, avatarUrl } = req.body as {
      name?: string
      email?: string
      currentPassword?: string
      newPassword?: string
      avatarUrl?: string | null
    }

    // Отримуємо поточного користувача
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Користувач не знайдений' })
    }

    const updateData: { name?: string; email?: string; password?: string; avatarUrl?: string | null } = {}

    // Оновлення імені
    if (name && name !== user.name) {
      updateData.name = name
    }

    // Оновлення email
    if (email && email !== user.email) {
      // Перевірка, чи email не зайнятий іншим користувачем
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ error: 'Email вже використовується' })
      }

      updateData.email = email
    }

    // Оновлення пароля
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Введіть поточний пароль для зміни' })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Невірний поточний пароль' })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Новий пароль повинен містити мінімум 6 символів' })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    // Оновлення аватарки
    if ('avatarUrl' in req.body) {
      if (avatarUrl === null || avatarUrl === '') {
        updateData.avatarUrl = null
      } else if (typeof avatarUrl === 'string') {
        const next = avatarUrl.trim()
        const maxLen = 350_000
        if (next.length > maxLen) {
          return res.status(400).json({ error: 'Аватарка занадто велика' })
        }
        const okDataUrl = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(next)
        const okHttp = /^https?:\/\/.+/i.test(next)
        if (!okDataUrl && !okHttp) {
          return res.status(400).json({ error: 'Невірний формат аватарки' })
        }
        updateData.avatarUrl = next
      }
    }

    // Якщо немає змін
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Немає змін для оновлення' })
    }

    // Оновлюємо користувача
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      } as any,
    })

    res.json({ 
      message: 'Профіль успішно оновлено',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

export default router

