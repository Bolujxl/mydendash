# myDen — Engineering Audit

---

## Principles Applied

| Principle | Where | How |
|---|---|---|
| **Single Responsibility** | Every file | `useFetch` only fetches. `streakUtils` only calculates streaks. `Navbar` only renders navigation. Each page owns one route. |
| **Separation of Concerns** | `src/` structure | `hooks/` (data), `utils/` (pure functions), `context/` (theme), `components/` (UI), `pages/` (composition), `styles/` (CSS) |
| **Composition over Inheritance** | `App.jsx` + pages | ErrorBoundary wraps app. Pages compose components (Dashboard composes WeatherWidget, ActivityFeed, StreakCard, ContributionChart). No class inheritance. |
| **Custom Hooks** | `useFetch`, `useTheme` | Encapsulate fetch lifecycle (AbortController + cleanup) and theme access (context + guard clause) |
| **Context API** | `ThemeProvider` | Dark/light mode propagated via React Context, synced to `data-theme` on `<html>` |
| **useMemo for Derived Data** | Dashboard, GitHub, CommitHeatmap, ContributionChart | `uniqueLanguages`, `filteredEvents`, `contributionStats`, `filteredRepos`, `sortedRepos` — all memoized to avoid recomputation |
| **CSS Custom Properties** | `index.css` | 40+ design tokens (`--bg-root`, `--text-primary`, `--accent`, etc.) driving both themes via `[data-theme="dark"]` |
| **Declarative Routing** | `App.jsx` | React Router v7 `<Routes>/<Route>` — URL is source of truth |
| **Defensive Rendering** | ErrorBoundary, NotFound | Crash recovery + 404 catch-all |
| **TanStack Query** | Dashboard, GitHub, Activity | Stale-while-revalidate caching. Profile/repos: 5min stale. Events: 2min stale. |
| **AbortController** | `useFetch` | Cancels in-flight requests on unmount or URL change |
| **Pure Utility Modules** | `streakUtils`, `langColors` | No React imports — side-effect-free, testable functions |
| **Date-Based Computation** | `streakUtils` | Streak computed fresh from active dates Set, counting backwards — no mutable localStorage counter |

---

## Flaws Found

### Critical

| # | Issue | Files | Impact | Status |
|---|---|---|---|---|
| 1 | **Client-side GitHub token exposure** | `GitHub.jsx:30` | `VITE_GITHUB_TOKEN` was read and bundled into client JS. Removed; app uses unauthenticated rate limit (60 req/hr/IP). Token guidance in `.env.example` updated. | ✅ **RESOLVED** (Token removed, .env.example updated) |
| 2 | **Stale `GH_USER` on Activity page** | `Activity.jsx:8` | IIFE reads localStorage once at module load. Username changes on Dashboard never reach Activity page without full reload. | ✅ **RESOLVED** (Shared GithubUserContext) |
| 2 | **Stale `completedCount` on Dashboard** | `Dashboard.jsx:25` | Lazy initializer runs once. Tasks completed on `/tasks` don't update the Dashboard stat. | ✅ **RESOLVED** (Re-syncing via focus & storage listeners) |
| 3 | **`window.location.reload()` on username switch** | `Dashboard.jsx:130` | Pill editor triggers full page reload. Should use `queryClient.invalidateQueries()` instead. | ✅ **RESOLVED** (Uses query invalidation) |
| 4 | **Logic bug in codeStats** | `Activity.jsx:69` | `pushTotal` counts ALL events, but day breakdown uses 30-day cutoff. `avgCommits = pushTotal / 4` mixes unfiltered total with "per week" label. | ✅ **RESOLVED** (Cutoff applied to pushTotal, divisor is 4.3) |
| 5 | **WCAG contrast failure in light mode** | `index.css` | `--text-muted: #8b959e` on `#ffffff` = ~3.3:1 ratio. Fails AA (4.5:1 minimum). | ✅ **RESOLVED** (Increased contrast to `#627282` / 4.7:1) |

### Medium

