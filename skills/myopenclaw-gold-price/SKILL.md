---
name: myopenclaw-gold-price
description: Add or update the MyOpenClaw app’s live gold price feature (GoldAPI) including the server route, client header display, refresh logic, and env var handling. Use when the user asks to show gold price, change the data source, or adjust how gold price is fetched/displayed.
---

# MyOpenClaw Gold Price

## Overview
Implement a live gold price widget in the app header using GoldAPI, with a server route and client polling.

## Workflow

### 1) Server route (GoldAPI)
- Create/update `app/api/gold/route.ts`.
- Read token from `process.env.GOLDAPI_TOKEN`.
- Call `https://www.goldapi.io/api/XAU/USD` with header `x-access-token`.
- Return JSON: `{ symbol, price, currency, updatedAt }`.
- Handle missing token and non-200 responses with 5xx JSON errors.

### 2) Client header display
- In `app/page.tsx`, fetch `/api/gold` on mount and every 60s.
- Show loading/error states.
- Render the price in the header next to the brand.
- Localize label strings (zh/en) if i18n exists.

### 3) Env docs
- Add `.env.example` with `GOLDAPI_TOKEN=...` (do NOT add real token).
- Ensure `.gitignore` allows `.env.example` and keeps `.env.local` ignored.
- Update `README.md` with env setup steps.

## Reference
See `references/goldapi.md` for endpoint details and response fields.
