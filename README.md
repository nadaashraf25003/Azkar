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
   - Time-based category logic in `src/utils/time.ts`
   - Qibla bearing utility in `src/utils/qibla.ts`

5. Create reusable hooks:
   - `useAzkarData` for loading static JSON with React Query
   - `useLocalStorage` for persistent state
   - `useTasbeehCounters` for per-zikr counters
   - `useDailyReminders` for browser notifications

6. Add global context:
   - `FavoritesContext` for favorite Azkar
   - `SettingsContext` for theme, language, and reminders

7. Implement pages and components:
   - `HomePage`: daily Azkar, auto category, search/filter, progress
   - `FavoritesPage`: saved Azkar list
   - `CounterPage`: focused counting experience
   - `SettingsPage`: language/reminders/qibla controls
   - `ZikrCard`: text, benefit, reference, favorite, counter, audio

8. Wire app shell:
   - Router + nested layout in `App.tsx`
   - Providers in `main.tsx`: React Query + Settings + Favorites + Router

9. Validate production build:
   - `npm run build`

## Run Locally

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

The app is ready to deploy to Netlify or Vercel as a static frontend.
