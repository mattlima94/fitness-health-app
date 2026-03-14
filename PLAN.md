# Fitness Health App — Claude Code Execution Plan
## "Return to Fitness" → Full Personal Health Platform

**Prepared for:** Mateus Lima  
**Date:** March 14, 2026  
**Repo:** `mattlima94/fitness-health-app`
**Deploy target:** Vercel — https://fitness-health-app.vercel.app
**Database:** Supabase (fitness-health-app project — awaiting project ref)
**Monthly cost increase:** $0 (all within free tiers)

---

## Context for Claude Code

You are rebuilding a fitness tracking PWA. The current version is a single 1000-line HTML file using localStorage. The new version will be a React SPA deployed on Vercel with Supabase as the database backend.

**The user (Mateus) is:**
- A 32-year-old anesthesiologist returning to fitness after years of sedentary medical training
- Following a 52-week phased program (Foundation → Building → Comeback → Return to Play)
- A former athlete (running + soccer) with history of knee and ankle injuries
- Time-constrained (medical practice + side business + 2-year-old son)
- Located in Coral Springs, Florida

**His hardware ecosystem:**
- Omron WiFi Scale (weight, body fat) — syncs via Omron Connect app
- Omron BP Cuff (systolic, diastolic, pulse) — syncs via Omron Connect app
- Garmin Watch (runs, HR, steps, activity) — syncs via Garmin Connect app
- Oura Ring (sleep, HRV, readiness, temperature) — syncs via Oura API direct
- NordicTrack treadmill with iFit — syncs via iFit app → Garmin Connect
- Function Health subscription (160+ biomarkers, 2x/year lab draws)

**Phone:** Google Pixel (Android)

**Data Pipeline:**
- Omron Connect → Health Connect (Android) → Garmin Connect → Garmin API → Mac Mini cron → Supabase
- iFit → Garmin Connect → Garmin API → Mac Mini cron → Supabase
- Oura → Oura API (direct, OAuth2) → Mac Mini cron → Supabase
- Function Health → semi-manual export (CLI tool or Chrome extension) → Supabase
- Health Connect is the Android hub. All Omron and Garmin data flows through it. No Apple products in the stack.

**His infrastructure (already live):**
- Mac Mini M4 Pro 48GB (always-on, Tailscale VPN, SSH via Termius)
- Claude Code CLI with 6 MCPs: Gmail, Google Calendar, Vercel, GitHub, Supabase, Perplexity
- Google Drive mirror mode (all Drive files local at `$PROJECTS/`)

**The existing HTML tracker file is uploaded alongside this plan.** Extract the workout plan data (the `P[]` array) and all phase/milestone/red-flag constants from it during Phase 1.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  DATA SOURCES (auto-ingest via Mac Mini cron jobs)  │
│                                                     │
│  WiFi Scale → Supabase (weight, body fat)           │
│  Oura API   → Supabase (sleep, HRV, readiness)     │
│  Garmin API → Supabase (runs, HR, steps, iFit data) │
│  Function   → Supabase (labs, semi-manual import)   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL + Edge Functions + Auth)       │
│                                                     │
│  Tables: profiles, workout_plans, workout_logs,     │
│          metrics, sleep_logs, readiness, labs,       │
│          device_sync_log                            │
│                                                     │
│  RLS: enabled, single-user (auth.uid() filter)     │
│  Edge Functions: /ingest-oura, /ingest-garmin,      │
│                  /ingest-scale, /weekly-report       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React SPA on Vercel)                     │
│                                                     │
│  Framework: Vite + React + Tailwind CSS             │
│  Routing: React Router (hash-based for PWA)         │
│  State: Zustand (lightweight, persist to Supabase)  │
│  Charts: Recharts                                   │
│  PWA: Vite PWA plugin (service worker, offline)     │
│                                                     │
│  Tabs: Today | Workout | Body | Insights | Settings │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack Decisions (and why)

