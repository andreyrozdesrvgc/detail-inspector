# Detail Inspector — Премиум-лендинг для оклейки BMW

## Original Problem Statement (RU)
Создать полноценный одностраничный лендинг для премиум-студии оклейки BMW (5М+ ₽). Тёмный, дорогой стиль + золотые акценты. Hero, Триггеры, Сравнение, Квиз-калькулятор, Команда, Кейсы, Reels, Процесс, Гарантии, FAQ, SEO. Развёртывание на Selectel VPS Ubuntu 24.04.

## Tech Stack
- **Frontend**: React SPA (CRA) + Tailwind + Framer Motion + shadcn/ui + sonner
- **Backend**: FastAPI + Motor (Mongo async) + httpx + APScheduler
- **DB**: MongoDB (`leads`, `status_checks`)
- **Integrations**: Telegram Bot API, Yandex Metrika (counter + API)
- **Deploy**: Selectel VPS, Nginx + Gunicorn + systemd

## Key Files
```
/app/
├── backend/
│   ├── server.py              # FastAPI + Telegram + APScheduler hooks
│   ├── digest.py              # Daily Telegram digest + Yandex Metrika client
│   ├── requirements.txt
│   └── .env                   # MONGO_URL, DB_NAME, TELEGRAM_*, YANDEX_METRIKA_*
├── frontend/
│   ├── public/
│   │   ├── logo.png, favicon.ico + full set, site.webmanifest
│   │   ├── reels/             # User uploads videos: 1.mp4...10.mp4
│   │   ├── hero/1.webp, 2.webp
│   │   └── index.html         # Yandex Metrika counter embedded
│   └── src/
│       ├── App.js             # captureUtm() on mount
│       ├── lib/
│       │   ├── api.js         # buildLeadExtra merges UTM into every lead
│       │   ├── utm.js         # UTM capture + persistence + source aliasing
│       │   ├── data.js, leadContext.js
│       └── components/landing/  # 16+ section components
```

## Key API Endpoints
- `GET /api/health` → `{status, ts, telegram_configured}`
- `POST /api/calculate` → `{estimated_price, price_label, gift, summary}`
- `POST /api/leads` → save + Telegram notify in background, returns `Lead`
- `GET /api/leads?limit=N`
- `POST /api/telegram/test` → single test message
- `POST /api/digest/send-now` → manual daily digest trigger (for testing)

## Scheduler
- **AsyncIOScheduler** (APScheduler) inside FastAPI
- Cron: every day at **00:00 Europe/Moscow**
- Job: `build_and_send_daily_digest(db)` from `digest.py`

## Daily Digest Contents (HTML to Telegram)
1. Total leads today (MSK calendar day)
2. Average estimated price
3. Source breakdown (UTM, with progress-bars) — `ВК Реклама`, `Авито`, `Яндекс Директ`, `Прямой заход`, etc.
4. On-site section breakdown (Hero, Калькулятор, Кейсы, Команда, Reels…)
5. Top BMW models requested
6. **Yandex.Metrika** (visits, users, pageviews, bounce, avg duration, conversion %)
7. Top Metrika traffic sources

## UTM Flow
1. URL like `/?utm_source=vk_ads&utm_campaign=winter` → `captureUtm()` in `App.js` parses & persists to `localStorage.di_utm_v1`
2. Returning visits keep the original source until a fresh utm appears
3. Every `submitLead()` calls `buildLeadExtra()` which merges UTM keys into `extra`
4. Backend stores `extra` in Mongo and shows in instant Telegram notification + daily digest

## Yandex Metrika
- **Counter ID**: 109538562 (embedded in `index.html`)
- **API token**: stored in `.env` as `YANDEX_METRIKA_OAUTH_TOKEN`
- Current token `274b246a5b3248dc870a018ff8e42138` is **INVALID** — user needs to redo OAuth flow with proper authorize URL and provide a real `y0_AgAAAA...` token

## Recent Session Completed
- ✅ Yandex Metrika counter installed (auto-tracks pageviews/clicks/webvisor)
- ✅ UTM tracking lib (frontend) — `vk_ads → ВК Реклама`, `direct → Яндекс Директ`, etc.
- ✅ Daily digest scheduler at 00:00 MSK, beautifully formatted in Telegram
- ✅ Manual digest endpoint `POST /api/digest/send-now` for testing
- ✅ Yandex Metrika API client (gracefully degrades if token invalid/missing)
- ✅ Dark map in footer (CSS invert + hue-rotate filter, looks premium)
- ✅ `apscheduler` + `pytz` + `tzlocal` added to requirements.txt
- ✅ Removed `emergentintegrations` from requirements.txt (was blocking VPS deploy)

## Known Issues / Pending
- 🟡 **Yandex Metrika token is invalid** — user copied app secret instead of OAuth token. Awaiting correct token via `https://oauth.yandex.ru/authorize?response_type=token&client_id=<ClientID>` flow.
- 🟡 **VPS .env** — user needs to add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `YANDEX_METRIKA_OAUTH_TOKEN`, `YANDEX_METRIKA_COUNTER_ID`, `DAILY_DIGEST_ENABLED=true` to backend .env on VPS.
- 🟡 Stub URLs `#` in Footer for Политика/Оферта/Реквизиты.
- 🟡 Reels videos folder is empty — user to upload `/public/reels/1.mp4`..`10.mp4`.

## Future / Backlog
- CallTouch coltracking integration
- Replace placeholder PDF URLs in Footer
- (Optional) Next.js SSR migration for SEO

## Credentials
- See `/app/memory/test_credentials.md` for sensitive values (Telegram bot token, Metrika)
