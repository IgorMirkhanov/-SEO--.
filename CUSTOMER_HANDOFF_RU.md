# MarPla SEO Product Description Generator - Финальная передача заказчику

## 1) Что это за проект

Готовый MVP-сервис генерации SEO-описаний товаров:
- backend: `NestJS` (валидация, API, стриминг SSE, обработка ошибок);
- frontend: `React + Vite` (форма ввода и отображение потокового ответа);
- интеграция с Flowise предусмотрена;
- есть demo-режим без внешних ключей.

Логотип компании MarPla добавлен в UI.

## 2) Что уже реализовано

- `POST /api/generate-seo` - синхронная генерация SEO JSON.
- `POST /api/generate-seo/stream` - потоковый SSE-ответ (`seo-token`, `seo-done`).
- DTO-валидация входных данных:
  - `product_name`
  - `category`
  - `keywords`
- Защита от проблем LLM/интеграции:
  - timeout запроса;
  - проверка структуры JSON (schema validation);
  - fallback-логика при ошибке/пустом/битом ответе.
- GitHub Actions CI:
  - установка зависимостей;
  - сборка backend;
  - сборка frontend.
- Production-like запуск через Docker Compose и Nginx reverse proxy.

## 3) Быстрый запуск для проверки

### Локально (режим разработки)
1. `npm install`
2. Скопировать env:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
3. Запустить:
   - `npm run dev:backend`
   - `npm run dev:frontend`
4. Открыть:
   - `http://localhost:5173`

### Production-like (Docker)
1. `docker compose up --build`
2. Открыть:
   - `http://localhost:8080`

## 4) Как проверять функционал

1. Открыть форму.
2. Ввести:
   - Название товара;
   - Категорию;
   - Ключевые слова (через запятую).
3. Нажать "Сгенерировать SEO".
4. Убедиться, что:
   - появляется потоковый вывод (`seo-token`);
   - формируется итоговая структура:
     - `title`
     - `meta_description`
     - `h1`
     - `description`
     - `bullets`.

## 5) Текущий режим интеграции

По умолчанию включен demo-режим:
- `FLOWISE_MOCK_MODE=true`

Это сделано специально для ТЗ, чтобы проект стабильно работал без реальных API-ключей и сторонних сервисов.

Когда появятся реальные данные Flowise:
1. поставить `FLOWISE_MOCK_MODE=false`;
2. заполнить реальные `FLOWISE_BASE_URL`, `FLOWISE_SEO_FLOW_ID`, `FLOWISE_API_KEY`;
3. перезапустить backend.

## 6) Что передается заказчику

- Исходный код в GitHub репозитории;
- готовые инструкции запуска;
- CI pipeline;
- docker-compose для разворачивания;
- рабочее UI с брендингом MarPla.