| Choice | Why | Alternatives rejected |
|--------|-----|----------------------|
| **React SPA** (not Next.js) | No SSR needed for single-user app. Simpler. Faster builds. Claude Code iterates faster on plain React. | Next.js (overkill), vanilla HTML (current, fragile) |
| **Vite** | Fast dev server, excellent PWA plugin, small bundles | CRA (deprecated), Webpack (slow) |
| **Tailwind CSS** | Rapid iteration, consistent design tokens, Claude Code writes it fluently | CSS modules (slower iteration), styled-components (heavier) |
| **Zustand** | 1kb, simple, persists to Supabase trivially | Redux (overkill), Context (re-render issues) |
| **Recharts** | React-native charts, responsive, well-documented | Chart.js (canvas-based, less React-friendly), D3 (overkill) |
| **Supabase Auth** | Magic link or PIN, already have the project | Firebase (another vendor), custom auth (security risk) |
| **Supabase Realtime** | Not needed now, but free option for future multi-device sync | WebSockets (manual), polling (wasteful) |

---

## Database Schema

### Core Tables

```sql
-- User profile (single user, but structured for proper auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT DEFAULT 'Mateus',
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 52),
  program_start_date DATE,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- The 52-week workout plan (seeded from the HTML file's P[] array)
-- Stored in DB so plan adjustments don't require redeployment
CREATE TABLE workout_plans (
  id SERIAL PRIMARY KEY,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 52),
  day_index INTEGER NOT NULL, -- 0=A, 1=B, 2=C
  day_label TEXT NOT NULL, -- "A", "B", "C"
  day_description TEXT, -- "Weekday", "Weekend"
  workout_type TEXT NOT NULL CHECK (workout_type IN ('cardio', 'strength', 'long')),
  exercises JSONB NOT NULL, -- array of {name, detail, duration}
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  UNIQUE(week, day_index)
);

-- Exercise completion log
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  week INTEGER NOT NULL,
  day_index INTEGER NOT NULL,
  exercise_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual', -- 'manual', 'garmin_auto', 'ifit_auto'
  device_activity_id TEXT, -- link to Garmin/iFit activity if auto-matched
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week, day_index, exercise_index)
);

-- Body metrics (weight, waist, body fat)
-- Sources: manual entry, WiFi scale auto-sync
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  week INTEGER,
  weight_lbs NUMERIC(5,1),
  waist_inches NUMERIC(4,1),
  body_fat_pct NUMERIC(4,1),
  notes TEXT,
  source TEXT DEFAULT 'manual', -- 'manual', 'scale_auto', 'garmin'
  device_id TEXT, -- scale serial or garmin device ID
  raw_data JSONB, -- full device payload for debugging
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sleep data from Oura
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL UNIQUE,
  sleep_score INTEGER, -- 0-100
  total_sleep_minutes INTEGER,
  rem_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  resting_hr INTEGER,
  hrv_average INTEGER, -- ms
  temperature_deviation NUMERIC(3,2), -- degrees from baseline
  respiratory_rate NUMERIC(4,1),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily readiness from Oura
CREATE TABLE readiness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL UNIQUE,
  readiness_score INTEGER, -- 0-100
  activity_balance INTEGER,
  body_temperature INTEGER,
  hrv_balance INTEGER,
  previous_day_activity INTEGER,
  previous_night INTEGER,
  recovery_index INTEGER,
  resting_heart_rate INTEGER,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity data from Garmin (runs, walks, treadmill sessions)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  activity_type TEXT, -- 'running', 'treadmill', 'walking', 'soccer'
  duration_minutes INTEGER,
  distance_miles NUMERIC(5,2),
  calories INTEGER,
  avg_hr INTEGER,
  max_hr INTEGER,
  avg_pace_min_per_mile NUMERIC(5,2),
  elevation_gain_ft INTEGER,
  source TEXT DEFAULT 'garmin', -- 'garmin', 'ifit', 'manual'
  external_id TEXT UNIQUE, -- Garmin activity ID for dedup
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function Health lab results
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  test_date DATE NOT NULL,
  category TEXT NOT NULL, -- 'Heart & Cardiovascular', 'Metabolic & Diabetes', etc.
  biomarker TEXT NOT NULL, -- 'Apolipoprotein B (ApoB)', 'HDL Cholesterol', etc.
  value TEXT NOT NULL, -- stored as text because some are '<0.90' etc.
  unit TEXT,
  reference_range TEXT,
  optimal_range_min NUMERIC,
  optimal_range_max NUMERIC,
  status TEXT CHECK (status IN ('in_range', 'out_of_range', 'optimal')),
  out_of_range_direction TEXT CHECK (out_of_range_direction IN ('above', 'below', NULL)),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, test_date, biomarker)
);

-- Blood pressure from Omron BP cuff (Phase 2-3)
CREATE TABLE blood_pressure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'evening', 'other')),
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  pulse INTEGER,
  irregular_heartbeat BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual', -- 'manual', 'omron_auto'
  device_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Device sync tracking
CREATE TABLE device_sync_log (
  id SERIAL PRIMARY KEY,
  device TEXT NOT NULL, -- 'oura', 'garmin', 'scale', 'function'
  sync_type TEXT, -- 'full', 'incremental', 'manual'
  records_synced INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure ENABLE ROW LEVEL SECURITY;

-- RLS policies (single user, but good practice)
CREATE POLICY "Users can read own data" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Repeat pattern for all tables...
-- workout_plans is readable by all authenticated users (it's the program, not personal data)
CREATE POLICY "Authenticated users can read plans" ON workout_plans FOR SELECT USING (auth.role() = 'authenticated');
```

