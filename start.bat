@echo off
chcp 65001 >nul
echo ====================================
echo   Запуск проекту
echo ====================================
echo.

cd /d "%~dp0"

echo Перевірка налаштувань...
if not exist backend\.env (
    echo ❌ Помилка: backend/.env не знайдено!
    pause
    exit /b 1
)

if not exist frontend\.env.local (
    echo ❌ Помилка: frontend/.env.local не знайдено!
    pause
    exit /b 1
)

echo ✅ Всі файли конфігурації на місці
echo.

echo [1/2] Запуск Backend сервера...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 4 /nobreak >nul

echo [2/2] Запуск Frontend сервера...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================================
echo   ✅ Сервери запущені!
echo ====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Відкрийте браузер: http://localhost:3000
echo.
echo ⚠️  Не закривайте вікна з серверами!
echo.
pause
