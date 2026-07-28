# Thabit Frontend (React 19 + Vite + Tailwind CSS 4)

Thabit (ثابت) is a modern, responsive React web application designed for daily Qur'an mindfulness, audio playback, streak tracking, mood calendar logging, and reflective journaling.

---

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4 + Vanilla CSS Design System (`index.css`, `global.css`)
- **Routing**: React Router 7 (`BrowserRouter`)
- **Animations**: GSAP (GreenSock Animation Platform) + CSS Keyframes
- **Icons**: FontAwesome 6 + Google Material Symbols Outlined
- **Storage & Caching**: IndexedDB (`idb-keyval`) for Ayah audio & verse caching

---

## Directory Structure

```text
src/
├── assets/             # Avatars, mood stickers, SVGs, and brand images
│   ├── avatars.jsx     # Avatar selector badges ("Scholar", "Reciter", "Seeker", "Pilgrim")
│   ├── moodStickers.js # Sticker asset mapping (happy, angry, sad, etc.)
│   └── navIcons.js     # Sidebar and BottomNav icon configuration
├── components/         # Reusable UI components
│   ├── BottomNav.jsx          # Mobile bottom navigation bar (iOS safe-area optimized)
│   ├── DesktopSidebar.jsx     # Desktop navigation sidebar
│   ├── HeartRating.jsx        # Mood sticker selector for daily logging
│   ├── MoodCalendar.jsx       # Interactive monthly sticker calendar with tooltips
│   ├── JournalComposeModal.jsx# Sacred Journal entry composer modal
│   └── LoadingDots.jsx        # Animated loading indicator
├── data/               # Static datasets and lookup JSONs
│   ├── content.js        # Surah metadata, heart options, daily verses
│   ├── surahs.json       # Chapter metadata (114 Surahs)
│   ├── juz.js            # Juz divisions and verse mappings
│   └── royalCounsel.json # 350 curated, audited Islamic facts & motivation entries
├── lib/                # Client utilities and API services
│   ├── api.js            # Fetch wrapper with JWT cookie credentials (`include`)
│   ├── verseCache.js     # Client-side IndexedDB & memory verse caching
│   ├── ayahAudioCache.js # Offline audio caching service
│   ├── royalCounsel.js   # 3-hour time-bucket rotation engine for Royal Counsel
│   └── localDay.js       # Local timezone date formatting & streak helpers
├── pages/              # Primary route views
│   ├── HomePage.jsx      # Bento-grid dashboard (Streak, Living Word, Royal Counsel)
│   ├── SurahPage.jsx     # Deep-link verse reader with scroll-to-ayah anchors (#ayah-N)
│   ├── ReaderPage.jsx    # Surah index & chapter navigation
│   ├── MomentumPage.jsx  # Statistics, week-in-verses, Ramadan counter & Mood Calendar
│   ├── PlaybackPage.jsx  # Audio player view with verse highlighting
│   ├── JournalPage.jsx   # Sacred Journal reflections history
│   ├── BookmarksPage.jsx # Saved verse bookmarks list
│   ├── SettingsPage.jsx  # User profile, avatar choice & display preferences
│   ├── LoginPage.jsx     # User authentication (Login)
│   └── SignupPage.jsx    # User registration
├── App.jsx             # Main app container, state management, and route definitions
├── index.css           # Tailwind 4 theme, font variables, and utility classes
└── global.css          # Design system rules, typography scaling, and pattern backgrounds
```

---

## Key Features & Architecture

### 1. Bento Dashboard (`HomePage.jsx`)
- Displays daily greeting, streak counter, and daily devotion progress bar.
- **The Living Word**: Showcases an Ayah of the Day with scaled typography, gold motif dividers, and one-click Save, Read, Reflect, or Journal actions.
- **Royal Counsel**: Displays rotating Islamic facts & motivation powered by `royalCounsel.js` (changes automatically every 3 hours across 350 curated entries).

### 2. Deep-Link Verse Reader (`SurahPage.jsx`)
- Supports direct navigation to exact verses via URL hashes (e.g. `/surah/13#ayah-28`).
- Uses asynchronous DOM-rendered `scrollIntoView` to land directly at the requested ayah when navigating from reflections or recommendations.

### 3. Mood Calendar & Stickers (`MoodCalendar.jsx` & `HeartRating.jsx`)
- Interactive mood logger featuring custom avatar stickers (`happy`, `angry`, `sad`, `horrified`, `spiritual`).
- Responsive sticker sizes (`60px` mobile / `76px` desktop) to prevent card overflow.
- Calendar grid featuring edge-aware tooltips (snaps left on Sunday/Monday, right on Friday/Saturday) showing exact date and logged sentiment.

### 4. Audio Caching (`ayahAudioCache.js` & `quranIdb.js`)
- Uses IndexedDB storage to cache Ayah audio files locally for smooth playback without repeated network requests.

### 5. Responsive Design & Accessibility
- Fully responsive across mobile (max 430px container with bottom nav) and desktop (pinned sidebar with dual-column grid).
- Supports iOS `env(safe-area-inset-bottom)` and `scroll-behavior: smooth`.

---

## Local Development

```bash
# Run Vite dev server with HMR
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
