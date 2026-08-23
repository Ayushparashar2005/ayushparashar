# ayush.wav 🎛️

A content-driven, modular portfolio platform with a software synthesizer metaphor. This project powers Ayush Parashar's personal website and includes a private CMS called "Patch Bay".

## 🚀 Tech Stack

- **Framework:** Astro.js (hybrid SSR mode)
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth (GitHub & Google OAuth) + Basic Auth for Patch Bay
- **Styling:** TailwindCSS v4
- **Interactivity:** Preact Islands

## 📂 Project Structure

- `src/pages/` - Public pages and API endpoints
- `src/components/` - Astro static components (Synth UI, sections)
- `src/islands/` - Preact interactive islands (CMS editors)
- `src/lib/` - Services (Auth, GitHub, YouTube, Gemini, Content)
- `src/db/` - Drizzle schema and client

## 🛠️ Setup & Development

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your keys. Make sure you set `PATCH_BAY_USERNAME` and `PATCH_BAY_PASSWORD` for local admin access.
   ```sh
   cp .env.example .env
   ```
   **Key Configuration areas:**
   - Database: `DATABASE_URL`
   - Authentication: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`
   - APIs: `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `GMAIL_CLIENT_SECRET`
   - Patch Bay (Admin): `PATCH_BAY_USERNAME`, `PATCH_BAY_PASSWORD`

3. **Start the local dev server:**
   ```sh
   npm run dev
   ```
   The site will be running at `http://localhost:4321`.

## 🎛️ Patch Bay (CMS)

The "Patch Bay" is a private CMS that allows managing projects, drafts, experience, and more. 
It is protected by Basic Auth. Set your credentials in your `.env` file using `PATCH_BAY_USERNAME` and `PATCH_BAY_PASSWORD` to access it locally.

## 🚀 Deployment

This project is configured for deployment on Vercel using the `@astrojs/vercel` adapter in hybrid rendering mode.
