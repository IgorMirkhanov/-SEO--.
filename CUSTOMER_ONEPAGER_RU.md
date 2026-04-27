# MarPla - SEO Product Description Generator

## 1. Цель проекта

Создать сервис генерации SEO-описаний товаров для e-commerce с потоковой выдачей результата и надежной backend-валидацией.

## 2. Архитектура

- **Frontend:** React + Vite + Telegram Web App SDK
- **Backend:** NestJS
- **AI-провайдер:** Flowise (Prediction API), поддержан mock-режим для стабильного демо
- **Интеграция:** SSE-стриминг (`/api/generate-seo/stream`)

## 3. Основной функционал

- Форма ввода:
  - `product_name`
  - `category`
  - `keywords`
- Генерация SEO-структуры:
  - `title`
  - `meta_description`
  - `h1`
  - `description`
  - `bullets[]`
- Потоковое отображение ответа в UI
- Валидация DTO и JSON schema
- Graceful fallback при ошибках AI/интеграции

## 4. Endpoints

- `POST /api/generate-seo` — синхронный ответ JSON
- `POST /api/generate-seo/stream` — SSE-события:
  - `seo-token`
  - `seo-done`
  - `seo-fallback`

## 5. Надежность и качество

- Timeout для внешнего AI-запроса
- Проверка формата результата
- Защита от пустых/поврежденных ответов
- Логирование ключевых этапов
- CI workflow (сборка backend/frontend)
- Production-like деплой через Docker Compose + Nginx reverse proxy

## 6. Запуск для проверки

### Локально
1. `npm install`
2. `backend/.env.example -> backend/.env`
3. `frontend/.env.example -> frontend/.env`
4. `npm run dev:backend`
5. `npm run dev:frontend`
6. UI: `http://localhost:5173`

### Docker
1. `docker compose up --build`
2. UI/API: `http://localhost:8080`

## 7. Текущий режим для ТЗ

Проект сдан в demo-ready формате:
- `FLOWISE_MOCK_MODE=true`
- сервис стабильно работает без реальных ключей
- заказчик может проверить функционал сразу после запуска

## 8. Брендинг

- В интерфейс добавлен логотип MarPla
- UI подготовлен как клиентская демо-версия

## 9. Готовность

Проект готов к передаче заказчику для самостоятельной проверки:
- код в GitHub
- инструкции запуска
- CI
- docker-развертывание
- документация для handoff
