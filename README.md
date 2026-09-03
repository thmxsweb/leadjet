# Leadjet

A client-acquisition control plane for web-dev freelancers on [Join-Jump](https://app.join-jump.com).

Jump handles the admin (invoicing, contract, payroll, CDI). Leadjet handles the missing piece: **getting clients.** You generate the leads, run the pipeline, and close; Jump does the rest.

**Discover → Qualify → Contact → Propose → Close**

- **Radar** — find local businesses that need a website (no site, outdated/slow/not-mobile, weak Google presence), scored by opportunity. Sources: Google Places, OpenStreetMap, and manual site audits.
- **Pipeline** — a Kanban of deals: New, Contacted, Proposal, Won.
- **Contacts** — a clean contact list built from your qualified leads.
- **Outreach** — templated emails and call scripts, every touch logged.
- **Propose & close** — generate quotes and create clients, missions, and invoices through [`@thmxsweb/jj-sdk`](https://www.npmjs.com/package/@thmxsweb/jj-sdk).
- **Money** — balance, operations, fees, and live multi-currency, powered by the SDK.

## Stack

- **Electron** (`electron-vite`) + `electron-builder` — Windows, macOS, Linux.
- **React + TypeScript + Tailwind** renderer; TanStack Query + Zustand.
- **`@thmxsweb/jj-sdk`** in the Node main process, exposed to the UI via a typed IPC bridge.
- Session secured with Electron `safeStorage` + the SDK's encrypted store.
- Lead/pipeline/contact data behind repository interfaces (local first, cloud API — `leadjet-api` — later).

## Develop

```bash
pnpm install
pnpm dev        # launch the app with HMR
pnpm build      # type-check + bundle
pnpm package    # build installers into ./release
pnpm check      # typecheck + lint + format + build
```

Sign in with your Join-Jump account; the session persists (encrypted) so you stay logged in.

## License

MIT © thmxsweb
