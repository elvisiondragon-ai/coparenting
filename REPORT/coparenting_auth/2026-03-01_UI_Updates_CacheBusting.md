# Gemini Task Report: UI Updates and Cache Busting for CoParenting

**Date:** 2026-03-01
**Topic:** UI Improvements and Currency Update

## Objective
Update the currency symbol to "Rp" throughout the application, improve the visibility of the menu toggle button, and implement a cache-busting mechanism.

## Tasks Completed
1.  **Currency Update:**
    *   Changed the default currency in `coparenting/src/context/AppContext.tsx` from `$` to `Rp`.
    *   Verified that `ChildSupportPage.tsx` and `Dashboard.tsx` correctly use `setup.currency` for display.
2.  **Menu Toggle Improvement:**
    *   Modified `coparenting/src/components/AppLayout.tsx` to style the `SidebarTrigger`.
    *   The trigger now looks like a button with `bg-card` color, a `Menu` icon, and a "Menu" label (visible on larger screens).
3.  **Cache Busting:**
    *   Implemented `APP_VERSION` logic in `coparenting/src/main.tsx`.
    *   Added aggressive cache clearing (Service Workers and Browser Caches) when a version mismatch is detected.
    *   Added platform-specific nuclear reload logic (iOS vs. Android) to ensure users always see the latest version.

## Technical Details
- **Currency:** Set to `Rp` in the initial state of the `AppProvider`.
- **UI:** The menu button now uses `bg-card` and `shadow-sm` for better visibility and a more "button-like" feel.
- **Cache Version:** Initialized at `2026.03.01.01`.

## Files Modified
- `coparenting/src/context/AppContext.tsx`
- `coparenting/src/components/AppLayout.tsx`
- `coparenting/src/main.tsx`

## Verification Status
- [x] Build check successful.
- [x] Currency verified in Child Support and Dashboard.
- [x] Cache-busting logic implemented and verified.
