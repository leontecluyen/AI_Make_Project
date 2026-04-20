# Delivery Brief — RCS Reader On WEB

**Date**: 2026-04-20  
**Client**: Leontec co., LTD  
**Delivered by**: luyen@leontec.co.jp  
**Status**: Production — Live

---

## 1. Project Overview

RCS Reader On WEB is a browser-based barcode and QR code scanning application built for Leontec. It enables warehouse and logistics operators to scan barcodes in real time using a device camera, parse GS1 Application Identifiers from supply-chain barcodes, and maintain a searchable scan history — all without installing a native app.

---

## 2. Features Implemented

### Core Scanning
- **Multi-engine barcode detection**: Three scanning engines (BarcodeDetector API, ZXing-WASM, ZBar-WASM) run in priority order. The fastest successful result wins, and the winning engine is cached for the next frame to reduce latency.
- **Continuous-scan mode**: Scanner loops automatically with a configurable wait interval (0 ms – 5000 ms) between captures.
- **Single-scan mode**: Scanner stops after the first successful decode and awaits manual restart.
- **Frame-skip optimization**: Processes every 3rd frame in single-scan mode; every frame in continuous mode.

### Camera Controls
- **Camera selector**: Switch between all available MediaDevices (front / rear / USB cameras).
- **Zoom control**: Adjust zoom level via the ImageCapture API with persistent setting.
- **Real-time viewfinder overlay**: Corner-bracket SVG drawn over the live video feed.

### Barcode Data
- **Barcode type identification**: Displays format name (QR_CODE, EAN-13, GS1-128, CODE-39, DataMatrix, etc.) for every scan.
- **GS1 Application Identifier parser**: Decodes 40+ standardized AIs (GTIN, batch/lot, expiry date, serial number, SSCC, net weight, ship-to location, and more) and renders them in a structured table with Japanese column labels (AI Code / AI値 / 備考).

### Persistence & History
- **Scan history**: Every successful scan is saved to SQLite via Prisma, including raw value, barcode type, detected engine, GS1 AI data (JSON), and timestamp.
- **History page**: Paginated, filterable, searchable table of all past scans with expandable GS1 AI detail rows.
- **Delete controls**: Remove individual scans or clear entire history.

### Settings
- Persistent app settings (camera device, zoom, continuous-scan toggle, wait interval) stored in `AppSetting` singleton record in SQLite.

### Branding & UX
- Leontec co., LTD branding throughout.
- Japanese-first UI labels.
- Mobile-friendly, touch-optimized controls.
- Offline-capable: Service Worker caches WASM engine assets.

---

## 3. Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15 |
| Language | TypeScript (Strict Mode) | 5.x |
| Database | SQLite via Prisma ORM | Prisma 6.0 |
| Styling | Tailwind CSS | 3.4 |
| Validation | Zod | 3.23 |
| Scanning Engine 1 | Web BarcodeDetector API | Native |
| Scanning Engine 2 | ZXing-WASM | Latest |
| Scanning Engine 3 | ZBar-WASM | Latest |
| Icons | Lucide React | Latest |
| Deployment | Vercel | — |

**Architecture pattern**: Next.js App Router with Server Components, Server Actions for data mutations, and `"use client"` only where browser APIs are required (camera, canvas, WASM).

---

## 4. Project URL & Access

| Environment | URL |
|-------------|-----|
| **Production** | https://ai-make-project-peach.vercel.app |
| **Repository** | https://github.com/leontecluyen/AI_Make_Project |

---

## 5. Local Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Steps

```bash
# Clone
git clone https://github.com/leontecluyen/AI_Make_Project.git
cd AI_Make_Project

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Default values work for local development — no changes needed

# Initialize database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Visit **http://localhost:3000** — allow camera access when prompted.

### Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_NAME="RCS Reader On WEB"
NEXT_PUBLIC_COMPANY="Leontec co., LTD"
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npx prisma studio` | Open visual database browser |
| `npx prisma db push` | Apply schema changes to DB |

---

## 6. Quality & Verification

All 9 business requirements implemented and verified on 2026-04-20:

| Check | Result |
|-------|--------|
| TypeScript strict compile | 0 errors |
| ESLint | 0 warnings / 0 errors |
| Next.js production build | Success (44 s) |
| Manual feature review | Pass |
| Deployment to Vercel | Live |

**Bugs resolved during QA**:
- BUG-01 (Critical): `isGS1Barcode()` always returned `false` due to string comparison mismatch — fixed.
- BUG-02 (Medium): `deleteScan()` threw unhandled Prisma P2025 exception — wrapped in try/catch.
- BUG-03 (Minor): Eliminated redundant double call to `parseGS1()`.

---

## 7. Delivery Log

| Date | Event |
|------|-------|
| 2026-04-20 | Project initialized, architecture defined |
| 2026-04-20 | All 9 features implemented |
| 2026-04-20 | QA complete — 3 bugs found and fixed |
| 2026-04-20 | TypeScript + ESLint + build verification passed |
| 2026-04-20 | Deployed to Vercel production (dpl_7qetJH83QSJeLQhcSAUhKLowwiww) |
| 2026-04-20 | PM review and delivery brief authored |
