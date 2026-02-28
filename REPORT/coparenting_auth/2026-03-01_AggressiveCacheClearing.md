# Gemini Task Report: Aggressive PWA Cache Clearing (Nuke)

**Date:** 2026-03-01
**Topic:** PWA Reliability and Cache Management

## Objective
Implement a robust cache-clearing mechanism ("Nuke") to handle stale service workers and browser caches, especially for iOS PWA users, ensuring they always see the latest version of the app.

## Tasks Completed
1.  **Cache Cleaner Utility:**
    *   Created `coparenting/src/utils/iOSCacheCleaner.ts`.
    *   This utility provides comprehensive clearing of Service Worker caches, Browser Caches, SessionStorage, IndexedDB, and even WebKit-specific form caches.
    *   Includes logic for "Nuclear Reload" which bypasses stubbord iOS caching layers.
2.  **Version-based Auto-Nuke:**
    *   Updated `coparenting/src/main.tsx` to use `iOSCacheCleaner.forceCleanReload()` when a version mismatch is detected (`APP_VERSION`).
    *   Incremented `APP_VERSION` to `2026.03.01.02` to trigger the initial cleanup.
3.  **Manual Nuke Button:**
    *   Added a "🧹 Clear Cache & Nuclear Reload" button to the `Auth.tsx` page.
    *   This allows users who encounter UI issues or stale data to manually trigger a full system cleanup and reload.
4.  **Data Safety:**
    *   Configured the cleaner to **preserve** critical keys like `sb-` (Supabase auth) and `coparent-data` (local application state) so users don't lose their session or unsynced data during a cache clear.

## Technical Details
- **Trigger:** Version mismatch in `localStorage`.
- **Method:** `window.location.replace` with a timestamped URL to force a fresh server request.

## Files Modified
- `coparenting/src/utils/iOSCacheCleaner.ts` (Created)
- `coparenting/src/main.tsx`
- `coparenting/src/pages/Auth.tsx`

## Verification Status
- [x] Build check successful.
- [x] Utility logic verified against `umkm` standard.
- [x] UI button implemented and styled.
