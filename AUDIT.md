# App.jsx — Principles, Audit & Social Positioning

---

## Part 1 — Software Engineering Principles Applied

### 1. Single Responsibility Principle (SRP)
`App.jsx` does exactly one thing: it composes the layout shell and declares routes. It does not fetch data, manage state, or contain business logic. Each child (`Navbar`, `Dashboard`, `GitHub`, etc.) owns its own responsibility.

### 2. Separation of Concerns
- **Routing** is delegated to `react-router-dom` (`Routes`/`Route`)
- **Error recovery** is delegated to `ErrorBoundary` (class component, catches render crashes)
- **Navigation UI** is isolated in `Navbar` (sidebar component, lazy-loaded mobile overlay)
- **Page content** lives in `pages/` — the App has zero knowledge of what any page renders

### 3. Composition over Inheritance
The layout is composed, not inherited:
```
ErrorBoundary
  └── div.app
        ├── Navbar (persistent shell)
        └── main.main-content
              └── div.content-wrapper
                    └── Routes (swappable page content)
```
No base class, no `extends`. Every piece is a composable function.

### 4. Defensive Rendering
- `ErrorBoundary` wraps the entire tree — any uncaught render error shows a recovery UI instead of a white screen
- `NotFound` route (`path="*"`) catches unmatched URLs gracefully
- `Navbar` is outside `<Routes>` — it never unmounts during navigation, preventing layout jitter

### 5. Declarative Routing
Routes are declared as JSX, not imperatively configured. The URL is the source of truth for what renders. `path="/", "/github", "/tasks", "/activity", "*"` is self-documenting.

### 6. CSS Co-location
`./App.css` is imported at the component level (line 9). Vite's CSS modules guarantee no global namespace pollution while keeping styles scoped to the App shell.

### 7. Lazy Evaluation (Indirect)
Page components (`Dashboard`, `GitHub`, etc.) are imported statically but only rendered when their route matches. React Router unmounts non-matching routes, freeing memory. This is not `React.lazy()` but achieves similar runtime efficiency for a 4-page SPA.

### 8. Pure Component
`App` is a pure function — given the same props (none), it always returns the same JSX tree. No side effects, no state, no hooks. This makes it trivially testable and never the source of re-render bugs.

---

## Part 2 — Flaws & Bad Practices

### Flaw 1: Inconsistent indentation (Line 21-22)
```jsx
<Route path="/" element={<Dashboard />} />
<Route path="/github" element={<GitHub />} />
<Route path="/tasks" element={<Tasks />} />        // ← correct indent
<Route path="/activity" element={<Activity />} />   // ← misaligned (2 spaces off)
```
**Impact**: Cognitive overhead when scanning routes. Fix: align to parent `<Routes>` indent.

### Flaw 2: No code splitting
All 5 page components are statically imported. On first load, the browser downloads Dashboard, GitHub, Tasks, Activity, and NotFound — even though the user only sees one.
**Impact**: Larger initial bundle, slower Time-to-Interactive. Fix:
```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GitHub = lazy(() => import('./pages/GitHub'))
// ... wrap Routes in <Suspense fallback={<Spinner />}>
```

### Flaw 3: `div.content-wrapper` is redundant
The `main.main-content` already handles layout (flexbox centering). The inner `div.content-wrapper` adds an extra DOM node with `max-width` — but `main.main-content` could carry that CSS rule directly.
**Impact**: One unnecessary DOM node per render. Minor, but avoidable.

### Flaw 4: No `<Suspense>` boundary
If page components were lazy-loaded, there's no fallback UI during loading. Currently harmless (static imports), but reveals missing infrastructure for future code splitting.

### Flaw 5: ErrorBoundary catches only render errors
`ErrorBoundary` (`getDerivedStateFromError`) does NOT catch:
- Event handler errors (e.g., `onClick` throws)
- Async errors (e.g., `useEffect` failures)
- Promise rejections not tied to render
**Impact**: A failed API call inside `useEffect` with no `.catch()` could crash silently. Fix: add a `componentDidCatch` that logs to console or an error reporting service.

### Flaw 6: No `<Helmet>` or document title management
The page title is set once in `index.html` as "myDen". Navigating to `/github` or `/tasks` doesn't update the browser tab title.
**Impact**: Poor UX — all pages share the same tab title. Bookmarks and browser history become less useful.

### Flaw 7: `NotFound` is imported but never analyzed
The `*` catch-all route renders `NotFound` — but if `NotFound` itself crashes, the ErrorBoundary above it catches the error. This creates a confusing UX: a broken 404 page shows "Something went wrong" instead of "Page not found." Consider wrapping `NotFound` in its own error boundary or making it fail-safe (no data dependencies).

### Flaw 8: No analytics or logging
There's no error reporting service (Sentry, LogRocket), no performance monitoring, and no usage analytics. For a production app, errors in the ErrorBoundary should be reported somewhere.
**Impact**: Bugs in production are invisible to the developer.

---

## Part 3 — Social Media Drafts

### LinkedIn Post

**Headline:** I built a personal developer dashboard from scratch — here's what I learned.

**Body:**
Over the last few weeks, I built **myDen** — a React dashboard that pulls live GitHub activity, manages tasks, shows weather, and tracks your coding streak.

No UI library. No Tailwind. Just React 19, CSS custom properties, and a 12-column grid system I designed from scratch.

**What's under the hood:**
→ TanStack Query for API caching (5-min stale, background revalidation)
→ Dark/light theme system with 40+ CSS variables
→ Collapsible sidebar with mobile overlay
→ Custom `useFetch` hook with AbortController cleanup
→ Streak tracking from GitHub Events API
→ Contribution heatmap built from event data

**Three things building this taught me:**
1. **Design tokens pay off immediately.** Standardizing spacing (4px base), radius (4/8/12px), and shadows into CSS variables made every new component look native.
2. **Error boundaries are not optional.** One missing import crashed the entire app. Wrapping `<App />` in an error boundary saved me during development and will save users in production.
3. **Caching changes everything.** Moving from raw `fetch` to `useQuery` cut perceived load time from 2 seconds to near-zero on repeat visits.

**Stack:** React 19 · Vite · React Router v7 · TanStack Query · Lucide · GitHub REST API

Repo in comments. Open to feedback — especially from engineers who've built dashboards at scale.

[link to repo]

---

### Twitter Draft

Built a developer dashboard in React. No UI framework — just CSS variables and a grid system.

Highlights:
→ Live GitHub activity feed
→ Streak tracking (Duolingo-style, from Events API)
→ 30-day contribution heatmap
→ Dark/light mode with 40+ CSS custom properties
→ TanStack Query caching (instant page loads)

Been a great learning vehicle for design tokens, error boundaries, and API caching patterns.

Stack: React 19 · Vite · TanStack Query · GitHub REST API

Open to code review 👇
[repo link]

---

### Twitter (Alternative — shorter, more human)

Spent a few weeks building a dashboard for myself. Pulls my GitHub activity, tracks my tasks, shows a coding streak.

Most valuable lesson: just because you *can* re-fetch data every page visit doesn't mean you *should*. TanStack Query made the app feel 10x faster.

Also: design tokens > any UI library. Change one variable, change the whole app.

[repo link]