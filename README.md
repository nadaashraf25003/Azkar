# Azkar Web App

A modern multilingual Islamic web application built with React, TypeScript, and Vite.

The app combines daily azkar, Quran tools, religious information, community interactions, prayer utilities, and kids learning features in one responsive experience.

## Key Features

- Arabic and English interface with RTL and LTR support.
- Light and dark theme support.
- Global accent color switching across the whole app.
- Mobile-friendly responsive UI.
- Persistent user preferences and progress using localStorage.

## Feature Modules

### 1) Daily Azkar

- Time-aware default category selection.
- Category filtering and search.
- Progress tracking for each zikr.
- Favorite azkar management.
- Per-zikr counter controls.
- Read aloud support using browser speech synthesis.

### 2) Quran Ayat

- Ayat browsing with Arabic and English text.
- Search by surah and ayah content.
- Playlist playback mode.
- Repeat mode for ayah memorization.
- Full-surah audio playback.
- Translation toggle per ayah.
- Tafsir toggle per ayah.

### 3) Religious Information

- Dedicated section for concise Islamic knowledge cards.
- Category filter (Aqeedah, Fiqh, Quran, Seerah, Manners, Dua).
- Search support.
- Arabic/English title, content, and source display.
- Backed by static JSON data.

### 4) Quran Recitations (Community)

- Record recitation directly in the browser.
- Submit recitation with surah and ayah range details.
- Moderation flow with statuses: pending, approved, rejected.
- Role-based visibility for user/admin.
- Ratings and comments on published recitations.
- Show/hide ratings globally and per-recitation.

### 5) Messages Center

- Category cards page for message types.
- Per-type message pages.
- Type counts and sorting behavior.
- Save/share features.
- Generate message image cards for sharing.

### 6) Counters and Worship Tools

- Separate Tasbeeh and category counter pages.
- Tasbeeh target modes: 33, 100, or custom value.
- Preset counters with progress tracking.
- Optional vibration and sound feedback.
- Session history with date grouping.
- Tasbeeh history export to PDF.

### 7) Prayer Times and Qibla

- Prayer times from Aladhan API.
- Geolocation-based timing fetch.
- Calculation method and madhhab preferences.
- Qibla direction calculation.
- Compass-based Qibla direction support on compatible devices.

### 8) Questions and Answers

- Ask and answer Islamic questions.
- Tag-based organization.
- Search and filter.
- Voting and moderation capabilities.
- Seed data loading from static JSON.

### 9) Kids Platform

- Islamic stories for children.
- Interactive quiz and score flow.
- Weekly challenge tracking.
- Tap-based tasbeeh mini game.

### 10) Settings and Navigation

- Language switch.
- Theme switch.
- Accent color selection and nav quick-toggle icon.
- Daily reminders permission flow.
- Top navigation tabs across all sections.

## Routes

- /
- /ayat
- /religious-info
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

Static files in public/data:

- azkar.json
- ayat.json
- messages.json
- questions.json
- kids-content.json
- religious-info.json

External API:

- Aladhan Prayer Times API.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- jsPDF

## Persistence

The app uses localStorage to persist:

- Theme, language, accent color, reminders.
- Favorites.
- Counters and tasbeeh history.
- Questions and role state.
- Recitations and role state.
- Kids progress.
- Prayer preferences.
- Message save counters.

## Security Note

Admin role uses an in-app login gate in the current frontend implementation. For production, move credential validation to a secure backend.

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

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment

This app is ready for static hosting providers such as Vercel and Netlify.
