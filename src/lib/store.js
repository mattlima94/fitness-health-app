import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
  // App state
  currentWeek: 1,
  completedExercises: {},
  metrics: [],
  glp1Doses: [],
  labResults: [],
  loading: true,
  authenticated: false,

  // UI state
  selectedDay: null,
  showTimer: false,
  timerSeconds: 60,
  timerRunning: false,
  weekPickerOpen: false,
  toast: null,

  // Actions
  setCurrentWeek: (week) => {
    set({ currentWeek: week, weekPickerOpen: false })
    const userId = get().userId
    if (userId) {
      supabase.from('profiles').update({ current_week: week }).eq('id', userId).then()
    }
  },

  toggleExercise: (week, dayIndex, exerciseIndex) => {
    const key = `${week}-${dayIndex}-${exerciseIndex}`
    const completed = { ...get().completedExercises }
    completed[key] = !completed[key]
    set({ completedExercises: completed })

    const userId = get().userId
    if (userId) {
      const isComplete = completed[key]
      if (isComplete) {
        supabase.from('workout_logs').upsert({
          user_id: userId,
          week,
          day_index: dayIndex,
          exercise_index: exerciseIndex,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,week,day_index,exercise_index' }).then()
      } else {
        supabase.from('workout_logs').update({ completed: false, completed_at: null })
          .match({ user_id: userId, week, day_index: dayIndex, exercise_index: exerciseIndex }).then()
      }
    }
  },

  addMetric: async (metric) => {
    const userId = get().userId
    const date = metric.date || new Date().toISOString().split('T')[0]
    const row = {
      user_id: userId,
      date,
      week: get().currentWeek,
      weight_lbs: metric.weight || null,
      waist_inches: metric.waist || null,
      body_fat_pct: metric.bodyFat || null,
      muscle_mass_lbs: metric.muscleMass || null,
      bone_mass_lbs: metric.boneMass || null,
      water_pct: metric.waterPct || null,
      visceral_fat: metric.visceralFat || null,
      bmr: metric.bmr || null,
      metabolic_age: metric.metabolicAge || null,
      source: 'manual',
    }

    const { data } = await supabase.from('metrics').insert(row).select().single()
    if (data) {
      set({ metrics: [data, ...get().metrics] })
    }
  },

  // GLP-1 doses
  addGlp1Dose: async (dose) => {
    const userId = get().userId
    const row = {
      user_id: userId,
      dose_date: dose.date,
      medication: dose.medication || 'Mounjaro',
      dosage_mg: dose.dosage || 7.5,
      route: dose.route || 'SQ',
      injection_site: dose.site || null,
      side_effects: dose.sideEffects || null,
      notes: dose.notes || null,
    }
    const { data } = await supabase.from('glp1_doses').upsert(row, { onConflict: 'user_id,dose_date' }).select().single()
    if (data) {
      const doses = [data, ...get().glp1Doses.filter(d => d.dose_date !== data.dose_date)]
      doses.sort((a, b) => b.dose_date.localeCompare(a.dose_date))
      set({ glp1Doses: doses })
    }
  },

  deleteGlp1Dose: async (id) => {
    await supabase.from('glp1_doses').delete().eq('id', id)
    set({ glp1Doses: get().glp1Doses.filter(d => d.id !== id) })
  },

  // Lab results
  addLabResult: async (lab) => {
    const userId = get().userId
    const row = {
      user_id: userId,
      test_date: lab.testDate,
      category: lab.category,
      biomarker: lab.biomarker,
      value: lab.value,
      numeric_value: lab.numericValue || null,
      unit: lab.unit || null,
      reference_range: lab.referenceRange || null,
      optimal_range_min: lab.optimalMin || null,
      optimal_range_max: lab.optimalMax || null,
      status: lab.status || null,
      out_of_range_direction: lab.direction || null,
    }
    const { data } = await supabase.from('lab_results').upsert(row, { onConflict: 'user_id,test_date,biomarker' }).select().single()
    if (data) {
      const labs = [data, ...get().labResults.filter(l => !(l.test_date === data.test_date && l.biomarker === data.biomarker))]
      labs.sort((a, b) => b.test_date.localeCompare(a.test_date) || a.category.localeCompare(b.category))
      set({ labResults: labs })
    }
  },

  showToast: (message, isError = false) => {
    set({ toast: { message, isError } })
    setTimeout(() => set({ toast: null }), 2500)
  },

  // Timer
  startTimer: (seconds = 60) => set({ showTimer: true, timerSeconds: seconds, timerRunning: true }),
  stopTimer: () => set({ showTimer: false, timerRunning: false }),
  tickTimer: () => {
    const s = get().timerSeconds - 1
    if (s <= 0) {
      set({ showTimer: false, timerRunning: false, timerSeconds: 0 })
      get().showToast('Rest complete!')
    } else {
      set({ timerSeconds: s })
    }
  },

  // Auth
  userId: null,
  setUserId: (id) => set({ userId: id }),

  // Load from Supabase
  loadData: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        set({ loading: false, authenticated: false })
        return
      }

      const user = session.user
      set({ userId: user.id, authenticated: true })

      // Ensure profile exists (auto-create on first login)
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          name: 'Mateus',
          current_week: 1,
          program_start_date: '2026-04-06',
        })
      }

      const [profileRes, logsRes, metricsRes, glp1Res, labsRes] = await Promise.all([
        supabase.from('profiles').select('current_week, program_start_date').eq('id', user.id).single(),
        supabase.from('workout_logs').select('*').eq('user_id', user.id),
        supabase.from('metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(60),
        supabase.from('glp1_doses').select('*').eq('user_id', user.id).order('dose_date', { ascending: false }).limit(52),
        supabase.from('lab_results').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
      ])

      const completed = {}
      if (logsRes.data) {
        logsRes.data.forEach((log) => {
          if (log.completed) {
            completed[`${log.week}-${log.day_index}-${log.exercise_index}`] = true
          }
        })
      }

      // Auto-calculate current week from program_start_date
      let currentWeek = profileRes.data?.current_week || 1
      if (profileRes.data?.program_start_date) {
        const start = new Date(profileRes.data.program_start_date + 'T00:00:00')
        const now = new Date()
        const diffMs = now - start
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
        if (diffWeeks >= 1 && diffWeeks <= 52) {
          currentWeek = diffWeeks
        } else if (diffWeeks < 1) {
          currentWeek = 1
        }
      }

      set({
        currentWeek,
        completedExercises: completed,
        metrics: metricsRes.data || [],
        glp1Doses: glp1Res.data || [],
        labResults: labsRes.data || [],
        loading: false,
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      set({ loading: false, authenticated: false })
    }
  },

  // Sign out
  signOut: async () => {
    await supabase.auth.signOut()
    set({
      authenticated: false,
      userId: null,
      completedExercises: {},
      metrics: [],
      glp1Doses: [],
      labResults: [],
      currentWeek: 1,
    })
  },
}))
