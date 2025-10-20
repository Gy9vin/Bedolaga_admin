# RemnaWave Bedolaga Admin Panel

Веб-админка для RemnaWave Bedolaga Bot, построенная на Python (FastAPI) и современном UI-стеке (React + Vite + TypeScript + Material UI). Проект предназначен для контейнеризации через Docker и развертывания на отдельных серверах.

## Статус

- Текущий прогресс отражается в `WEB_ADMIN_IMPLEMENTATION_PLAN.md`.
- Готов backend-каркас (FastAPI) с health/statistics прокси, авторизацией по JWT и audit-логированием.
- Инициализирован frontend (Vite + React + TypeScript + Material UI + React Query) с базовым layout и дашбордом статистики.

## Структура репозитория

- `backend/` — FastAPI backend-for-frontend, клиент к административному API.
- `frontend/` — React-приложение админки.
- `infra/` — инфраструктурные скрипты, конфигурация Docker/Docker Compose, CI/CD.
- `docs/` — документация, диаграммы, схемы.
- `tests/` — автоматические тесты (backend, frontend, e2e).

## Требования

- Docker / Docker Compose
- Python 3.12
- Node.js 18+

## Запуск (черновик)

1. Скопируйте примеры окружения:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```
   Обновите токены: `REMNAWAVE_API_TOKEN` для доступа к исходному API и `ADMIN_JWT_SECRET` для выпуска JWT.
2. Соберите и поднимите сервисы:
   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```
3. После сборки:
   - Backend доступен на `http://localhost:8080`
   - Frontend доступен на `http://localhost:3000`

> Примечание: backend и frontend содержат каркасные реализации. Функционал будет расширяться по мере прохождения последующих этапов плана.

## Frontend локально

```bash
cd frontend
npm install
npm run dev
```

По умолчанию dev-сервер работает на `http://localhost:5173` и проксирует API-запросы на `VITE_API_BASE_URL` (по умолчанию `/api`).
