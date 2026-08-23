# ayush.wav 🎛️

A heavily stylized, interactive, content-driven portfolio platform built around a **physical hardware and synthesizer aesthetic**. This project powers Ayush Parashar's personal website and includes a robust suite of unique features ranging from a fully playable in-browser DAW to an AI-powered private CMS called the "Patch Bay".

---

## ✨ Unique Features

### 🎛️ Physical Hardware Metaphor & UI
The entire frontend eschews standard web design for a deeply immersive, retro-tech hardware aesthetic. 
- **Component Design**: UI elements are designed as physical hardware modules (`ModulePanel`), complete with screws, inset shadows, CRT scanlines, and LED indicators.
- **Interactive Controls**: Users interact with the site using tactile representations of physical knobs (`SynthKnob`), hardware toggle switches, and tape matrix interfaces.
- **Generative Visualizations**: Integrated D3.js-powered animated oscilloscopes and generative art pieces that react and breathe life into the hardware panels.

### 🎹 Full Browser-Based DAW (Synth Playground)
The `/playground` route houses a fully functional, custom-built Digital Audio Workstation (DAW) utilizing the Web Audio API. 
- **Synthesis Engine**: Real-time synthesis featuring adjustable oscillators, ADSR envelopes, LFOs, and modular FX pedals (Reverb, Delay, Distortion, Chorus, Bitcrusher).
- **Interactive Performance Pads**: 
  - **Smart Chords Pad**: A touch/mouse-friendly XY pad for strumming chords automatically mapped to specific scales and root notes.
  - **Arpeggiator Pad**: XY control over arpeggiation speed, octave ranges, and patterns.
  - **Piano Keyboard**: An on-screen playable keyboard that highlights scales dynamically.
- **Multi-Track Sequencer**: Record, play, solo, and mute multiple tracks. Includes a visual timeline editor with zooming, seeking, and clip management.
- **Exporting**: Export your creations directly to `.WAV` audio files or `.MIDI` sequences.
- **Patch Cables**: A visual node system representing signal flow across the synthesizer.

### 🧠 AI-Powered GitHub Sync
The platform natively integrates with the GitHub API to pull your repositories. Instead of manually writing descriptions for every project, the system pipes the raw README content into **Google's Gemini AI (gemini-flash)**, which automatically infers:
- A punchy, 2-sentence description
- The primary project category (Web, AI, Security, etc.)
- A tagged list of technologies and frameworks used
The results are saved as "Drafts" for one-click publishing.

### 🎛️ "Patch Bay" (Private CMS)
A completely custom, secure admin dashboard protected by basic authentication. 
- Maintain full control over the portfolio's content directly from the browser without editing code.
- Manage Projects, Drafts, Experience Logs, Skills, and Certifications.
- The Patch Bay retains the hardware aesthetic, treating database entries like "SysEx data" and server actions as "Patching".

### 💾 Retro Resume Exporter
The `/resume` page isn't just a basic link. It is themed as a physical "Data Bank Export Utility" (Floppy Disk / Drive), featuring an embedded PDF viewer and stylized download actions.

---

## 🚀 Tech Stack

- **Framework:** Astro.js (Hybrid SSR mode)
- **Interactivity:** Preact Islands (for complex state in the DAW and CMS)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth (GitHub & Google OAuth) + Basic Auth for Patch Bay
- **Styling:** TailwindCSS v4
- **AI / APIs:** Google Generative AI (Gemini), GitHub API, Web Audio API

---

## 📂 Project Structure

- `src/pages/` - Public facing routes and API endpoints
- `src/components/` - Astro static components (Synth UI, structural layout sections)
- `src/islands/` - Preact interactive islands (DAW interface, CMS data editors)
- `src/lib/` - Services and external integrations (Audio Engine, Auth, GitHub, Gemini)
- `src/db/` - Drizzle schema definitions and database client

---

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

## 🚀 Deployment

This project is configured for deployment on Vercel using the `@astrojs/vercel` adapter in hybrid rendering mode.
