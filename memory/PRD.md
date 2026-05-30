# Detail Inspector — BMW Landing PRD

## Original Problem Statement
Premium dark single-page landing for BMW PPF wrapping studio "Detail Inspector" targeting BMW owners (cars 5M+ RUB, avg ticket 350k RUB). Russian language. Strict palette: #050505 bg, #0d0d0d blocks, #151515 cards, #ffffff text, #9a9a9a muted. No blue/red/gold. Premium feel à la Porsche/BMW Individual/Apple. Framer Motion animations. SEO landing with structured data.

## Stack
- React + FastAPI + MongoDB (Emergent platform)
- Framer Motion for animations
- Tailwind + shadcn/ui (Dialog, Accordion, Input)
- Manrope (display) + Inter (body) + JetBrains Mono (mono)

## User Personas
- **BMW owner (5–25M ₽ car)**: technical, premium-oriented, values documents/process over marketing fluff
- **Returning client / referral**: needs proof (cases, team credentials, guarantee)

## Core Requirements (static)
- 17+ section landing covering hero, triggers, comparison, quiz calculator, team, cases, process timeline, control, guarantee with A4 documents, BMW marquee, reels gallery, FAQ, SEO text, footer
- Leads saved to MongoDB; Telegram integration deferred
- Multi-step quiz with priced result (deterministic pricing engine)
- Exit-intent + mobile FAB + floating TG calc widget
- SEO: title/meta/OG/Twitter/canonical + 3 JSON-LD blocks (LocalBusiness/AutoRepair/Service) + sitemap.xml + robots.txt
- All interactive elements have data-testid

## Implemented (Dec 2025)
- Backend: `/api/health`, `/api/calculate` (model × task × condition pricing), `/api/leads` (POST/GET) — all tested 100%
- Frontend: 18 landing components in `/app/frontend/src/components/landing/`
- Pages: `BMWLanding.js` (routes `/` and `/bmw`)
- LeadProvider context — opens shared LeadDialog from anywhere with source tracking
- Pricing engine maps in server.py (MODEL_BASE, TASK_MULT, CONDITION_ADJ)
- Dialog a11y (sr-only DialogTitle/Description)

## P0 Backlog (deferred)
- Telegram bot integration for instant lead notifications (Bot Token + Chat ID needed from user)
- Real photos/videos from studio (currently stock Unsplash/Pexels)
- Real Yandex/2GIS reviews API integration

## P1 Backlog
- Admin panel to view leads
- Persist UTM parameters in leads
- Real darkmode Yandex/Google map embed (currently SVG stylized)
- Server-side rendering (Next.js migration if SEO requires it)

## P2 Backlog
- Multi-brand templating (Porsche, Mercedes pages)
- A/B testing for CTA copy
- Real Reels video assets

## Tested
- Backend: 10/10 (health, calculate, leads CRUD, validation)
- Frontend: 9/9 (hero, header CTA, lead dialog, calculator quiz, team tabs, case modal, doc modal navigation, FAQ accordion, final CTA submit)
