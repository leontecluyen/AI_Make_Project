# RCS Reader On WEB

> A production-ready, multi-engine barcode and QR code scanner built for **Leontec co., LTD** — featuring real-time camera scanning, GS1 Application Identifier parsing, persistent scan history, and a Japanese-first UI.

**Live URL**: https://ai-make-project-peach.vercel.app  
**Repository**: https://github.com/leontecluyen/AI_Make_Project

---

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Real-time camera barcode/QR scanning in browser | Done |
| 2 | Multi-engine scanning (BarcodeDetector → ZXing-WASM → ZBar-WASM) | Done |
| 3 | Continuous-scan mode with configurable wait interval | Done |
| 4 | Barcode type display (QR_CODE, EAN-13, GS1-128, DataMatrix, etc.) | Done |
| 5 | GS1 Application Identifier parsing (AI Code / AI値 / 備考, 40+ AIs) | Done |
| 6 | Zoom control on camera feed | Done |
| 7 | Camera selector (front / rear switching) | Done |
| 8 | Persistent scan history via SQLite + Prisma | Done |
| 9 | Leontec branding and Japanese UI labels | Done |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (Strict Mode) |
| Database | SQLite via Prisma ORM 6.0 |
| Styling | Tailwind CSS 3.4 |
| Validation | Zod 3.23 |
| Scanning Engines | BarcodeDetector API · ZXing-WASM · ZBar-WASM |
| Icons | Lucide React |
| Deployment | Vercel (Region: iad1) |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/leontecluyen/AI_Make_Project.git
cd AI_Make_Project

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env if needed — defaults work for local development

# 4. Initialize the database
npx prisma generate
npx prisma db push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_NAME="RCS Reader On WEB"
NEXT_PUBLIC_COMPANY="Leontec co., LTD"
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm start` | Start production server |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Sync schema to database |
| `npx prisma studio` | Open database GUI |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # ScannerPage (main scanner UI)
│   ├── history/page.tsx      # HistoryPage (scan log)
│   └── api/
│       ├── scans/            # GET, POST, DELETE scan records
│       ├── settings/         # GET, PUT AppSetting
│       └── cameras/          # GET available MediaDevices
├── components/
│   ├── scanner/              # VideoFeed, ScannerOverlay, ZoomControl, etc.
│   └── history/              # ScanHistoryTable, ScanRow
└── lib/
    ├── scanner/
    │   ├── orchestrator.ts   # Multi-engine manager & frame loop
    │   ├── gs1Parser.ts      # GS1 AI decoder (40+ identifiers)
    │   └── engines/          # BarcodeDetector, ZXing, ZBar wrappers
    ├── actions/              # Server Actions for scans & settings
    ├── validations/          # Zod schemas
    └── db/prisma.ts          # Prisma singleton client
```

---

## Scanning Architecture

Three engines are tried in priority order; the first successful decode wins:

1. **BarcodeDetector API** — Native browser API, fastest (Chrome/Edge)
2. **ZXing-WASM** — Cross-browser, broad format support
3. **ZBar-WASM** — Fallback, excellent for dense/damaged GS1-128 codes

The orchestrator caches the last winning engine and tries it first on the next frame for performance. Frame processing skips every 3rd frame in single-scan mode; continuous mode processes every frame.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/scans` | Paginated scan history (`?page&limit&type`) |
| `POST` | `/api/scans` | Save a new scan result |
| `DELETE` | `/api/scans/[id]` | Delete a single scan |
| `DELETE` | `/api/scans` | Clear all scan history |
| `GET` | `/api/settings` | Read app settings |
| `PUT` | `/api/settings` | Update app settings |
| `GET` | `/api/cameras` | List available camera devices |

All routes validate input with **Zod** and return a `{ data, error }` envelope.

---

## Quality Assurance

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| ESLint (`npm run lint`) | 0 warnings |
| Next.js Build | Success (44s) |
| Manual code review | Pass |

---

## Deployment

Deployed on **Vercel** at production URL:  
**https://ai-make-project-peach.vercel.app**

| Property | Value |
|----------|-------|
| Project | ai-make-project |
| Region | iad1 (Washington D.C.) |
| Deployment ID | dpl_7qetJH83QSJeLQhcSAUhKLowwiww |
| Build Time | 44 seconds |

---

## License

Proprietary — Leontec co., LTD. All rights reserved.
