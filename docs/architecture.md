# Architecture — RCS Reader On WEB (Enhanced)

> Replaces: realcodescan.leontec.jp  
> Stack: Next.js 15 (App Router) · TypeScript · Prisma (SQLite) · Tailwind CSS · Zod  
> Date: 2026-04-20

---

## 1. Business Requirements (from /requirements)

| # | Requirement |
|---|-------------|
| R1 | Real-time camera barcode / QR code scanning in the browser |
| R2 | Better scan accuracy than the reference site (multi-engine approach) |
| R3 | Continuous-scan mode with configurable wait interval |
| R4 | Display decoded barcode type (QR_CODE, EAN-13, GS1-128, DataMatrix, etc.) |
| R5 | Parse & display GS1 Application Identifiers (AI Code / AI値 / 備考) |
| R6 | Zoom control on the camera feed |
| R7 | Camera selector (switch between front/rear) |
| R8 | Persist scan history to SQLite via Prisma |
| R9 | Leontec branding, Japanese UI labels |

---

## 2. Barcode Scanning Strategy (multi-engine)

To exceed the accuracy of the reference site the app uses **three scanning engines in priority order**:

```
┌──────────────────────────────────────────────────────────┐
│  1. Web BarcodeDetector API  (native, fastest, Chrome/Edge)│
│  2. ZXing-WASM               (cross-browser, all formats)  │
│  3. ZBar-WASM                (fallback, dense/damaged codes)│
└──────────────────────────────────────────────────────────┘
```

- Engines are tried in parallel; first successful decode wins.  
- The orchestrator caches the last winning engine and tries it first next frame.  
- Frame processing: `requestAnimationFrame` → `canvas.drawImage(video)` → engine pipeline.

**Libraries**
```
@zxing/library          – ZXing JS/WASM port
zbar-wasm               – ZBar compiled to WASM (excellent on GS1-128)
barcode-detector        – BarcodeDetector polyfill for Firefox/Safari
```

---

## 3. Prisma Schema (SQLite)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")   // file:./dev.db
}

generator client {
  provider = "prisma-client-js"
}

model Scan {
  id          String   @id @default(cuid())
  rawValue    String
  barcodeType String                    // QR_CODE | EAN_13 | CODE_128 | …
  aiData      String?                   // JSON string of parsed GS1 AIs
  sessionTag  String?                   // optional grouping label
  engine      String                    // which engine decoded it
  createdAt   DateTime @default(now())
}

model AppSetting {
  id              String  @id @default("singleton")
  continuousScan  Boolean @default(false)
  waitIntervalMs  Int     @default(0)
  cameraDeviceId  String? @default(null)
  zoomLevel       Float   @default(1.0)
  updatedAt       DateTime @updatedAt
}
```

---

## 4. API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/scans` | Paginated scan history (`?page&limit&type`) |
| `POST` | `/api/scans` | Save a new scan result |
| `DELETE` | `/api/scans/[id]` | Delete single scan record |
| `DELETE` | `/api/scans` | Clear all scan history |
| `GET` | `/api/settings` | Read AppSetting |
| `PUT` | `/api/settings` | Update AppSetting |
| `GET` | `/api/cameras` | List available MediaDevices (server hint only) |

All routes use **Zod** for request validation and return `{ data, error }` envelope.

---

## 5. Component Tree

