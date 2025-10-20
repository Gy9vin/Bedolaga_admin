# RemnaWave Bedolaga Admin Panel

Веб-админка для RemnaWave Bedolaga Bot, построенная на Python (FastAPI) и современном UI-стеке (React + Vite + TypeScript + Material UI). Проект предназначен для контейнеризации через Docker и развертывания на отдельных серверах.

## Статус

- Текущий прогресс отражается в `WEB_ADMIN_IMPLEMENTATION_PLAN.md`.
- На данный момент ведется подготовка инфраструктуры репозитория.

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
2. Соберите и поднимите сервисы:
   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```
3. После сборки:
   - Backend доступен на `http://localhost:8080`
   - Frontend доступен на `http://localhost:3000`

> Примечание: текущие шаблоны не содержат исходного кода приложения. Реализация backend/frontend будет добавлена на следующих этапах.
