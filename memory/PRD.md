# Detail Inspector — Премиум-лендинг для оклейки BMW

## Original Problem Statement (RU)
Создать полноценный одностраничный лендинг для премиум-студии оклейки автомобилей полиуретановой плёнкой под брендом **Detail Inspector**. Целевая аудитория — владельцы автомобилей от 5 млн рублей (BMW). Тёмный, дорогой стиль, премиальные шрифты + золотые переливающиеся акценты. Лендинг включает Hero, Триггеры, Таблицу сравнений, Многошаговый квиз-калькулятор, Карточки команды, Галерею кейсов Reels-формата, Процесс работы, Блок гарантий, FAQ, SEO-текст. Развертывание на VPS (Ubuntu).

## Tech Stack
- **Frontend**: React SPA (CRA) + Tailwind CSS + Framer Motion + shadcn/ui + sonner toasts
- **Backend**: FastAPI + Motor (MongoDB async) + httpx
- **DB**: MongoDB (collections: `leads`, `status_checks`)
- **Deployment**: Selectel VPS (Ubuntu 24.04), Nginx + Gunicorn + Systemd

## Key Files
```
/app/
├── backend/
│   ├── server.py              # FastAPI + Telegram notifications + pricing engine
│   ├── requirements.txt
│   └── .env                   # MONGO_URL, DB_NAME, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
├── frontend/
│   ├── public/
│   │   ├── logo.png
│   │   ├── favicon.ico, favicon-*.png, apple-touch-icon.png, android-chrome-*.png
│   │   ├── site.webmanifest
│   │   ├── reels/             # ← User uploads videos here: 1.mp4, 2.mp4, ...
│   │   └── hero/1.webp, hero/2.webp
│   └── src/
│       ├── App.css, index.css # Gold gradient animations (goldShimmer, btn-gold, etc.)
│       ├── lib/data.js, lib/api.js, lib/leadContext.js
│       └── components/landing/
│           ├── Header.js, Hero.js, Triggers.js, Comparison.js,
│           ├── Calculator.js (client-side pricing, no network failures),
│           ├── Team.js, Cases.js, ReelsGallery.js (video-aware),
│           ├── Process.js, Guarantee.js, FAQSection.js, Footer.js,
│           ├── LeadDialog.js, ExitIntent.js, MobileCTA.js
```

## Key API endpoints
- `GET /api/health` → `{status, ts, telegram_configured}`
- `POST /api/calculate` → returns `{estimated_price, price_label, gift, summary}`
- `POST /api/leads` → saves lead + fires Telegram notification in background
- `GET /api/leads?limit=N` → list of leads
- `POST /api/telegram/test` → sends a test message to Telegram

## DB Schema
- `leads`: `{id, name, phone, bmw_model, task, condition, source, note, estimated_price, extra, created_at}`

## 3rd Party Integrations
- **Telegram Bot API** (sendMessage via httpx) — fire-and-forget background task
  - Token & chat ID in `/app/backend/.env`
  - HTML-formatted message with full quiz data, source, price

## Completed (Feb 2026 — session 2)
- ✅ Full landing UI (all sections, gold gradient accents)
- ✅ Pricing engine (deterministic, mirrored client+server)
- ✅ Lead form with multi-step flow
- ✅ Manual VPS deployment instructions for user (Selectel)
- ✅ **Comparison block**: gold "протокол безопасности" header text, button centered on mobile (`w-full max-w-sm md:w-auto`)
- ✅ **Calculator**: smoother step transitions (900ms + 1100ms), bug fix (client-side computation, no network failure path), full quiz data (`extra`) sent to backend
- ✅ **Team block**: compact mobile sizing (smaller paddings, text)
- ✅ **Cases modal**: smaller first photo on mobile (`aspect-[16/10] max-h-[32vh]`), gold CTA button confirmed
- ✅ **Reels gallery**: now supports actual videos at `/public/reels/<id>.mp4` with hover-play preview + lightbox player; falls back to "Видео скоро" badge if file is missing
- ✅ **Footer map**: Yandex Maps iframe with explicit pin at "Москва, 1-й Дорожный проезд, 5А, 117545", click-through link to full map
- ✅ **Telegram integration**: Each lead form submission (Hero, LeadDialog, Calculator, Cases, Team, Reels, Comparison) sends a formatted HTML notification with all collected data (name, phone, BMW model, quiz answers, source, price) to the configured chat
- ✅ **Favicons**: Full set generated from logo (16/32/48 .ico+png, 180 apple-touch, 192/512 android-chrome) + site.webmanifest
- ✅ **Logo size**: reduced in header (`h-5 md:h-6`, was `h-7 md:h-9`)

## Pending / Backlog
- P1 — Replace stub URLs (`#`) for Политика конфиденциальности / Договор оферты / Реквизиты
- P1 — User to upload actual videos to `/public/reels/1.mp4` … `10.mp4` (folder created, autodetection ready)
- P2 — CallTouch coltracking integration on phone numbers + "Заказать звонок" buttons (user mentioned)
- P3 — Optional: restore Nginx gzip/cache-control blocks on VPS
- P3 — PRD originally requested Next.js SSR; currently using CRA SPA (no user complaint)

## Credentials & Config
- `TELEGRAM_BOT_TOKEN`: stored in `/app/backend/.env`
- `TELEGRAM_CHAT_ID`: `7505435012` (single recipient)
- VPS: Selectel Ubuntu 24.04, Nginx + Gunicorn + systemd (user-managed)

## Health Check
- ✅ Backend: `/api/health` → 200, `telegram_configured: true`
- ✅ Telegram test message delivered (verified via `/api/telegram/test`)
- ✅ End-to-end lead form (curl) → 200, message in Telegram
- ✅ Calculator quiz: client-side computation, no network errors
- ✅ Mobile responsiveness verified via Playwright (390x844)
