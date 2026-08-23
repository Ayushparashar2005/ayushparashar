# ayush.wav Design System

## Design Philosophy

The website acts as a **software synthesizer-inspired personal operating interface**. It is not a generic portfolio template. It must feel tactile, precise, and musical, blending engineering rigor with creative expression.

**Key Adjectives:** Dark, tactile, technical, precise, experimental, sophisticated, personal.
**Avoid:** Generic AI aesthetics (purple gradients, neon green, glowing blobs, glass cards, particle spam).

## Visual Identity

### Colors
- **Base:** Deep, neutral darks (e.g., `#09090b` to `#18181b`).
- **Accents:** Muted, technical highlights (e.g., anodized aluminum, subtle amber, cold cyan) to indicate active states or signal flow.
- **Text:** High-contrast off-white for primary text, dimmed gray for secondary labels.

### Typography
- **Primary (UI/Labels):** Monospaced or highly geometric sans-serif (e.g., Fira Code, JetBrains Mono, or Inter) for precision.
- **Secondary (Content):** Clean sans-serif for readable descriptions.

### The Synthesizer Metaphor

The UI components should mimic hardware and VST plugin controls:

- **Modules:** Sections of content (e.g., a Project) are treated as distinct hardware modules.
- **Presets:** The main navigation modes.
- **Knobs/Faders:** Used for interaction where appropriate (e.g., filtering, volume, or settings).
- **Patch Cables / Signal Flow:** Visual lines connecting related concepts or demonstrating architectures.
- **LEDs/Indicators:** Small light dots indicating status (e.g., `PUBLISHED` = green LED, `DRAFT` = amber LED).

## Core Modes (Presets)

1. **PRESET 001 — SIGNAL (Engineering):**
   - Theme: `INPUT → PROCESS → MODEL → OUTPUT`
   - Content: AI/ML, Software, Data, Experience, Education, Projects, Skills.
2. **PRESET 002 — FORM (Design):**
   - Theme: `ARTBOARD → LAYERS → COMPOSITION → OUTPUT`
   - Content: UI/UX, Posters, Visual Experiments.
3. **PRESET 003 — WAVE (Creative/Music):**
   - Theme: `OSC → FILTER → FX → MASTER`
   - Content: VOYXGE YouTube videos, Music Production, Audiovisual work.
4. **PRESET 004 — OUTPUT (External):**
   - Theme: Routing patch points out to the world.
   - Content: GitHub, LinkedIn, YouTube, Email.

## Component Guidelines

### Project Patches
Projects should not be standard cards. They are "Synth Patches."
- Must include technical, accurate signal flows (e.g., `INPUT → MEMORY → RESPONSE`).
- Display technologies as patch labels rather than generic tags.

### Patch Bay (CMS Interface)
- Represents the "back panel" of the instrument.
- Dark, utilitarian, dense but organized.
- Uses switches, toggle buttons, and precise input fields.
- Statuses represented by LED colors.

## Motion & Animation
- **Intentional:** Used for preset transitions, signal routing, parameter feedback, and module activation.
- **Subtle:** Avoid excessive parallax, 3D, or constant movement.
- **Accessibility:** Must respect `prefers-reduced-motion`.

## Responsive Strategy
- **Desktop:** Full, immersive synthesizer panel experience.
- **Tablet:** Compressed modular layout.
- **Mobile:** Dedicated vertical stack that retains the tactile aesthetic without shrinking desktop components unreadably.

## States
- **Loading:** Subtle waveform or LED sequence.
- **Empty:** "NO SIGNAL DETECTED" or "MODULE UNPATCHED".
- **Error:** Instrument-style alerts (e.g., `GITHUB SIGNAL LOST`, `ANALYSIS ENGINE OFFLINE`).
