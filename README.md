# Competency Radar

A mobile-first web app for tracking and visualising competency levels across a skill framework. Built with React, TypeScript, and Vite.

Currently ships with the **UX Competency Framework** by David Travis, covering 8 competency areas rated on a Novice-to-Expert scale.

## Features

- **Interactive radar chart** -- concentric-ring visualisation of all competencies at a glance. Tap a segment to select it, or drag radially to adjust the level.
- **Card carousel** -- horizontally scrollable cards with animated score transitions, colour-coded progress bars, and a wrapping loop so navigation feels continuous.
- **Behaviours view** -- drill into each competency to see the full list of behaviours that define each level.
- **OLED-optimised** -- true black (#000000) background designed for OLED displays.
- **Mobile-native feel** -- viewport-locked layout, scroll/bounce prevention, CSS safe-area support for iOS (Dynamic Island, home indicator), and visual haptic feedback via Framer Motion.

## Tech Stack

| Layer | Library |
|-------|---------|
| UI | React 19, TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Animation | Framer Motion |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check
npx tsc --noEmit

# Production build
npm run build
```

## Data

Competency definitions live in `src/data/ux-framework.json` and user scores in `src/data/user-data.json`. The app merges these at runtime via the `useCompetencyData` hook, defaulting any missing scores to 0.

## Project Structure

```
src/
  components/
    CompetencyRadar.tsx   # Interactive concentric-ring chart
    Dashboard.tsx         # Main view (carousel + chart + nav)
    BehavioursView.tsx    # Full-screen behaviours list
    BottomNav.tsx         # Bottom navigation bar
  hooks/
    useCompetencyData.ts  # Merges framework + user data
  data/
    ux-framework.json     # Competency framework definition
    user-data.json        # User scores and targets
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`.