### Useful Views

```sql
-- Today's dashboard data in one query
CREATE VIEW daily_dashboard AS
SELECT
  p.current_week,
  r.readiness_score,
  r.resting_heart_rate,
  s.sleep_score,
  s.total_sleep_minutes,
  s.hrv_average,
  m.weight_lbs,
  m.body_fat_pct,
  (SELECT COUNT(*) FROM workout_logs wl
   WHERE wl.week = p.current_week AND wl.completed = true) as exercises_done,
  (SELECT SUM(jsonb_array_length(wp.exercises))
   FROM workout_plans wp WHERE wp.week = p.current_week) as exercises_total
FROM profiles p
LEFT JOIN readiness_logs r ON r.date = CURRENT_DATE
LEFT JOIN sleep_logs s ON s.date = CURRENT_DATE
LEFT JOIN LATERAL (
  SELECT * FROM metrics
  WHERE user_id = p.id
  ORDER BY date DESC LIMIT 1
) m ON true
WHERE p.id = auth.uid();

-- Weekly trend for weight chart
CREATE VIEW weight_trend AS
SELECT date, weight_lbs, waist_inches, body_fat_pct, source
FROM metrics
WHERE user_id = auth.uid()
ORDER BY date DESC
LIMIT 30;

-- Phase progress summary
CREATE VIEW phase_progress AS
SELECT
  wp.phase,
  wp.week,
  COUNT(CASE WHEN wl.completed THEN 1 END) as completed,
  SUM(jsonb_array_length(wp.exercises)) as total,
  ROUND(
    COUNT(CASE WHEN wl.completed THEN 1 END)::numeric /
    NULLIF(SUM(jsonb_array_length(wp.exercises)), 0) * 100
  ) as pct
FROM workout_plans wp
LEFT JOIN workout_logs wl ON wl.week = wp.week
  AND wl.day_index = wp.day_index
  AND wl.user_id = auth.uid()
GROUP BY wp.phase, wp.week
ORDER BY wp.week;
```

---

## Build Phases

### Phase 1: Core App + Database (Priority: CRITICAL)
**Goal:** Replace the HTML file with a real app. All current functionality preserved, data safe in Supabase.

