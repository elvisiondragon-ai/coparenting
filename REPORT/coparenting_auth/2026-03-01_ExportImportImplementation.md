# Gemini Task Report: Backup & Restore (Export/Import) for CoParenting

**Date:** 2026-03-01
**Topic:** Data Persistence and Portability

## Objective
Provide users with the ability to manually backup their shared data (JSON format) and restore it later or on another account.

## Tasks Completed
1.  **Context API Update:**
    *   Added `restoreData` to `AppContext.tsx`.
    *   This function allows overwriting the current state with external data and immediately syncing it to Supabase and LocalStorage.
2.  **Export Functionality:**
    *   Implemented `handleExport` in `SetupPage.tsx`.
    *   It bundles all relevant state (setup, schedule, expenses, tasks, notes, child support) into a structured JSON file.
    *   Automatically triggers a browser download with a timestamped filename (e.g., `coparenting-backup-2026-03-01.json`).
3.  **Import Functionality:**
    *   Implemented `handleImport` in `SetupPage.tsx` using a hidden file input.
    *   Includes basic validation to ensure the uploaded file matches the expected application state format.
    *   Restores the data and refreshes the current form state to reflect the imported settings.
4.  **UI Integration:**
    *   Added a "Backup & Restore" section at the bottom of the Setup page.
    *   Used `Download` and `Upload` icons from `lucide-react` for clarity.

## Technical Details
- **Sync Integration:** Importing data correctly triggers the Supabase `UPDATE` call, meaning the restored backup will immediately sync to the other parent's device via the Realtime channel.
- **Data Safety:** The import process includes a `try-catch` block to prevent application crashes from malformed JSON files.

## Files Modified
- `coparenting/src/context/AppContext.tsx`
- `coparenting/src/pages/SetupPage.tsx`

## Verification Status
- [x] Build check successful.
- [x] Export logic verified (JSON generation).
- [x] Import logic verified (State hydration + DB sync).
