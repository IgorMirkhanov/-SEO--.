# SEO Product Description Generator

Monorepo with:
- `backend`: NestJS API with Flowise integration and streaming SEO generation.
- `frontend`: React + Vite Telegram Web App (TWA) client.

## Quick Start

1. Install dependencies:
   - `npm install`
2. Configure env:
   - copy `backend/.env.example` to `backend/.env`
3. Run apps in separate terminals:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## API

- `POST /api/generate-seo` - synchronous JSON response.
- `POST /api/generate-seo/stream` - SSE stream (`seo-token`, `seo-done`, `seo-fallback`).

## Docker (backend)

- Build image:
  - `docker build -f backend/Dockerfile -t seo-backend .`
- Run container:
  - `docker run --env-file backend/.env -p 3000:3000 seo-backend`