#### Step 1.1: Project Setup
```bash
# In $PROJECTS/ on Mac Mini
npm create vite@latest fitness-health-app -- --template react
cd fitness-health-app
npm install @supabase/supabase-js zustand recharts react-router-dom
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

#### Step 1.2: Supabase Setup
- Run the full SQL schema above via Supabase SQL editor or MCP
- Seed `workout_plans` table by extracting the `P[]` array from the existing HTML file
- Create a single user via Supabase Auth (magic link to `mattlima94@gmail.com`)
- Set up `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### Step 1.3: Component Architecture
```
src/
├── main.jsx
├── App.jsx                    # Router + auth wrapper
├── lib/
│   ├── supabase.js            # Supabase client init
│   ├── store.js               # Zustand store
│   └── constants.js           # Phase definitions, colors, red flags
├── hooks/
│   ├── useProfile.js          # Current week, program state
│   ├── useWorkouts.js         # Workout plan + completion data
│   ├── useMetrics.js          # Weight, body metrics
│   ├── useSleep.js            # Oura sleep data
│   ├── useReadiness.js        # Oura readiness
│   └── useActivities.js       # Garmin activities
├── components/
│   ├── layout/
│   │   ├── BottomNav.jsx      # 5-tab navigation
│   │   ├── PageHeader.jsx
│   │   └── PhaseIndicator.jsx # Color-coded phase pill
│   ├── today/
│   │   ├── TodayPage.jsx      # Morning briefing dashboard
│   │   ├── ReadinessCard.jsx  # Oura readiness score + recommendation
│   │   ├── WeekProgress.jsx   # Ring chart + day dots
│   │   ├── QuickMetric.jsx    # Weight, sleep, HRV at a glance
│   │   └── TodayWorkout.jsx   # "Your workout today" card
│   ├── workout/
│   │   ├── WorkoutPage.jsx    # Week view with day cards
│   │   ├── DayCard.jsx        # Single day overview
│   │   ├── DayDetail.jsx      # Exercise checklist for one day
│   │   ├── ExerciseItem.jsx   # Single exercise with toggle
│   │   ├── RestTimer.jsx      # Configurable rest timer
│   │   └── WeekPicker.jsx     # Grid to jump to any week
│   ├── body/
│   │   ├── BodyPage.jsx       # Metrics + sleep + recovery
│   │   ├── WeightChart.jsx    # Recharts weight trend
│   │   ├── SleepCard.jsx      # Last night's sleep summary
│   │   ├── HRVChart.jsx       # HRV trend line
│   │   ├── MetricEntry.jsx    # Manual weight/waist input (fallback)
│   │   └── BodyCompCard.jsx   # Body fat trend if available
│   ├── insights/
│   │   ├── InsightsPage.jsx   # Trends, phases, labs
│   │   ├── PhaseOverview.jsx  # All 4 phases + milestones
│   │   ├── TrendCharts.jsx    # Multi-metric overlay charts
│   │   ├── LabResults.jsx     # Function Health biomarker display
│   │   ├── RedFlags.jsx       # Injury warning cards
│   │   └── WeeklyReport.jsx   # Summary of the week
│   └── settings/
│       ├── SettingsPage.jsx
│       ├── DeviceSync.jsx     # Connection status for all devices
│       ├── DataExport.jsx     # JSON export, Sheets sync
│       └── ProgramSettings.jsx # Start date, current week override
├── styles/
│   └── globals.css            # Tailwind + custom dark theme
└── sw.js                      # Service worker for offline
```

#### Step 1.4: Design System

Preserve the existing dark aesthetic but make it systematic:

