# CLAUDE.md — Project Instructions for Claude Code

## Project Overview
**fitness-health-app** — 52-week "Return to Fitness" PWA for a single user (Mateus Lima).
Tracks workout completion, body metrics, and will integrate with wearable devices.

## Tech Stack
- **Frontend:** Vite 8 + React 19 + Tailwind CSS v4 + Zustand 5 + Recharts 3 + React Router 7
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Hosting:** Vercel (auto-deploy from main)
- **PWA:** vite-plugin-pwa (service worker, offline caching, installable)

## Supabase
- **Project:** fitness-health-app (awaiting project ref from user)
- **Tables:** profiles, workout_plans, workout_logs, metrics, sleep_logs, readiness_logs, activity_logs, lab_results, device_sync_log
- **Future tables (Phase 2-3):** blood_pressure (systolic, diastolic, pulse from Omron BP cuff)
- **Auth:** Magic link to mattlima94@gmail.com
- **RLS:** Enabled on all tables, single-user pattern
- **Credentials:** .env.local only (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Component Tree
```
src/
├── main.jsx                          # HashRouter entry
├── App.jsx                           # Routes + auth wrapper
├── index.css                         # Imports globals.css
├── styles/globals.css                # Tailwind @theme + base styles
├── lib/
│   ├── supabase.js                   # Supabase client (env-based)
│   ├── store.js                      # Zustand store (week, exercises, metrics, timer)
│   ├── constants.js                  # PHASES, MILESTONES, PHASE_FOCUS, RED_FLAGS
│   └── workoutData.js                # Full 52-week plan (156 day objects)
├── components/
│   ├── layout/
│   │   ├── BottomNav.jsx             # 5-tab navigation (phase-colored)
│   │   ├── Toast.jsx                 # Notification toast
│   │   └── PhaseIndicator.jsx        # Phase badge pill
│   ├── today/TodayPage.jsx           # Dashboard: progress ring, today's workout, phase focus
│   ├── workout/
│   │   ├── WorkoutPage.jsx           # Week overview with day cards
│   │   ├── DayDetail.jsx             # Exercise checklist (single-tap toggle)
│   │   ├── WeekPicker.jsx            # 52-week grid by phase
│   │   └── RestTimer.jsx             # Countdown timer overlay
│   ├── body/
│   │   ├── BodyPage.jsx              # Weight/waist stats + manual entry
│   │   └── WeightChart.jsx           # Recharts line chart
│   ├── insights/InsightsPage.jsx     # Phase overview + milestones
│   └── settings/SettingsPage.jsx     # Week override, device status, about
```

## Design System
- **Background:** #0a0a14
- **Surface:** rgba(255,255,255,0.035)
- **Border:** rgba(255,255,255,0.06)
- **Text:** #e0e0ec
- **Text Muted:** rgba(255,255,255,0.4)
- **Fonts:** DM Sans (UI), JetBrains Mono (numbers/timers)
- **Phase Colors:**
  - Phase 1 (Foundation, wk 1-8): #2E7D32 / accent #66BB6A
  - Phase 2 (Building, wk 9-20): #1565C0 / accent #42A5F5
  - Phase 3 (Comeback, wk 21-36): #E65100 / accent #FF9800
  - Phase 4 (Return to Play, wk 37-52): #6A1B9A / accent #AB47BC
- **Workout Types:** Cardio #42A5F5, Strength #66BB6A, Long #FF9800
- **Danger:** #EF5350
- **Border Radius:** 16px (cards), 14px (buttons), 10px (small)
- **Max Width:** 480px (mobile-first)

## Build Commands
```bash
npm run dev      # Local dev server
npm run build    # Production build
npx vercel deploy --prod  # Deploy to Vercel
```

## Rules
- No localStorage persistence — all data goes to Supabase (or Zustand in-memory if offline)
- Dark mode only — no light mode toggle
- Mobile-first, max 480px container
- One-tap interactions — no confirmation dialogs for exercise toggles
- Injury-aware — red flags always visible on Today page
- Phase-colored accents — UI accent color changes with current phase
- Offline graceful — app shell works offline via service worker

## Phase 1 Status (Completed March 14, 2026)
- [x] Vite + React + Tailwind + Zustand + Recharts project scaffolded
- [x] 52-week workout data extracted from HTML file
- [x] 5-tab UI built (Today, Workout, Body, Insights, Settings)
- [x] Exercise toggle, rest timer, week picker, phase navigation
- [x] Manual weight/waist entry with trend chart
- [x] PWA configured (manifest, service worker, offline)
- [x] Git repo + GitHub push
- [x] Deployed to Vercel: https://fitness-health-app.vercel.app
- [ ] Supabase project created and schema applied
- [ ] Workout plans seeded to Supabase
- [ ] Auth configured (magic link)
- [ ] .env.local with Supabase credentials

## Pending (Phase 2-4)
- Omron WiFi scale integration (weight, body fat)
- Omron BP cuff integration (systolic, diastolic, pulse)
- Oura Ring API (sleep, HRV, readiness) via Mac Mini cron
- Garmin Connect API (runs, HR, steps) via Mac Mini cron
- NordicTrack/iFit → Garmin → Supabase pipeline
- Function Health lab import (semi-manual, 2x/year)
- Smart coaching rules engine
- Weekly email reports via Gmail MCP
- Google Calendar workout sync

## Device Ecosystem
- **Omron WiFi Scale:** weight, body fat → Omron Connect → Health Connect → Garmin Connect → Garmin API → Supabase
- **Omron BP Cuff:** systolic, diastolic, pulse → Omron Connect → Health Connect → Garmin Connect → Garmin API → Supabase
- **Garmin Watch:** runs, HR, steps, activity → Garmin Connect → Garmin API → Supabase
- **Oura Ring:** sleep, HRV, readiness, temp → Oura API (direct OAuth2) → Supabase
- **NordicTrack Treadmill:** iFit → Garmin Connect → Garmin API → Supabase
- **Function Health:** 160+ biomarkers → semi-manual export → Supabase
- **Phone:** Google Pixel (Android) — Health Connect is the hub
- **Data Pipeline:** Mac Mini M4 Pro cron jobs pull from APIs → write to Supabase
