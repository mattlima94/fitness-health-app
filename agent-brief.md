# Agent Brief — Return to Fitness

## Who is Mateus?
- **Age:** 32, anesthesiologist based in Coral Springs, Florida
- **Background:** Former athlete (competitive running + recreational soccer)
- **Injury history:** Knee and ankle injuries that ended his athletic activities
- **Life context:** Medical practice + side consulting business (MCL Health Consulting) + 2-year-old son = severely time-constrained
- **Motivation:** Wants to run 5 miles again, play casual soccer without injury, lose weight, build muscle, prevent re-injury

## The 52-Week Program
A phased "Return to Fitness" plan designed around Mateus's injury history and time constraints:

### Phase 1: Foundation (Weeks 1-8)
- Walking-only cardio (20-50 min treadmill)
- Bodyweight basics (wall push-ups, chair squats, glute bridges)
- Mobility focus (hip 90/90, ankle circles, cat-cow)
- Goal: Build the habit, wake up stabilizers, zero pain

### Phase 2: Building (Weeks 9-20)
- Walk/jog intervals progressing from 4:1 to 1:5 ratio
- Real strength training begins (goblet squats, DB RDLs, Bulgarian split squats)
- Prehab focus: Copenhagen adductors, eccentric calf raises
- Goal: Jog 12-15 min continuous, no joint pain

### Phase 3: Comeback (Weeks 21-36)
- Continuous running builds from 15 to 35 min
- Agility drills, lateral shuffles, ball work introduced
- Tempo runs begin (2-3x3 min tempo intervals)
- Goal: Run 30-35 min (~3 miles), agility at 75-80%

### Phase 4: Return to Play (Weeks 37-52)
- Running builds to 55 min (5 miles)
- Full soccer reintroduction (casual 3v3/4v4)
- Band-assisted pull-ups, advanced core work
- Goal: Run 5 miles continuously, play soccer without injury

3 workouts per week: Day A (Cardio), Day B (Strength), Day C (Long/Weekend)

## Infrastructure
- **Mac Mini M4 Pro 48GB:** Always-on home server, Tailscale VPN, SSH via Termius
- **Claude Code CLI:** Primary development tool with 6 MCP integrations:
  - Gmail (weekly reports, notifications)
  - Google Calendar (workout scheduling)
  - Vercel (deployment)
  - GitHub (code management)
  - Supabase (database)
  - Perplexity (research)
- **Google Drive:** Mirror mode — all Drive files available locally on Mac Mini

## Device Ecosystem
| Device | Data | Sync Path |
|--------|------|-----------|
| Omron WiFi Scale | Weight, body fat % | Omron Connect → Health Connect → Garmin Connect → Garmin API → Supabase |
| Omron BP Cuff | Systolic, diastolic, pulse | Omron Connect → Health Connect → Garmin Connect → Garmin API → Supabase |
| Garmin Watch | Runs, HR, steps, activity | Garmin Connect → Garmin API → Supabase |
| Oura Ring | Sleep, HRV, readiness, temp | Oura API (direct OAuth2) → Supabase |
| NordicTrack Treadmill | Treadmill sessions | iFit → Garmin Connect → Garmin API → Supabase |
| Function Health | 160+ biomarkers (2x/year) | Semi-manual export (CLI/Chrome ext) → Supabase |

**Phone:** Google Pixel (Android) — Health Connect is the Android hub for Omron and Garmin data.
**No Apple products in the stack.**

**Data Pipeline:** Mac Mini cron jobs pull from Garmin API and Oura API daily → write to Supabase. Scale and BP data flow through Health Connect → Garmin Connect as intermediary.

## What Was Built (Phase 1 — March 14, 2026)
- React SPA with Vite, Tailwind CSS v4, Zustand, Recharts, React Router
- 5-tab PWA: Today (dashboard), Workout (plan + checklist), Body (metrics + chart), Insights (phases + milestones), Settings
- Full 52-week workout data extracted from original HTML tracker (all 156 workout days, every exercise with concrete values)
- Exercise completion toggle (single tap), rest timer, week picker, phase navigation
- Manual weight/waist entry with Recharts trend chart
- PWA with service worker, offline caching, installable
- Deployed to Vercel: https://fitness-health-app.vercel.app
- GitHub: https://github.com/mattlima94/fitness-health-app

## What's Planned

### Phase 2: WiFi Scale + Oura Integration
- Omron WiFi scale auto-sync (weight, body fat) via Garmin Connect pipeline
- Omron BP cuff data (systolic, diastolic, pulse) — new blood_pressure table
- Oura Ring API integration (sleep, HRV, readiness) via Mac Mini cron
- Morning briefing card on Today tab (readiness score, sleep quality, recommendation)
- Readiness-based workout modification suggestions

### Phase 3: Garmin + iFit Integration
- Garmin Connect API for run data (distance, pace, HR)
- Auto-match Garmin activities to scheduled workouts
- iFit treadmill data via Garmin Connect relay
- Running progression visualization (actual vs planned)

### Phase 4: Smart Coaching + Labs
- Rules-based coaching engine (readiness-adjusted recommendations)
- Function Health lab result display and tracking
- Weekly email report via Gmail MCP (workout summary, metrics, coaching note)
- Google Calendar workout sync

## Key Decisions and Why
| Decision | Rationale |
|----------|----------|
| React SPA over Next.js | Single-user app, no SSR needed, faster iteration with Claude Code |
| Vite over CRA/Webpack | Fast dev server, excellent PWA plugin, small bundles |
| Tailwind CSS v4 | Rapid iteration, consistent tokens, Claude writes it fluently |
| Zustand over Redux | 1kb, simple API, easy Supabase persistence |
| Recharts over Chart.js/D3 | React-native, responsive, well-documented |
| Supabase over Firebase | Already have infrastructure, PostgreSQL flexibility, better MCP |
| Hash routing | Better PWA compatibility, simpler deployment |
| Health Connect as hub | Android-native, bridges Omron and Garmin ecosystems |
| Oura direct API | Only device with a clean direct OAuth2 API, no intermediary needed |

## Design Philosophy
1. **Passive data over manual entry** — every metric that can come from a device should
2. **One-tap completion** — checking off an exercise is a single tap, no confirmations
3. **Injury-aware always** — red flags visible on every workout view
4. **Open and go** — Today tab shows everything needed in 3 seconds
5. **Progress is visible** — 52-week journey is always tangible
6. **Graceful offline** — app works without internet, syncs when reconnected
