# Test Report — RCS Reader On WEB (Enhanced)

**Date**: 2026-04-20  
**Tester**: QA Automation (Claude Sonnet 4.6)  
**Attempts**: 2 (found 2 bugs on attempt 1, fixed and verified on attempt 2)  
**Final Status**: VERIFIED ✅

---

## Validation Methods

No test framework was configured. Validation was performed via:

| Tool | Command | Result |
|------|---------|--------|
| TypeScript strict check | `npx tsc --noEmit` | ✅ PASS — 0 errors |
| ESLint | `npm run lint` | ✅ PASS — 0 warnings, 0 errors |
| Next.js production build | `npm run build` | ✅ PASS — compiled successfully |
| Static code review | Manual audit of all src files | ✅ PASS (after fixes) |

---

## Requirements Coverage

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| R1 | Real-time camera barcode/QR scanning | ✅ Met | `ScanOrchestrator` + `VideoFeed` + `requestAnimationFrame` loop |
| R2 | Better accuracy — multi-engine approach | ✅ Met | BarcodeDetector → ZXing → ZBar, last-winner cache |
| R3 | Continuous-scan mode + wait interval | ✅ Met | `continuousScan` flag + `waitIntervalMs` in orchestrator |
| R4 | Display decoded barcode type | ✅ Met | `ScanResult` + `Badge` component shows type pill |
| R5 | Parse & display GS1 AI table | ✅ Met* | Fixed `isGS1Barcode` bug (see BUG-01 below) |
| R6 | Zoom control on camera feed | ✅ Met | `ZoomControl` + `ImageCapture` API with graceful fallback |
| R7 | Camera selector (front/rear) | ✅ Met | `SettingsPanel` + `/api/cameras` |
| R8 | Persist scan history to SQLite | ✅ Met | Prisma `Scan` model, `saveScan` server action, `/api/scans` |
| R9 | Leontec branding, Japanese UI labels | ✅ Met | Layout metadata, Japanese text in controls/results |

---

## Bugs Found & Fixed

### BUG-01 — CRITICAL: `isGS1Barcode()` always returns `false`

**File**: `src/lib/scanner/gs1Parser.ts` (line 136)  
**Impact**: GS1 AI parsing never triggered → AI table always empty (R5 broken)

**Root Cause**: `t.replace("_", "")` stripped underscores from the comparison list items but not from `type.toUpperCase()`, so `"QR_CODE".includes("QRCODE")` is always `false`.

**Fix**:
```ts
// Before (broken):
return ["GS1_128", "CODE_128", ...].some(
  (t) => type.toUpperCase().includes(t.replace("_", ""))
);

// After (fixed):
const normalized = type.toUpperCase().replace(/_/g, "");
return ["GS1128", "CODE128", "DATAMATRIX", "QRCODE", "GS1DATABAR"].some(
  (t) => normalized.includes(t)
);
```

---

### BUG-02 — MEDIUM: `deleteScan()` unhandled Prisma exception

**File**: `src/lib/actions/scanActions.ts` (line 17)  
**Impact**: Deleting a non-existent or already-deleted scan throws an uncaught Prisma P2025 error, crashing the server action.

**Fix**: Wrapped `prisma.scan.delete()` in try/catch; returns `{ error: "Record not found" }` gracefully.

---

### NOTE: Double `parseGS1()` call (refactored)

**File**: `src/components/scanner/ScannerContainer.tsx` (lines 46–57)  
**Impact**: Minor inefficiency — `parseGS1()` was called twice per result (once for state, once for `aiData` serialization).  
**Fix**: Single call stored in `gs1Rows`, used for both `setAiRows` and `JSON.stringify`.

---

## Build Output Summary

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    7.96 kB         110 kB
├ ○ /_not-found                            995 B         103 kB
├ ƒ /api/cameras                           133 B         102 kB
├ ƒ /api/scans                             133 B         102 kB
├ ƒ /api/scans/[id]                        133 B         102 kB
├ ƒ /api/settings                          133 B         102 kB
└ ƒ /history                             3.68 kB         109 kB
+ First Load JS shared by all             102 kB
```

All 7 routes compiled and generated. No warnings.

---

## Code Quality Observations

| Area | Assessment |
|------|------------|
| Type safety | Strict mode, no `any` usage found |
| Zod validation | All API routes and Server Actions validate inputs |
| Error handling | API routes return `{ data, error }` envelope consistently |
| Performance | Frame skipping (every 3rd frame in single-scan mode) implemented |
| Engine caching | Last-winning engine prioritized in next frame — reduces decode time |
| GS1 coverage | 40+ Application Identifiers including 310x–369x weight/measure range |
| Security | No external data transmission; camera access gated to HTTPS |
