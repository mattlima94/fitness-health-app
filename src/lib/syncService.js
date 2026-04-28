import { supabase, USER_ID } from './supabase';

function metricFromRow(row) {
  return {
    date: row.date,
    week: row.week,
    weight: row.weight_lbs != null ? Number(row.weight_lbs) : null,
    waist: row.waist_inches != null ? Number(row.waist_inches) : null,
    notes: row.notes,
  };
}

function metricToRow(m) {
  return {
    user_id: USER_ID,
    date: m.date,
    week: m.week ?? null,
    weight_lbs: m.weight ?? null,
    waist_inches: m.waist ?? null,
    notes: m.notes ?? null,
    source: 'manual',
  };
}

function glp1FromRow(row) {
  return {
    date: row.dose_date,
    week: row.raw_data?.week ?? null,
    dose: row.dosage_mg != null ? Number(row.dosage_mg) : null,
    medication: row.medication,
    site: row.injection_site,
    sideEffects: row.side_effects,
    notes: row.notes,
  };
}

function glp1ToRow(log) {
  return {
    user_id: USER_ID,
    dose_date: log.date,
    medication: log.medication ?? 'Mounjaro',
    dosage_mg: log.dose,
    route: 'subcutaneous',
    injection_site: log.site ?? null,
    side_effects: log.sideEffects ?? null,
    notes: log.notes ?? null,
    raw_data: log.week != null ? { week: log.week } : null,
  };
}

function workoutKey(week, dayIdx, exIdx) {
  return `${week}-${dayIdx}-${exIdx}`;
}

export async function pullSnapshot() {
  if (!supabase) {
    return { metrics: [], glp1Logs: [], completedExercises: {} };
  }

  const [metricsRes, glp1Res, workoutsRes] = await Promise.all([
    supabase
      .from('metrics')
      .select('date, week, weight_lbs, waist_inches, notes')
      .eq('user_id', USER_ID)
      .order('date', { ascending: true }),
    supabase
      .from('glp1_doses')
      .select('dose_date, medication, dosage_mg, injection_site, side_effects, notes, raw_data')
      .eq('user_id', USER_ID)
      .order('dose_date', { ascending: true }),
    supabase
      .from('workout_logs')
      .select('week, day_index, exercise_index, completed, completed_at')
      .eq('user_id', USER_ID)
      .eq('completed', true),
  ]);

  if (metricsRes.error) console.error('[sync] metrics pull failed', metricsRes.error);
  if (glp1Res.error) console.error('[sync] glp1 pull failed', glp1Res.error);
  if (workoutsRes.error) console.error('[sync] workouts pull failed', workoutsRes.error);

  const metrics = (metricsRes.data || []).map(metricFromRow);
  const glp1Logs = (glp1Res.data || []).map(glp1FromRow);
  const completedExercises = {};
  for (const r of workoutsRes.data || []) {
    completedExercises[workoutKey(r.week, r.day_index, r.exercise_index)] =
      r.completed_at || new Date().toISOString();
  }

  return { metrics, glp1Logs, completedExercises };
}

export async function pushMetric(metric) {
  if (!supabase) return;
  const { error } = await supabase.from('metrics').insert(metricToRow(metric));
  if (error) console.error('[sync] pushMetric failed', error);
}

export async function pushGlp1Dose(log) {
  if (!supabase) return;
  const { error } = await supabase.from('glp1_doses').insert(glp1ToRow(log));
  if (error) console.error('[sync] pushGlp1Dose failed', error);
}

export async function deleteGlp1Dose(date) {
  if (!supabase) return;
  const { error } = await supabase
    .from('glp1_doses')
    .delete()
    .eq('user_id', USER_ID)
    .eq('dose_date', date);
  if (error) console.error('[sync] deleteGlp1Dose failed', error);
}

export async function setWorkoutCompletion(week, dayIdx, exIdx, completed) {
  if (!supabase) return;
  if (completed) {
    const { error } = await supabase.from('workout_logs').insert({
      user_id: USER_ID,
      week,
      day_index: dayIdx,
      exercise_index: exIdx,
      completed: true,
      completed_at: new Date().toISOString(),
      source: 'manual',
    });
    if (error) console.error('[sync] workout insert failed', error);
  } else {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('user_id', USER_ID)
      .eq('week', week)
      .eq('day_index', dayIdx)
      .eq('exercise_index', exIdx);
    if (error) console.error('[sync] workout delete failed', error);
  }
}

// Reads the legacy localStorage 'fitness-store' key (written by the old
// Zustand persist config), pushes any rows not already in Supabase, then
// records that migration ran. Runs only once per device.
const MIGRATION_FLAG = 'fitness-store-migrated-v1';

export function isMigrationDone() {
  try {
    return localStorage.getItem(MIGRATION_FLAG) === 'true';
  } catch {
    return true;
  }
}

export function markMigrationDone() {
  try {
    localStorage.setItem(MIGRATION_FLAG, 'true');
  } catch {
    /* noop */
  }
}

function readLegacyLocalState() {
  try {
    const raw = localStorage.getItem('fitness-store');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state || null;
  } catch (e) {
    console.warn('[sync] could not parse legacy fitness-store', e);
    return null;
  }
}

export async function migrateLocalToSupabase(existingSnapshot) {
  if (!supabase) return { migrated: { metrics: 0, glp1Logs: 0 } };
  const local = readLegacyLocalState();
  if (!local) return { migrated: { metrics: 0, glp1Logs: 0 } };

  const result = { metrics: 0, glp1Logs: 0 };

  const existingMetricDates = new Set((existingSnapshot.metrics || []).map((m) => m.date));
  const localMetrics = Array.isArray(local.metrics) ? local.metrics : [];
  const metricsToInsert = localMetrics
    .filter((m) => m && m.weight != null && m.date && !existingMetricDates.has(m.date))
    .map(metricToRow);
  if (metricsToInsert.length) {
    const { error } = await supabase.from('metrics').insert(metricsToInsert);
    if (error) console.error('[sync] migrate metrics failed', error);
    else result.metrics = metricsToInsert.length;
  }

  const existingDoseDates = new Set((existingSnapshot.glp1Logs || []).map((l) => l.date));
  const localGlp1 = Array.isArray(local.glp1Logs) ? local.glp1Logs : [];
  const dosesToInsert = localGlp1
    .filter((l) => l && l.dose != null && l.date && !existingDoseDates.has(l.date))
    .map(glp1ToRow);
  if (dosesToInsert.length) {
    const { error } = await supabase.from('glp1_doses').insert(dosesToInsert);
    if (error) console.error('[sync] migrate glp1 failed', error);
    else result.glp1Logs = dosesToInsert.length;
  }

  // Workout completions intentionally NOT migrated (clean slate).

  return { migrated: result };
}