```js
// tailwind.config.js
export default {
  darkMode: 'class', // Always dark for this app
  theme: {
    extend: {
      colors: {
        surface: 'rgba(255,255,255,0.035)',
        'surface-hover': 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.06)',
        // Phase colors
        'phase-1': '#2E7D32', // Foundation - green
        'phase-2': '#1565C0', // Building - blue
        'phase-3': '#E65100', // Comeback - orange
        'phase-4': '#6A1B9A', // Return to Play - purple
        // Workout types
        cardio: '#42A5F5',
        strength: '#66BB6A',
        long: '#FF9800',
        danger: '#EF5350',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

#### Step 1.5: Data Migration
- On first load, check if localStorage has data from the old app
- If yes, offer a one-time migration to Supabase
- Map `ft-workouts` → `workout_logs`, `ft-metrics` → `metrics`, `ft-state` → `profiles.current_week`
- After successful migration, clear localStorage and show confirmation

#### Step 1.6: PWA Configuration
```js
// vite.config.js - VitePWA plugin config
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Return to Fitness',
    short_name: 'Fitness',
    theme_color: '#0a0a14',
    background_color: '#0a0a14',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*supabase.*\/rest/,
        handler: 'NetworkFirst',
        options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 3600 } },
      },
    ],
  },
})
```

#### Step 1.7: Deploy
```bash
# GitHub repo setup
git init
git remote add origin git@github.com:mattlima94/fitness-health-app.git
git push -u origin main

# Vercel deployment (via MCP or CLI)
# Link to GitHub repo, set env vars for Supabase URL + anon key
# Auto-deploy on push to main
```

#### Phase 1 Acceptance Criteria
- [ ] App loads at `fitness.vercel.app` (or custom domain)
- [ ] Can navigate all 5 tabs
- [ ] Can view workout plan for any week (1-52)
- [ ] Can check/uncheck exercises, data persists in Supabase
- [ ] Can log weight/waist manually, see chart
- [ ] Can jump between weeks
- [ ] Phase colors update correctly
- [ ] Rest timer works
- [ ] Works offline (service worker caches app shell)
- [ ] Old localStorage data migrated successfully
- [ ] PWA installable on phone home screen

---

### Phase 2: WiFi Scale + Oura Integration (Priority: HIGH)
**Goal:** Eliminate manual weight entry. Bring in sleep and readiness data.

#### Step 2.1: Determine Scale Integration Path

**If Withings scale:**
- Register at `developer.withings.com`
- Create OAuth2 app, get client_id + secret
- Withings API provides: weight, body fat %, lean mass, BMI
- Set up Supabase Edge Function as webhook receiver
- Withings pushes new measurements automatically via webhook notifications

**If Renpho/Eufy/other:**
- These scales typically sync to their own app → Apple Health or Google Fit
- Path A: Use Apple Health export (manual periodic) — parse XML
- Path B: Garmin Connect integration (if scale syncs to Garmin)
- Path C: Direct scraping of scale app's cloud API (fragile, not recommended)
- For any non-Withings scale, the initial approach is:
  1. Set up Garmin Connect as the hub (many scales sync to it)
  2. Pull weight data from Garmin's API alongside activity data
  3. Fall back to manual entry with a streamlined quick-log UI

#### Step 2.2: Oura Ring Integration

```bash
# Mac Mini cron job: runs daily at 7 AM
# File: $PROJECTS/fitness-health-app/scripts/sync-oura.js

