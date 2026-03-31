# Azkar

A modern, production-ready Islamic web application built with React + TypeScript + Vite.

## Features

- Daily Azkar with automatic morning/evening category selection
- Category switching (Morning, Evening, Sleep, After Prayer, General)
- Interactive Tasbeeh counters per Zikr with localStorage persistence
- Favorites with localStorage persistence
- Search and category filtering
- Browser reminders (optional, permission-based)
- Simple Qibla helper (device location bearing + Google Maps link)
- Dark/Light mode toggle
- Arabic/English switch
- Audio playback via browser speech synthesis
- Mobile-first responsive UI using Tailwind CSS

## Tech Stack

- React (functional components + hooks)
- React Router DOM
- React Query
- Context API
- Tailwind CSS (via Vite plugin)
- localStorage

## Project Structure

```text
azkar/
  public/
    data/
      azkar.json
  src/
    assets/
    components/
      AppLayout.tsx
      CategoryTabs.tsx
      TopNav.tsx
      ZikrCard.tsx
    context/
      FavoritesContext.tsx
      SettingsContext.tsx
    data/
      categories.ts
    hooks/
      useAzkarData.ts
      useDailyReminders.ts
      useLocalStorage.ts
      useTasbeehCounters.ts
    pages/
      CounterPage.tsx
      FavoritesPage.tsx
      HomePage.tsx
      SettingsPage.tsx
    types/
      azkar.ts
    utils/
      qibla.ts
      time.ts
    App.tsx
    index.css
    main.tsx
```

## Data Format

Static file: `public/data/azkar.json`

Each record contains:

- `id`
- `category`
- `text`
- `textEn`
- `count`
- `reference`
- `benefit`

## Step-by-Step Implementation

1. Set up app dependencies:
   - `react-router-dom`
   - `@tanstack/react-query`
   - `tailwindcss`
   - `@tailwindcss/vite`

2. Configure Tailwind:
   - Add `tailwindcss()` plugin in `vite.config.ts`
   - Add `@import 'tailwindcss';` in `src/index.css`
   - Define theme tokens and dark mode variables

3. Add static Azkar JSON:
   - Create `public/data/azkar.json` with categorized Azkar content

4. Build core models and helpers:
   - Strong types in `src/types/azkar.ts`
  # Azkar Web App

  A multilingual Islamic web application for daily remembrance, Quran reading and recitation, community Q&A, messages, prayer utilities, and kids learning tools.

  Built with React, TypeScript, Vite, and TanStack Query.

  ## Highlights

  - Bilingual UX (Arabic and English) with RTL/LTR support.
  - Light and dark themes with global accent color switching.
  - Daily Azkar experience with progress tracking and favorites.
  - Quran ayat page with playlist, repeat mode, translation, and tafsir display.
  - Recitations platform with recording, moderation workflow, comments, and ratings.
  - Community questions page with tags, answers, voting, and moderation controls.
  - Messages center with category cards, message-type pages, and shareable image export.
  - Tasbeeh and category counters with persistent history and PDF export.
  - Prayer times, Qibla bearing, and compass direction support.
  - Kids section with stories, quiz, weekly challenges, and a tap game.

  ## Full Feature Set

  ### Core Azkar

  - Time-aware default category selection (morning/evening and more).
  - Search and category filtering.
  - Per-item counters with completion progress.
  - Favorites management.
  - Read-aloud support using browser Speech Synthesis.

  ### Quran and Ayat

  - Browse ayat with Arabic and English content.
  - Sequential playlist playback and per-ayah repeat modes.
  - Full-surah audio playback.
  - Per-ayah translation toggle.
  - Per-ayah tafsir toggle with fallback when tafsir is unavailable.

  ### User Recitations

  - Record audio directly in browser (MediaRecorder API).
  - Submit recitations with surah and ayah range metadata.
  - Moderation states: pending, approved, rejected.
  - Role-based visibility (user vs admin).
  - Comments and star ratings on published recitations.
  - Global and per-recitation show/hide controls for ratings.

  ### Questions and Answers

  - Ask questions with topic tags.
  - Post answers and interact with question threads.
  - Search and filter by tag.
  - Voting and moderation workflow.
  - Seed question reloading from static data.

  ### Messages

  - Landing page with visual category cards and type counts.
  - Dedicated page per message type.
  - Sorting and saved-count behavior.
  - Export message cards as image.
  - Share message image using Web Share API when available.

  ### Counters and Worship Tools

  - Tasbeeh page with target modes (33, 100, custom).
  - Preset counters and completion tracking.
  - Optional vibration and sound feedback.
  - Session history grouped by date.
  - Export session history to PDF.
  - Category-based zikr counters on a separate route.

  ### Prayer and Qibla

  - Prayer timings from Aladhan API using device geolocation.
  - Calculation method and school preferences.
  - Qibla bearing calculation.
  - Compass-style Qibla arrow using Device Orientation events.

  ### Kids Platform

  - Islamic stories with summaries and lessons.
  - Interactive quiz with scoring and result view.
  - Weekly challenge checklist with persistence.
  - Tap tasbeeh mini-game.

  ### Settings and Navigation

  - Language switch (Arabic/English).
  - Theme switch (light/dark).
  - Accent color presets (blue, emerald, amber, rose).
  - Browser reminder toggle and notification permission flow.
  - Top navigation with quick theme and accent actions.

  ### Admin Access Gate

  - Admin mode requires login (email and password) before role switch.
  - Credentials are centralized in a dedicated config file at src/config/adminAuth.ts.

  ## Routes

  - /
  - /ayat
  - /recitations
  - /messages
  - /messages/type/:type
  - /favorites
  - /counter
  - /counter/tasbeeh
  - /counter/categories
  - /kids
  - /prayer-times
  - /questions
  - /settings

  ## Data Sources

  Static JSON files:

  - public/data/azkar.json
  - public/data/ayat.json
  - public/data/messages.json
  - public/data/questions.json
  - public/data/kids-content.json

  External API:

  - Aladhan Prayer Times API for live prayer timings.

  ## Tech Stack

  - React 19
  - TypeScript
  - Vite
  - React Router
  - TanStack Query
  - Tailwind CSS (via Vite plugin)
  - jsPDF

  ## Local Persistence

  The app stores most user state in localStorage, including:

  - theme, accent color, language, reminders
  - favorites
  - recitations and recitation roles
  - Q&A posts and Q&A role
  - tasbeeh counters and history
  - kids challenges and tap game progress
  - prayer preferences
  - message save counters

  Note: this is browser-local storage, so data is per device/browser profile.

  ## Getting Started

  ### Prerequisites

  - Node.js 18+
  - npm

  ### Install

  ```bash
  npm install
  ```

  ### Development

  ```bash
  npm run dev
  ```

  ### Production Build

  ```bash
  npm run build
  npm run preview
  ```

  ### Lint

  ```bash
  npm run lint
  ```

  ## Project Structure (Key Areas)

  ```text
  src/
    components/   # shared UI: layout, nav, cards, tabs
    context/      # global app settings and favorites
    hooks/        # reusable state/data hooks
    pages/        # route-level features
    config/       # app config (admin auth)
    utils/        # qibla, time and helpers
  public/data/    # static JSON content
  ```

  ## Deployment

  The project is ready for static hosting (for example Vercel or Netlify).

  If deploying with protected admin access in production, move admin credentials from source to environment variables and backend validation.
