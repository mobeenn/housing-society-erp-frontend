# Civica — Frontend

React + Vite SPA for Civica.

## Tech stack

- **Framework** — React 19 + Vite 8
- **Routing** — React Router v7 (`createBrowserRouter`)
- **Styling** — Tailwind CSS v4 with navy/gold design tokens (light/dark)
- **State** — Zustand (auth + theme), TanStack Query (server state)
- **HTTP** — Axios with JWT refresh interceptor (`withCredentials`)
- **Forms** — React Hook Form + Zod (selected pages); many feature forms use local state
- **Charts** — Recharts
- **Icons** — Lucide React
- **Toasts** — React Hot Toast
- **Tours** — react-joyride (module registry under `src/tours/`)

There is **no separate resident/guard app**. One shell; sidebar and actions come from backend RBAC (`GET /api/rbac/my-access`).

## Folder structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx          # All routes + ProtectedRoute
│   │   ├── providers.jsx
│   │   └── AuthInitializer.jsx
│   ├── pages/                  # Login, Dashboard, 404
│   ├── components/
│   │   ├── layout/             # DashboardLayout, Sidebar, Topbar, Breadcrumbs
│   │   ├── ui/                 # Button, Input, Table, Modal, Card, …
│   │   └── ProtectedRoute.jsx
│   ├── features/               # Domain pages + *Api.js
│   ├── lib/                    # apiClient, queryClient, permissions helpers
│   ├── store/                  # authStore, themeStore
│   ├── hooks/useCan.js
│   ├── tours/
│   └── index.css               # Design tokens
├── .env.example
├── vercel.json
└── package.json
```

## Design system

Tokens in `src/index.css` (and Tailwind `@theme`):

- **Brand** — navy (`#0d1c42`) + gold accents on warm canvas
- **Theme** — light/dark via `themeStore` → `document.documentElement.dataset.theme`
- **Fonts** — Inter (body), Manrope (display)
- **Currency** — PKR / `en-PK` conventions in UI formatting

## Getting started

1. **Install**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure**

   ```bash
   cp .env.example .env
   # VITE_API_BASE_URL=http://localhost:5000/api
   ```

   If unset in development, Vite proxies `/api` → `http://localhost:5000`.

3. **Run**

   ```bash
   npm run dev
   ```

   App: `http://localhost:3000` (login required for the dashboard shell).

4. **Build**

   ```bash
   npm run build
   npm run preview
   ```

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run test:tours` | Validate Joyride tour registry |
| `npm run lint` | oxlint |

## Path aliases

`@` → `src/`:

```js
import { Button } from "@/components/ui";
import apiClient from "@/lib/apiClient";
```

## Auth flow

1. `LoginPage` → `authApi.login` → `authStore` (user + accessToken)
2. `AuthInitializer` restores session via refresh cookie + `/auth/me`, then loads `/rbac/my-access`
3. `apiClient` attaches Bearer token; on 401 tries `/auth/refresh` then retries; failure → logout
4. `ProtectedRoute` requires auth + loaded access; optional `requiredModule` / `requiredAction` / super-admin
5. Sidebar modules come from `access.modules` (visibility, route, group, icon)

`useCan(module, action)` is **UI-only**; the API `authorize` middleware is the security boundary.

Role dashboards use `rbacAccess.dashboardType` (`management|finance|operations|security|property`). Recovery shows admin vs agent portal based on `recovery:create`.

## API client

[`src/lib/apiClient.js`](src/lib/apiClient.js):

- Base URL from `VITE_API_BASE_URL`, or production backend host, or `/api` proxy
- `withCredentials: true` for refresh cookies
- Single-flight refresh queue on 401

## Vercel configuration

Committed production default (override via project env as needed):

```bash
VITE_API_BASE_URL=https://housing-society-erp-backend.vercel.app/api
```

Cross-site cookies require backend `CORS_ORIGIN` allowlist and refresh cookie `SameSite=None; Secure`.

## Known gaps

- Procurement **PR / Quotation / PO / GRN** pages exist under `src/features/procurement` but are **not registered** in `src/app/routes.jsx` (vendors route only)
- Inventory / dealers / finance-GL are mostly contextual or tour-only on the FE