# 1. Register OAuth2 app at cloud.ouraring.com/oauth/applications
# 2. Complete OAuth2 flow once to get refresh token
# 3. Store tokens in ~/.config/mcl-mcp/shared/oura-tokens.json
# 4. Cron job refreshes access token automatically
```

**Data to pull daily:**
- `GET /v2/usercollection/daily_sleep?start_date={yesterday}` → sleep_logs table
- `GET /v2/usercollection/daily_readiness?start_date={yesterday}` → readiness_logs table
- `GET /v2/usercollection/heartrate?start_date={yesterday}` → for resting HR trend

**Cron setup on Mac Mini:**
```bash
# crontab -e
0 7 * * * /usr/local/bin/node $PROJECTS/fitness-health-app/scripts/sync-oura.js >> /tmp/oura-sync.log 2>&1
```

#### Step 2.3: Morning Briefing Card (Today tab)

Once Oura data flows in, the Today page shows:

```
┌──────────────────────────────────────┐
│  Good morning, Mateus                │
│  Friday, March 14 · Week 12         │
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  78    │ │  7.2h  │ │  42ms  │  │
│  │Readine.│ │ Sleep  │ │  HRV   │  │
│  └────────┘ └────────┘ └────────┘  │
│                                      │
│  📋 Today: Day A — Cardio            │
│  Treadmill Run · 25 min continuous   │
│  ──────────────────────────────      │
│  💡 Readiness is good. Full workout  │
│     recommended.                     │
│                                      │
│  ⚖️ 237.4 lbs (↓ 0.8 from last wk)  │
└──────────────────────────────────────┘
```

**Readiness-based recommendations logic:**
- Score 85-100: "You're primed. Full send on today's workout."
- Score 70-84: "Solid recovery. Proceed as planned."
- Score 55-69: "Recovery is moderate. Consider reducing intensity 10-15% or shortening your run by 5 min."
- Score below 55: "Your body is asking for rest. Swap today's workout for a 20-min easy walk + mobility."
- If knee/ankle soreness noted in recent logs: "You flagged knee soreness 2 days ago. Extra warm-up today. Skip any jumping movements."

#### Phase 2 Acceptance Criteria
- [ ] Weight appears automatically from scale (no manual entry needed)
- [ ] Sleep score, HRV, readiness show on Today page each morning
- [ ] Readiness-based workout recommendation displays
- [ ] Oura sync cron runs reliably on Mac Mini
- [ ] Scale sync works (method depends on brand)
- [ ] Historical data backfilled for trend charts
- [ ] Device sync status visible in Settings

---

### Phase 3: Garmin + iFit Integration (Priority: MEDIUM)
**Goal:** Auto-detect completed runs. Link treadmill sessions to the workout plan.

#### Step 3.1: Garmin Connect Data

**Recommended approach: unofficial Garmin Connect API**

For a single-user personal app, the Garmin Health API (enterprise, requires approval process) is overkill. Instead:

```bash
# Use garmin-connect npm package or garminconnect Python library
# These use the same endpoints as the Garmin Connect mobile app
# Requires Garmin Connect username + password (store securely)

npm install garmin-connect
# Store credentials in ~/.config/mcl-mcp/shared/garmin-credentials.json
```

**Data to pull daily (cron, 7:30 AM):**
- Activities from yesterday: type, duration, distance, HR, pace
- Daily summary: steps, calories, resting HR
- Body composition (if scale syncs to Garmin): weight, body fat

**Activity auto-matching logic:**
```
For each Garmin activity from today:
  1. Check if activity_type matches today's scheduled workout_type
     - 'running' or 'treadmill' → matches 'cardio' or 'long' day
     - 'walking' → matches if Phase 1-2 (walking is the workout)
  2. Check duration is within 50% of planned duration
  3. If match found:
     - Auto-complete the run exercise in workout_logs
     - Set source = 'garmin_auto'
     - Link device_activity_id
     - Show toast: "Your 26-min treadmill run was auto-logged ✓"
  4. If no match: surface in Today tab as "Unmatched activity"
     - Let user manually assign it to a workout slot
```

#### Step 3.2: iFit → Garmin Pipeline

**Simplest path (recommended):**
1. In iFit app on phone: Settings → Connected Apps → Connect Garmin
2. Every treadmill session auto-syncs to Garmin Connect
3. Garmin sync script picks it up (no direct iFit integration needed)

**Fallback (if iFit-Garmin sync is unreliable):**
- Manual CSV export from iFit web interface
- Upload to app Settings → Import iFit Data
- Parse CSV, write to activity_logs

#### Step 3.3: Run Progress Visualization

Track running progression against the plan:

```
Week 1:  ████░░░░░░░░░░░░░░░░░░░░░  2 min jog intervals
Week 12: ████████████░░░░░░░░░░░░░░  12 min continuous
Week 24: ████████████████████░░░░░░  21 min continuous
Week 36: █████████████████████████░  35 min (~3 mi)
Week 52: █████████████████████████████ 55 min (5 miles!) 🎯
         ──────────────────────────────
         0    10    20    30    40    50 min
