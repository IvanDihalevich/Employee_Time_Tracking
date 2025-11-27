# Інструкція з налаштування та запуску проекту

## Крок 1: Налаштування MongoDB Atlas

1. Зареєструйтеся на https://www.mongodb.com/cloud/atlas
2. Створіть безкоштовний кластер
3. Отримайте connection string (Connect → Connect your application)
4. Додайте ваш IP в Network Access (Add IP Address → Add Current IP Address)
5. Оновіть `DATABASE_URL` в `backend/.env`:
   - Додайте назву бази даних: `/employee-time-tracking`
   - Замініть параметри на: `?retryWrites=true&w=majority`
   
   **Приклад:**
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/employee-time-tracking?retryWrites=true&w=majority"
   ```

## Крок 2: Налаштування Backend

1. Відкрийте термінал і перейдіть в папку backend:
```bash
cd backend
```

2. Встановіть залежності:
```bash
npm install
```

3. Перевірте файл `.env` в папці `backend/`:
   - Якщо файлу немає, скопіюйте `.env.example` або створіть новий
   - Переконайтеся, що `DATABASE_URL` вказує на вашу MongoDB базу
   - Змініть `JWT_SECRET` на унікальний випадковий рядок

4. Створіть схему бази даних:
```bash
npm run prisma:generate
npm run prisma:push
```

5. Запустіть backend сервер:
```bash
npm run dev
```

Backend буде доступний на `http://localhost:5000`

## Крок 3: Налаштування Frontend

1. Відкрийте **новий термінал** і перейдіть в папку frontend:
```bash
cd frontend
```

2. Встановіть залежності:
```bash
npm install
```

3. Перевірте файл `.env.local` в папці `frontend/`:
   - Якщо файлу немає, створіть новий з вмістом:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Запустіть frontend сервер:
```bash
npm run dev
```

Frontend буде доступний на `http://localhost:3000`

## Крок 4: Створення адміністратора

1. Зареєструйтеся через форму реєстрації на `http://localhost:3000/register`
   - Це створить користувача з ролью `EMPLOYEE`

2. Відкрийте Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

3. Відкриється браузер з Prisma Studio
4. Перейдіть в таблицю `users`
5. Знайдіть вашого користувача
6. Змініть поле `role` з `EMPLOYEE` на `ADMIN`
7. Збережіть зміни

Альтернативно, через MongoDB:
```javascript
db.users.updateOne(
  { email: "ваш-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Перевірка роботи

1. Відкрийте браузер: `http://localhost:3000`
2. Зареєструйтеся або увійдіть
3. Якщо ви адміністратор - побачите панель адміна
4. Якщо працівник - побачите панель працівника

## Можливі проблеми

### Помилка підключення до MongoDB
- Перевірте, чи запущений MongoDB
- Перевірте `DATABASE_URL` в `backend/.env`
- Для MongoDB Atlas перевірте, чи додано ваш IP в whitelist

### Помилка CORS
- Переконайтеся, що `FRONTEND_URL` в `backend/.env` відповідає URL frontend
- Переконайтеся, що frontend запущений на правильному порту

### Помилка "Cannot find module"
- Видаліть `node_modules` та `package-lock.json`
- Запустіть `npm install` знову

### Помилка Prisma
- Запустіть `npm run prisma:generate` в папці backend
- Перевірте, чи правильний `DATABASE_URL`

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

## Корисні команди

### Backend:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка для продакшну
- `npm run prisma:studio` - Відкриття Prisma Studio
- `npm run prisma:push` - Синхронізація схеми з БД

### Frontend:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка для продакшну
- `npm run start` - Запуск продакшн версії

