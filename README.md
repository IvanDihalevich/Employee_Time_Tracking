# Система обліку робочого часу працівників

Додаток для відстеження та обліку робочого часу працівників, розроблений для дипломної роботи.

## Архітектура

Проект розділений на дві окремі частини:
- **Backend** - Express.js REST API сервер
- **Frontend** - Next.js React додаток

## Технології

### Backend:
- **Express.js** - веб-фреймворк
- **TypeScript** - типізація
- **MongoDB Atlas** - хмарна база даних
- **Prisma** - ORM для роботи з базою даних
- **JWT** - аутентифікація
- **bcryptjs** - хешування паролів

### Frontend:
- **Next.js 14** - React фреймворк
- **React** - UI бібліотека
- **TypeScript** - типізація
- **Tailwind CSS** - стилізація
- **react-calendar** - календар компонент
- **date-fns** - робота з датами

## Функціонал

### Для працівників:
- ✅ Реєстрація та вхід в систему
- ✅ Перегляд новин компанії
- ✅ Календар з вихідними та святами
- ✅ Подача запитів на відпустку та лікарняний
- ✅ Перегляд статусу своїх запитів

### Для адміністраторів:
- ✅ Панель управління зі статистикою
- ✅ Схвалення/відхилення запитів на відпустку/лікарняний
- ✅ Створення та публікація новин компанії
- ✅ Управління святами та вихідними

## Швидкий старт

### 1. Налаштування MongoDB Atlas

1. Зареєструйтеся на https://www.mongodb.com/cloud/atlas
2. Створіть безкоштовний кластер
3. Отримайте connection string
4. Додайте ваш IP в Network Access
5. Оновіть `DATABASE_URL` в `backend/.env`

### 2. Встановлення залежностей

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Налаштування бази даних

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4. Запуск проекту

**Варіант 1: Автоматично**
```bash
start.bat
```

**Варіант 2: Вручну**

Термінал 1 - Backend:
```bash
cd backend
npm run dev
```

Термінал 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 5. Відкрийте браузер

Перейдіть на: **http://localhost:3000**

## Створення адміністратора

1. Зареєструйтеся через форму на сайті
2. Відкрийте Prisma Studio:
   ```bash
   cd backend
   npm run prisma:studio
   ```
3. Знайдіть вашого користувача в таблиці `users`
4. Змініть поле `role` з `EMPLOYEE` на `ADMIN`
5. Збережіть зміни

## Структура проекту

```
├── backend/          # Backend API сервер
│   ├── src/         # Вихідний код
│   ├── prisma/      # Prisma схема
│   └── .env         # Змінні оточення
│
└── frontend/         # Frontend додаток
    ├── app/         # Next.js сторінки
    ├── components/   # React компоненти
    └── .env.local   # Змінні оточення
```

## Доступні скрипти

### Backend:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка для продакшну
- `npm run prisma:studio` - Відкриття Prisma Studio
- `npm run prisma:push` - Синхронізація схеми з БД

### Frontend:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка для продакшну

## API Endpoints

### Auth
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Вхід
- `GET /api/auth/me` - Отримати поточного користувача

### Time Off
- `GET /api/time-off` - Отримати запити користувача
- `POST /api/time-off` - Створити запит
- `PATCH /api/time-off/:id` - Оновити статус запиту (тільки адмін)

### Admin
- `GET /api/admin/requests` - Отримати всі запити (тільки адмін)

### News
- `GET /api/news` - Отримати всі новини
- `POST /api/news` - Створити новину (тільки адмін)

### Holidays
- `GET /api/holidays` - Отримати всі свята
- `POST /api/holidays` - Створити свято (тільки адмін)

## Ліцензія

Цей проект створено для дипломної роботи.