```
app/
├── layout.tsx                  RootLayout (font, metadata, Leontec brand)
├── page.tsx                    ScannerPage (main view, SSR → hydrate)
└── history/
    └── page.tsx                HistoryPage (scan log table)

src/components/
├── scanner/
│   ├── ScannerContainer.tsx    "use client" – orchestrates all scanner state
│   ├── VideoFeed.tsx           <video> element + canvas overlay
│   ├── ScannerOverlay.tsx      corner-bracket viewfinder SVG
│   ├── ZoomControl.tsx         − / % / + buttons, uses ImageCapture API zoom
│   ├── ScannerControls.tsx     Start/Stop · 連続読取 checkbox · 待機 select
│   ├── ScanResult.tsx          displays last decoded value + barcode type badge
│   └── AITable.tsx             renders parsed GS1 AI rows (AI Code | AI値 | 備考)
├── settings/
│   └── SettingsPanel.tsx       camera device selector, drawer/modal
├── history/
│   ├── ScanHistoryTable.tsx    paginated table of past scans
│   └── ScanRow.tsx             single row with expand for AI data
└── ui/
    ├── Button.tsx
    ├── Checkbox.tsx
    ├── Select.tsx
    └── Badge.tsx               barcode type pill

src/lib/
├── scanner/
│   ├── engines/
│   │   ├── barcodeDetector.ts  Web BarcodeDetector API wrapper
│   │   ├── zxing.ts            ZXing-WASM engine wrapper
│   │   └── zbarWasm.ts         ZBar-WASM engine wrapper
│   ├── orchestrator.ts         Multi-engine manager, frame loop
│   └── gs1Parser.ts            GS1 Application Identifier decoder
├── db/
│   └── prisma.ts               Prisma singleton (global cache in dev)
├── actions/
│   ├── scanActions.ts          Server Actions: saveScan, deleteScan, clearHistory
│   └── settingsActions.ts      Server Actions: getSettings, updateSettings
└── validations/
    ├── scanSchema.ts           Zod schemas for scan API
    └── settingsSchema.ts       Zod schemas for settings API
```

---

## 6. GS1 AI Parser Logic

`gs1Parser.ts` maps raw GS1 barcode strings to structured AI rows:

```ts
interface AIRow {
  aiCode:  string   // e.g. "01", "17", "10"
  value:   string   // e.g. "00614141123452"
  label:   string   // 備考 — human label e.g. "GTIN", "Use By Date", "Lot"
}
```

Supports AIs: 00, 01, 02, 10, 11, 13, 15, 17, 20, 21, 22, 30, 310x–369x, 37, 400, 401, 410–416, 420, 421, 8001–8010, 90, 91–99.

---

## 7. Key Pages & UX Flow

### Main Scanner Page (`/`)
```
┌─────────────────────────────────────────────┐
│  RCS Reader On WEB              [ⓘ] [⚙]     │
├─────────────────────────────────────────────┤
│                                             │
│   ┌───── camera feed ─────┐                 │
│   │  ╔═══════════════╗    │                 │
│   │  ║  viewfinder   ║    │                 │
│   │  ╚═══════════════╝    │                 │
│   │   [−] 0% [+]          │                 │
│   └──────────────────────┘                 │
├─────────────────────────────────────────────┤
│  □ 連続読取   待機: [0s ▾]      [  Start  ]  │
├─────────────────────────────────────────────┤
│  QR_CODE                                    │
│  http://example.com                         │
├──────────┬─────────────────┬────────────────┤
│ AI Code  │ AI値            │ 備考           │
│          │                 │                │
└──────────┴─────────────────┴────────────────┘
```

### History Page (`/history`)
- Searchable / filterable table  
- Export to CSV  
- Delete individual or bulk records  

---

## 8. Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_NAME="RCS Reader On WEB"
NEXT_PUBLIC_COMPANY="Leontec co., LTD"
```

---

## 9. Package Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "@prisma/client": "^6.0.0",
    "zod": "^3.23.0",
    "@zxing/library": "^0.21.0",
    "zbar-wasm": "^0.10.0",
    "barcode-detector": "^2.3.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0"
  }
}
```

---

## 10. Non-Functional Requirements

| Concern | Decision |
|---------|----------|
| Performance | Frame skip: process every 3rd frame in single-scan mode; every frame in continuous mode |
| Mobile | PWA-ready, `viewport` meta, touch-friendly controls |
| Security | Camera access only via HTTPS; no data sent to external servers |
| i18n | Japanese labels hardcoded for v1; i18n library considered for v2 |
| Offline | Service Worker caches WASM assets; scanning works offline |