```

Display actual Garmin data overlaid on planned progression curve.

#### Phase 3 Acceptance Criteria
- [ ] Garmin activities appear in app within hours of syncing
- [ ] Treadmill runs auto-match to scheduled workout
- [ ] Run exercise auto-completes when Garmin confirms it
- [ ] Running progression chart shows actual vs planned
- [ ] Steps and daily HR visible in Body tab
- [ ] iFit treadmill data flows through Garmin Connect
- [ ] Activity history searchable and viewable

---

### Phase 4: Smart Coaching + Labs (Priority: FUTURE)
**Goal:** Contextual recommendations. Function Health integration. Weekly reports.

#### Step 4.1: Coaching Rules Engine

A simple rules engine that evaluates daily context and generates recommendations:

```js
// Example rules (expand over time)
const rules = [
  {
    id: 'low_readiness_long_run',
    condition: (ctx) => ctx.readiness < 60 && ctx.todayType === 'long',
    recommendation: "Oura readiness is {readiness}. Consider swapping today's long run for a 20-min recovery walk + full mobility flow.",
    priority: 'high',
  },
  {
    id: 'missed_strength_streak',
    condition: (ctx) => ctx.consecutiveMissedStrength >= 2,
    recommendation: "You've missed {count} strength sessions. Your Copenhagen adductors and eccentric calf raises are your injury insurance — prioritize Day B this week.",
    priority: 'high',
  },
  {
    id: 'weight_plateau',
    condition: (ctx) => ctx.weightChangeLast4Weeks < 0.5 && ctx.weightChangeLast4Weeks > -0.5,
    recommendation: "Weight has been stable for 4 weeks. This is normal in Phase {phase}. Focus on performance gains (run duration, strength progression) rather than the scale.",
    priority: 'low',
  },
  {
    id: 'sleep_deficit',
    condition: (ctx) => ctx.avgSleepLast3Days < 360, // less than 6 hours
    recommendation: "Averaging {hours}h sleep over the past 3 nights. Sleep is when your body adapts to training. Consider a rest day or light session.",
    priority: 'medium',
  },
  {
    id: 'hrv_trending_down',
    condition: (ctx) => ctx.hrvTrend7Day < -10, // 10ms drop over 7 days
    recommendation: "HRV has been declining this week. Your body may be accumulating fatigue. Consider reducing volume by 20% this week.",
    priority: 'medium',
  },
  {
    id: 'great_readiness_push',
    condition: (ctx) => ctx.readiness >= 85 && ctx.todayType,
    recommendation: "Readiness is excellent at {readiness}. Great day to push a little harder — add 2-3 min to your run or an extra set on strength.",
    priority: 'low',
  },
];
```

#### Step 4.2: Function Health Lab Import

**Semi-manual process (labs happen 2x/year):**

1. After lab draw, run the function-health-exporter CLI tool:
   ```bash
   # On Mac Mini
   npx function-health-exporter --output $PROJECTS/fitness-health-app/data/labs/
   ```
   Or use the Chrome extension to export CSV.

2. Upload to app via Settings → Import Labs
3. Parse and write to `lab_results` table
4. Display in Insights tab:
   - Biomarker categories with traffic-light status
   - Trend arrows for biomarkers with multiple readings
   - Flag any out-of-range markers relevant to fitness:
     - Inflammation markers (hsCRP, ESR) → training load concern
     - Metabolic markers (fasting glucose, HbA1c, insulin) → fuel/recovery
     - Hormones (testosterone, cortisol) → recovery capacity
     - Cardiovascular (ApoB, LDL-P, Lp(a)) → heart health baseline
     - Vitamin D, B12, iron/ferritin → energy and performance

#### Step 4.3: Weekly Report (Email via Gmail MCP)

Every Sunday evening, Mac Mini cron job generates and emails a weekly summary:

```
Subject: Week 12 Recap — Return to Fitness

