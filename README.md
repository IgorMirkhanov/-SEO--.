# SEO Product Description Generator

Monorepo with:
- `backend`: NestJS API with Flowise integration and streaming SEO generation.
- `frontend`: React + Vite Telegram Web App (TWA) client.

## Demo-Ready Mode (for technical assignment)

Project includes mock mode and works without real Flowise credentials:
- `FLOWISE_MOCK_MODE=true` in `backend/.env`.
- Backend returns deterministic valid SEO JSON and SSE stream events.
- You can show a full working demo to customer immediately.

## Quick Start

1. Install dependencies:
   - `npm install`
2. Configure env:
   - copy `backend/.env.example` to `backend/.env`
   - copy `frontend/.env.example` to `frontend/.env`
3. Run apps in separate terminals:
   - `npm run dev:backend`
   - `npm run dev:frontend`
4. Open UI:
   - `http://localhost:5173`

## API

- `POST /api/generate-seo` - synchronous JSON response.
- `POST /api/generate-seo/stream` - SSE stream (`seo-token`, `seo-done`, `seo-fallback`).

## Production Docker Stack

- Start production-like stack with reverse proxy:
  - `docker compose up --build`
- App URL:
  - `http://localhost:8080`
- Routing:
  - `/` -> frontend
  - `/api/*` -> backend

## CI

GitHub Actions workflow is included in `.github/workflows/ci.yml`:
- installs dependencies
- builds backend
- builds frontend

## Flowise Production Switch

When real Flowise values are available:
1. set `FLOWISE_MOCK_MODE=false`
2. set valid `FLOWISE_BASE_URL`, `FLOWISE_SEO_FLOW_ID`, `FLOWISE_API_KEY`
3. restart backend

## Demo Script For Customer

1. Open form in browser/TWA webview.
2. Enter product, category, keywords and submit.
3. Show streaming panel (`seo-token`) and final structured JSON result.
4. Explain that API has schema validation and fallback behavior.
