# Housing Society Management ERP — Frontend

Production-grade React + Vite frontend for the Housing Society Management ERP system.

## Tech Stack

- **Framework** — React 18 + Vite
- **Routing** — React Router v6
- **Styling** — Tailwind CSS v4
- **State Management** — Zustand (auth), TanStack Query (server state)
- **HTTP Client** — Axios (with JWT refresh interceptor)
- **Forms** — React Hook Form + Zod validation
- **Charts** — Recharts
- **Icons** — Lucide React
- **Notifications** — React Hot Toast

## Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx           # Root app component
│   │   ├── routes.jsx        # React Router configuration
│   │   └── providers.jsx     # QueryClient + Toaster providers
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx  # Main app shell
│   │   │   ├── Sidebar.jsx          # Collapsible sidebar nav
│   │   │   ├── Topbar.jsx           # Search + notifications + user menu
│   │   │   └── Breadcrumbs.jsx
│   │   └── ui/                      # Reusable primitives
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Table.jsx
│   │       ├── Modal.jsx
│   │       ├── Card.jsx
│   │       ├── Badge.jsx
│   │       ├── StatusPill.jsx
│   │       └── ConfirmDialog.jsx
│   ├── features/              # Feature-based modules (members, plots, etc.)
│   ├── lib/
│   │   ├── apiClient.js       # Axios instance with JWT refresh
│   │   └── queryClient.js     # TanStack Query config
│   ├── store/
│   │   └── authStore.js       # Zustand auth store (user, tokens, login/logout)
│   ├── utils/                 # Helper functions
│   └── styles/                # Global styles (currently in index.css)
├── .env.example
└── vite.config.js
```

## Design System

Tailwind CSS is configured with custom color tokens:

- **Primary** — Blue (sidebar active, buttons)
- **Secondary** — Purple (accent)
- **Success** — Green (positive states)
- **Warning** — Amber (pending/caution)
- **Danger** — Red (errors/destructive actions)
- **Neutral** — Gray scale (text, borders, backgrounds)

All colors adapt to dark mode via Tailwind's theme configuration.

## Getting Started

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000` by default. API calls to `/api/*` are proxied to the backend (`http://localhost:5000`).

4. **Verify**

   Navigate to `http://localhost:3000` — you'll be redirected to `/dashboard` with the full layout (sidebar, topbar, breadcrumbs) visible.

## NPM Scripts

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite dev server            |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |

## Path Aliases

The `@` alias resolves to `src/`:

```js
import { Button } from "@/components/ui";
import apiClient from "@/lib/apiClient";
```

## API Client

`src/lib/apiClient.js` is a configured Axios instance that:

- Attaches the JWT `accessToken` from Zustand auth store to every request
- Intercepts 401 responses and attempts to refresh the token via `/api/auth/refresh`
- Retries the original request with the new token
- Logs the user out if refresh fails

## Next Steps

- Connect the login page to the backend `/api/auth/login` endpoint
- Build feature modules in `src/features/` (members, plots, invoicing, payments, complaints)
- Add protected route guards that redirect to `/login` when not authenticated
