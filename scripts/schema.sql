-- ============================================================
-- Fitness Health App — Supabase Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- User profile (single user, but structured for proper auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT DEFAULT 'Mateus',
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 52),
  program_start_date DATE,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- The 52-week workout plan (seeded from the HTML file's P[] array)
CREATE TABLE IF NOT EXISTS workout_plans (
  id SERIAL PRIMARY KEY,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 52),
  day_index INTEGER NOT NULL,
  day_label TEXT NOT NULL,
  day_description TEXT,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('cardio', 'strength', 'long')),
  exercises JSONB NOT NULL,
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  UNIQUE(week, day_index)
);

-- Exercise completion log
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  week INTEGER NOT NULL,
  day_index INTEGER NOT NULL,
  exercise_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual',
  device_activity_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week, day_index, exercise_index)
);

-- Body metrics (weight, waist, body fat)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  week INTEGER,
  weight_lbs NUMERIC(5,1),
  waist_inches NUMERIC(4,1),
  body_fat_pct NUMERIC(4,1),
  notes TEXT,
  source TEXT DEFAULT 'manual',
  device_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sleep data from Oura
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL UNIQUE,
  sleep_score INTEGER,
  total_sleep_minutes INTEGER,
  rem_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  resting_hr INTEGER,
  hrv_average INTEGER,
  temperature_deviation NUMERIC(3,2),
  respiratory_rate NUMERIC(4,1),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily readiness from Oura
CREATE TABLE IF NOT EXISTS readiness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL UNIQUE,
  readiness_score INTEGER,
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

-- Activity data from Garmin
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  activity_type TEXT,
  duration_minutes INTEGER,
  distance_miles NUMERIC(5,2),
  calories INTEGER,
  avg_hr INTEGER,
  max_hr INTEGER,
  avg_pace_min_per_mile NUMERIC(5,2),
  elevation_gain_ft INTEGER,
  source TEXT DEFAULT 'garmin',
  external_id TEXT UNIQUE,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function Health lab results
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  test_date DATE NOT NULL,
  category TEXT NOT NULL,
  biomarker TEXT NOT NULL,
  value TEXT NOT NULL,
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

-- Device sync tracking
CREATE TABLE IF NOT EXISTS device_sync_log (
  id SERIAL PRIMARY KEY,
  device TEXT NOT NULL,
  sync_type TEXT,
  records_synced INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can read plans" ON workout_plans FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read own logs" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON workout_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own metrics" ON metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own sleep" ON sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep" ON sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own readiness" ON readiness_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness" ON readiness_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own activities" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own labs" ON lab_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own labs" ON lab_results FOR INSERT WITH CHECK (auth.uid() = user_id);
