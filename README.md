# SchoolERP Frontend

React 19 + Vite + Tailwind 4 web app for SchoolERP: the public site, school dashboards and the
platform admin console.

## Layout

| Path              | What it is                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| `apps/web`        | The web app                                                                 |
| `packages/shared` | Shared blueprint data used by the app: roles, permissions, navigation, tiers |

## Prerequisites

- **Node.js 22.22+ or 24 LTS**
- **npm 11+** (npm 10 crashes on this dependency tree; run `npm install -g npm@11`)
- The SchoolERP API running at `http://localhost:3000` (needed for login and data)

## Setup and run

```bash
npm install
cp apps/web/.env.example apps/web/.env   # optional; the defaults work locally
npm run dev                              # builds shared, then starts http://localhost:5173
```

The tenant is read from the host name, so open the app through a `*.localhost` address:

| URL                          | What                   |
| ---------------------------- | ---------------------- |
| http://localhost:5173        | Public marketing site  |
| http://admin.localhost:5173  | Platform admin console |
| http://<school-slug>.localhost:5173 | A school's dashboard |

## Production build

```bash
npm run build      # output in apps/web/dist
npm run preview
```