WORKOUTS: 2/3 completed (Day C missed)
  ✅ Day A: Treadmill 25 min (Garmin: 26:12, avg HR 142)
  ✅ Day B: Strength — all exercises completed
  ❌ Day C: Long run — not completed

BODY:
  Weight: 237.4 → 236.8 (↓ 0.6 lbs)
  Avg Sleep: 6.8h | Avg HRV: 38ms | Avg Readiness: 72

RUNNING PROGRESS:
  Best continuous run: 25 min @ 12:30/mi pace
  Phase 2 target: 30 min continuous by Week 16

NEXT WEEK (Week 13):
  Day A: Treadmill 27 min continuous
  Day B: Strength (same as this week)
  Day C: Long run 30 min + agility work

COACHING NOTE:
  You missed Day C this week. Consider scheduling it for
  Saturday morning before your son wakes up. Your Oura data
  shows your best readiness scores are on Saturday mornings.
```

**Implementation:**
```bash
# Mac Mini cron: Sundays at 8 PM
0 20 * * 0 claude -p --model sonnet "Generate the weekly fitness report for Mateus using the data in Supabase for the current week. Email it via Gmail MCP to mattlima94@gmail.com." --max-budget-usd 0.50
```

#### Step 4.4: Google Calendar Integration

Sync planned workouts to Google Calendar so they show as blocks:

```
Monday:    🏃 Day A — Cardio (30 min) [7:00 AM]
Wednesday: 💪 Day B — Strength (35 min) [7:00 AM]
Saturday:  🏃‍♂️ Day C — Long Run + Agility (60 min) [8:00 AM]
```

Use Google Calendar MCP to create/update events. Color-code by workout type.

#### Phase 4 Acceptance Criteria
- [ ] Coaching recommendations appear on Today page
- [ ] Recommendations adapt based on Oura + workout history
- [ ] Function Health labs viewable in Insights tab
- [ ] Weekly email report sends automatically
- [ ] Workouts appear on Google Calendar
- [ ] System handles missed data gracefully (no Oura data = skip readiness, don't crash)

---

## Key UX Principles

1. **Open and go.** The Today tab should tell Mateus everything he needs in 3 seconds: readiness, today's workout, latest weight. No scrolling required for the essentials.

2. **Passive over active.** Every data point that can come from a device should. Manual entry is the fallback, not the default. The app should feel like it already knows what happened.

3. **One-tap completion.** Checking off an exercise should be a single tap. No confirmation dialogs. Undo available for 5 seconds via toast.

4. **Injury-aware always.** Every workout view shows the relevant red flag warnings. Phase-appropriate tips are always visible (conversational pace reminder in Phase 1-2, warm-up reminder in Phase 3-4).

5. **Progress is visible.** The 52-week journey should feel tangible. Running duration trend, weight trend, phase completion — always one swipe away.

6. **Graceful degradation.** If Oura is dead, the app works. If WiFi is down, the app works (service worker). If a sync fails, the app shows last-known data with a "last synced" timestamp.

---

## Files to Reference

The following files are uploaded alongside this plan:
- `fitness_tracker.html` — Current app. Extract the `P[]` workout data array, `PHASES` array, `MILESTONES` object, `PHASE_FOCUS` object, and `RED_FLAGS` array.
- `fitness_plan__1_.xlsx` — Detailed Excel workbook with the full 52-week program.
- `google_apps_script.js` — Current Google Sheets sync script. Can be retired after Supabase migration, or kept as secondary backup.

---

## Maintenance and Iteration

After initial build, the workflow for changes is:

1. **UI tweaks:** Edit React components via Claude Code → auto-deploys on push to GitHub → live on Vercel in ~30 seconds
2. **Workout plan changes:** Update `workout_plans` table in Supabase directly (no redeploy needed)
3. **Add new data source:** New cron script on Mac Mini + new Supabase table + new React component
4. **Coaching rules:** Add to the rules array in the coaching engine module

**This is designed to be a living system that Mateus and Claude Code evolve together over time.**
