import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../lib/auth'

const router = Router()

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
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Помилка сервера' })
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
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Помилка сервера' })
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
      },
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

    const { name, email, currentPassword, newPassword } = req.body

    // Отримуємо поточного користувача
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Користувач не знайдений' })
    }

    const updateData: { name?: string; email?: string; password?: string } = {}

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
      },
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