| # | Issue | Files | Fix | Status |
|---|---|---|---|---|
| 6 | **Unstable ThemeProvider value** | `ThemeProvider.jsx` | `{ theme, toggleTheme }` recreated every render. Wrap in `useMemo([theme])`. | ✅ **RESOLVED** (Wrapped in useMemo) |
| 7 | **Two `getRelativeTime` implementations** | `ActivityFeed.jsx`, `Activity.jsx` | One returns "5m ago", the other "today". Consolidate into `src/utils/time.js`. | ✅ **RESOLVED** (Consolidated in `src/utils/time.js`) |
| 8 | **`useFetch` never used by pages** | Dashboard, GitHub, Activity | All 3 pages inline their own `fetch`. The hook is only used by WeatherWidget. | ✅ **RESOLVED** (WeatherWidget migrated to useQuery, useFetch.js deleted) |
| 9 | **Duplicate derived variable** | `Tasks.jsx:69,72` | `doneCount` and `completedCount` compute identical value. | ✅ **RESOLVED** (Cleaned up in earlier refactor) |
| 10 | **ErrorBoundary: dead `handleReload`** | `ErrorBoundary.jsx:13` | Method defined but never wired. Recovery uses `window.location.reload()`. | ✅ **RESOLVED** (handleReload wired to button) |
| 11 | **`completedCount` param unused** | `streakUtils.js:21` | `recalcStreak(completedCount, events)` — first param never read. | ✅ **RESOLVED** (Param removed) |
| 12 | **No `useMemo` on `totalStars`** | `Dashboard.jsx:95` | Recalculates on every render. Should be memoized. | ✅ **RESOLVED** (Memoized totalStars) |

### Low

| # | Issue | Files | Status |
|---|---|---|---|
| 13 | Inconsistent indentation | `App.jsx:21-22` | ✅ **RESOLVED** (Auto-formatted App.jsx) |
| 14 | Inline SVG bloats Navbar | `Navbar.jsx:31-56` (26-line SVG) | Unchanged |
| 15 | Redundant DOM node | `App.jsx:17` (`div.content-wrapper` could merge into `main.main-content`) | ✅ **RESOLVED** (Merged and updated App.css / App.jsx) |
| 16 | Scrollbar only styled for WebKit | `index.css` (no `scrollbar-width` for Firefox) | ✅ **RESOLVED** (Added Firefox scrollbar properties) |
| 17 | Ghost profile cards not `aria-hidden` | `GitHub.jsx` | ✅ **RESOLVED** (Added `aria-hidden="true"`) |

### Accessibility (11 items)

| # | Issue | Files | Status |
|---|---|---|---|
| A1 | No `aria-expanded` on hamburger | `Navbar.jsx` | ✅ **RESOLVED** (Wired expand state toggle) |
| A2 | Heatmap cells not keyboard-operable | `ContributionChart.jsx`, `CommitHeatmap.jsx` | ✅ **RESOLVED** (Added tabIndex, role, aria-label, keyboard handlers) |
| A3 | Sortable table headers not keyboard-operable | `Activity.jsx` | ✅ **RESOLVED** (Added tabIndex & Enter key listeners) |
| A4 | No `aria-pressed`/`aria-selected` on toggle buttons | ActivityFeed, Tasks, GitHub filters | ✅ **RESOLVED** (Added `aria-pressed` state properties) |
| A5 | Missing `<label>` on search inputs | GitHub.jsx | ✅ **RESOLVED** (Added hidden labels & `aria-label` tags) |
| A6 | Missing `<label>` on task inputs | Tasks.jsx | ✅ **RESOLVED** (Added hidden labels) |
| A7 | No `role="alert"` on error container | ErrorBoundary.jsx | ✅ **RESOLVED** (Added `role="alert"`) |
| A8 | No skip-to-content link | App.jsx | ✅ **RESOLVED** (Added skip link and styling) |
| A9 | No `prefers-reduced-motion` support | index.css | ✅ **RESOLVED** (Added media query mapping) |
| A10 | Activity list not `<ul>/<li>` | ActivityFeed.jsx | ✅ **RESOLVED** (Replaced with semantic markup) |
| A11 | Light mode contrast failure | index.css (see Critical #5) | ✅ **RESOLVED** (Increased contrast) |

---

## Quick Wins (All Complete ✅)

1. ~~Fix `ThemeProvider` unstable value — wrap in `useMemo`~~ ✅
2. ~~Remove duplicate `doneCount`/`completedCount` in Tasks~~ ✅
3. ~~Wire `handleReload` to ErrorBoundary's "Try Again" button~~ ✅
4. ~~Add `aria-expanded` to hamburger button~~ ✅
5. ~~Run Prettier on App.jsx to fix indentation~~ ✅
6. ~~Remove unused `completedCount` param from `recalcStreak`~~ ✅
7. ~~Delete `useFetch.js`, migrate WeatherWidget to `useQuery`~~ ✅
8. ~~Remove client-side `VITE_GITHUB_TOKEN`~~ ✅
9. ~~Make heatmap cells keyboard-operable~~ ✅

