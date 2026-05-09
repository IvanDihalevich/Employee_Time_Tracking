# Деплой для спільного доступу (Vercel + Render + MongoDB Atlas)

Ціль: фронт на **Vercel**, API на **Render** (безкоштовні тарифи з обмеженнями), база — твій існуючий **MongoDB Atlas**.

---

## Крок 0. Код на GitHub

1. Створи репозиторій на [GitHub](https://github.com/new).
2. Запуш свій проєкт (корінь репо — папка з `frontend/`, `backend/`, `README.md`).

Без репозиторію Vercel і Render не зможуть підтягувати збірку автоматично.

---

## Крок 1. MongoDB Atlas (доступ з інтернету)

1. У кластері відкрий **Network Access → Add IP Address**.
2. Для простого демо додай **`0.0.0.0/0`** (доступ звідусіль; захист через логін/пароль до БД).
3. Переконайся, що **`DATABASE_URL`** у форматі Prisma для MongoDB є в руках (connection string з паролем).

Перший раз схему в прод можна накотити з комп’ютера (після того як `DATABASE_URL` вже відомий):

```bash
cd backend
set DATABASE_URL=твій_mongodb_connection_string
npx prisma db push
```

(У PowerShell замість `set` можна `$env:DATABASE_URL="..."`.)

---

## Крок 2. Backend на Render

1. Зайди на [render.com](https://render.com), зареєструйся (можна через GitHub).
2. **New → Web Service**.
3. Підключи свій GitHub-репозиторій, обери цей проєкт.
4. Налаштування:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
   - **Instance type**: Free (якщо доступно)
5. У розділі **Environment** додай змінні:

| Key | Значення |
|-----|----------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | твій повний MongoDB connection string |
| `JWT_SECRET` | довгий випадковий рядок (наприклад 32+ символів) |
| `FRONTEND_URL` | поки тимчасово `http://localhost:3000` — **оновиш після кроку 3** на URL з Vercel |

6. Збережи й зачекай деплою. Скопіюй публічний URL сервісу, наприклад `https://something.onrender.com`.

Перевірка в браузері: відкрий `https://something.onrender.com/api/health` — має бути JSON зі статусом OK.

**Важливо (Free на Render):** перший запит після простою може йти 30–60 секунд — це норма для «сплячого» безкоштовного інстансу.

---

## Крок 3. Frontend на Vercel

1. Зайди на [vercel.com](https://vercel.com), увійди через GitHub.
2. **Add New → Project**, імпортуй той самий репозиторій.
3. **Root Directory**: обери `frontend` (або вкажи в налаштуваннях монорепо саме цю папку).
4. У **Environment Variables** додай:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://something.onrender.com/api` |

Підстав свій реальний домен Render **без слеша в кінці**, але з **`/api`** в кінці.

5. Deploy. Після збірки отримаєш URL на кшталт `https://project-name.vercel.app`.

---

## Крок 4. Оновити CORS на бекенді

На Render у **Environment** зміни:

- `FRONTEND_URL` → точний URL з Vercel, наприклад `https://project-name.vercel.app`

Якщо потрібно кілька доменів (прод + превʼю Vercel), використай **`FRONTEND_URLS`** через кому:

```text
https://project-name.vercel.app,https://project-name-git-main-xxx.vercel.app
```

Після зміни змінних зроби **Manual Deploy → Clear build cache & deploy** або просто redeploy сервісу на Render.

---

## Крок 5. Перевірка «як для інших людей»

1. Відкрий сайт з Vercel у вікні інкогніто.
2. Зареєструй тестового користувача або увійди.
3. Переконайся, що запити в DevTools → Network йдуть на **Render**, а не на `localhost`.

---

## Швидкий чеклист помилок

| Симптом | Що перевірити |
|--------|----------------|
| CORS error у консолі | `FRONTEND_URL` / `FRONTEND_URLS` має **точно** збігатися з відкритою адресою (https, без зайвого слеша). |
| Network Error / failed fetch | `NEXT_PUBLIC_API_URL` на Vercel; чи живий API (`/api/health`). |
| Prisma / DB errors на Render | `DATABASE_URL`, Network Access `0.0.0.0/0` у Atlas. |
| Після деплою старі токени не працюють | Нормально, якщо змінився `JWT_SECRET` — потрібно залогінитись знову. |

---

## Файл `render.yaml` (опційно)

У корені репозиторію є чернетка **Blueprint** для Render; її можна підключити через Render Dashboard → Blueprints, або створити Web Service вручну за таблицею вище — обидва варіанти валідні.
