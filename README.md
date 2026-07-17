# Valorian AI

Internal **AI Business Analyst** workspace for **Valora Advisory** — built by OuterJoin.

This repo holds both the prototype app and the living project notes (see [`docs/PROJECT-NOTES.md`](docs/PROJECT-NOTES.md)). It is the single source of truth for the engagement.

## Prototype

A branded Next.js (App Router, TypeScript) demo with three working areas:

- **Idea Canvas** — capture ideas with owner, date, priority, custom tags and image/file attachments (persists in-browser for the demo).
- **Users** — workspace access overview.
- **Roles & Permissions** — capability-based access control.

Branding: Valora navy `#0a1a2f` + gold `#c8a24c`, tagline _"Turning Insight into Impact"_.

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000  (redirects to /idea-canvas)
```

## Deploy

Deploys on Vercel. Push to `main` → Vercel builds and deploys.

## Stack

Next.js 15 · React 19 · TypeScript · plain CSS design system (no runtime CSS deps).

---

_Prototype for client demonstration. Not the final production architecture — see project notes._
