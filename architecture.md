# ayush.wav Architecture

## System Overview

`ayush.wav` is a content-driven, modular portfolio platform with a software synthesizer metaphor. It consists of a public-facing website and a private CMS ("Patch Bay").

**Core Technologies:**
- **Framework:** Astro.js (hybrid SSR mode)
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth (GitHub & Google OAuth)
- **Styling:** TailwindCSS v4
- **Islands/Interactivity:** Preact

## Folder Structure

```
d:\ayush.wav\
├── src/
│   ├── actions/          # Astro Actions (type-safe server mutations)
│   ├── components/       # Astro static components (Synth UI, sections)
│   ├── islands/          # Preact interactive islands (CMS editors)
│   ├── db/               # Drizzle schema and client
│   ├── lib/              # Services (Auth, GitHub, YouTube, Gemini, Content)
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Public pages, Patch Bay, and API endpoints
│   ├── styles/           # Tailwind v4 import and custom CSS
│   └── env.d.ts          # Astro and Better Auth types
├── drizzle/              # Migration files
└── public/               # Static assets
```

## Database Schema (Drizzle ORM)

The application uses PostgreSQL with the following core entities:

- **Users/Sessions/Accounts:** Managed by Better Auth.
- **Projects:** Stores project details, URLs, tags, and status.
- **Project Drafts:** AI-generated drafts awaiting review.
- **Repositories:** GitHub repo metadata linked to projects.
- **Experience:** Employment and internship history.
- **Education:** Academic history.
- **Skills / Categories:** Tech stack and capabilities.
- **Certifications / Achievements:** Recognitions and credentials.
- **Creative Works:** Visual and design lab entries.
- **YouTube Videos:** Synced videos from VOYXGE channel.
- **Settings / Presets:** Global configuration and active modes.

*Note: All content tables include `status` (DRAFT, PUBLISHED, HIDDEN, ARCHIVED), `featured`, and `display_order`.*

## Data Flow & API Routes

### Public Interface
1. User requests a page (e.g., `/signal`).
2. Astro page imports `lib/content.ts`.
3. Content service queries Drizzle (Neon).
4. Astro renders static HTML with synth styling (zero JS by default).
5. Interactivity (like contact form) is hydrated via Preact islands.

### Patch Bay (CMS)
1. Middleware (`src/middleware.ts`) checks Better Auth session.
2. If authenticated & authorized, SSR renders the Patch Bay layout.
3. Preact islands (`src/islands/patch-bay/*`) fetch data from `/api/*`.
4. Islands perform CRUD via API endpoints or Astro Actions.

## Integrations

### GitHub
- **Auth:** Connects via Better Auth.
- **Sync Pipeline:** `/api/github/sync` discovers repositories → fetches README → `/api/github/analyze` sends to Gemini API → stores in `project_drafts`.

### YouTube (VOYXGE)
- **Sync Pipeline:** `/api/youtube/sync` fetches from YouTube Data API v3 using channel ID.
- **Storage:** Upserts to `youtube_videos`. New videos are auto-published under the LATEST section.

### Gmail (Contact Form)
- **Flow:** User submits form → Astro Action / API endpoint validates → uses Gmail API to send email to `parasharayush71@gmail.com`.

## Security
- **Auth:** Secure HttpOnly cookies for sessions.
- **Env Vars:** Sensitive keys (Neon, Better Auth secret, OAuth keys, Gemini API) are strictly server-side.
- **Protection:** API routes validate sessions and sanitize input.

## Deployment
- **Platform:** Vercel (using `@astrojs/vercel` adapter).
- **Mode:** Hybrid (public pages pre-rendered where possible, API and `/patch-bay` use server rendering).
