# Page-to-Page Loading Experience Implementation Plan

## Goal Description
Currently, all 12 route pages in `src/App.tsx` are `React.lazy`-loaded behind a single top-level `<Suspense>` with a plain text fallback (`Loading…`). This causes two UX issues:
1. Navigating between already-cached routes produces **no visual loading feedback**.
2. Navigating to an uncached workspace route unmounts the entire `src/components/layout/AppLayout.tsx` shell (top nav + sidebar) until the chunk finishes loading.

This plan introduces:
- A **slim top progress bar** (`RouteProgressBar`) fixed at the very top of the viewport that animates smoothly on every route change.
- A **branded `PageLoader`** (QuizClash mark + subtle spinner + localized loading text) used for both full-screen standalone route/auth loads and an inner `<Suspense>` around `<Outlet />` inside `AppLayout` so the top navigation bar and sidebar remain mounted during workspace transitions.

---

## Proposed Changes

### Route Loading Components

#### [NEW] `src/components/common/RouteProgressBar.tsx`
A lightweight, dependency-free top progress bar that listens to `useLocation().pathname`:
- Skips the initial page mount so it only triggers on actual page-to-page navigation.
- On pathname change, immediately starts at `18%`, eases to `82%` on the next animation frame, completes to `100%` shortly after render settles (~220ms), and fades out cleanly (~180ms).
- Respects `@media (prefers-reduced-motion: reduce)`.

#### [NEW] `src/components/common/PageLoader.tsx`
A branded, theme-aware loading indicator with two layout variants:
- `variant="fullscreen"`: Centered in `100vh` (used for top-level standalone routes like Home, Auth, Live Lobby/Leaderboard, and `authLoading`).
- `variant="panel"`: Centered in the workspace main panel (`min-height: 55vh`) while keeping the header and sidebar visible.
- Displays the QuizClash brand mark / animated `Loader2` icon from `lucide-react` and `{label || t('common.loading')}`.

#### [MODIFY] `src/components/common/index.ts`
Export `RouteProgressBar` and `PageLoader` from the common barrel file.

---

### Routing & Layout Integration

#### [MODIFY] `src/App.tsx`
- Mount `<RouteProgressBar />` inside `<BrowserRouter>` (above `<Suspense>`) so it persists across every route transition, including standalone ↔ workspace transitions.
- Replace the plain-text `RouteFallback` with `<PageLoader variant="fullscreen" />`.
- Update `RequireAuth`, `GuestOnly`, and `RequireAdmin` `authLoading` states to render `<PageLoader variant="fullscreen" />` instead of plain text or `null`.

#### [MODIFY] `src/components/layout/AppLayout.tsx`
- Wrap `<Outlet />` inside `<main id="main">` with `<Suspense fallback={<PageLoader variant="panel" />}>` so lazy-loading any workspace page keeps the sticky header and left sidebar stably mounted.

---

### Styling

#### [MODIFY] `src/index.css`
Add CSS classes for:
- `.route-progress-track` & `.route-progress-bar`: Fixed `top: 0; left: 0; right: 0; height: 3px; z-index: 100; pointer-events: none;`, using `var(--primary)` with a subtle glow shadow, smooth width/opacity transitions, and reduced-motion support.
- `.page-loader`, `.page-loader--fullscreen`, `.page-loader--panel`, `.page-loader-badge`, `.page-loader-spinner`, and `.page-loader-text`: Clean, centered styling that adapts automatically to light and dark themes.

---

## Verification Plan

### Automated Tests
```bash
npm run build && npm run lint
```

### Manual Verification
1. **Cached page-to-page navigation**: Click between Home → Dashboard → Generate Quiz → Attempt History → Settings → Quiz Game and confirm the slim top progress bar sweeps smoothly across the top edge without blocking interaction.
2. **Uncached lazy-loaded workspace route**: Throttle network in DevTools (e.g., Slow 3G) and navigate to an unvisited workspace page — verify the top header and sidebar stay mounted while `PageLoader` appears inside the main panel.
3. **Standalone route & auth loading**: Refresh directly on `/dashboard` or `/lobby` — verify the fullscreen branded `PageLoader` renders cleanly in both light and dark modes.
