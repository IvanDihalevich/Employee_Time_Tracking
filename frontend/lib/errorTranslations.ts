// Мапа для перекладу повідомлень про помилки з бекенду
export const translateBackendError = (error: string, t: (key: string) => string): string => {
  const errorMap: Record<string, string> = {
    "Всі поля обов'язкові": t('errors.allFieldsRequired'),
    "Користувач з таким email вже існує": t('errors.userExists'),
    "Невірний email або пароль": t('errors.invalidCredentials'),
    "Не авторизовано": t('errors.notAuthorized'),
    "Невірний токен": t('errors.invalidToken'),
    "Користувач не знайдений": t('errors.userNotFound'),
    "Email вже використовується": t('errors.emailInUse'),
    "Введіть поточний пароль для зміни": t('errors.enterCurrentPassword'),
    "Невірний поточний пароль": t('errors.invalidCurrentPassword'),
    "Помилка сервера": t('errors.serverError'),
    "Доступ заборонено": t('errors.accessDenied'),
    "Невірний статус": t('errors.invalidStatus'),
    "Заголовок та контент обов'язкові": t('errors.titleAndContentRequired'),
    "Зображення занадто велике. Максимальний розмір: 1MB": t('errors.imageTooLarge'),
    "Новина з таким заголовком вже існує": t('errors.newsExists'),
    "Реєстрація успішна": t('errors.registrationSuccess'),
    "Вхід успішний": t('errors.loginSuccess'),
    "Дата початку не може бути в минулому": t('timeOff.startDatePast'),
    "Дата закінчення не може бути в минулому": t('timeOff.endDatePast'),
    "Дата закінчення не може бути раніше дати початку": t('timeOff.endBeforeStart'),
    "Email та пароль обов'язкові": t('errors.allFieldsRequired'),
    "Немає змін для оновлення": t('common.noChanges'),
    "Новий пароль повинен містити мінімум 6 символів": t('profile.minPasswordLength'),
  }

  // Перевіряємо точний збіг
  if (errorMap[error]) {
    return errorMap[error]
  }

  // Перевіряємо частковий збіг
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value
    }
  }

  // Якщо не знайдено переклад, повертаємо оригінальне повідомлення
  return error
}

