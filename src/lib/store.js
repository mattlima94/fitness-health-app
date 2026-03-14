import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
  // App state
  currentWeek: 1,
  completedExercises: {},
  metrics: [],
  loading: true,

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
    if (supabase) {
      supabase.from('profiles').update({ current_week: week }).eq('id', get().userId).then()
    }
  },

  toggleExercise: (week, dayIndex, exerciseIndex) => {
    const key = `${week}-${dayIndex}-${exerciseIndex}`
    const completed = { ...get().completedExercises }
    completed[key] = !completed[key]
    set({ completedExercises: completed })

    if (supabase && get().userId) {
      const isComplete = completed[key]
      if (isComplete) {
        supabase.from('workout_logs').upsert({
          user_id: get().userId,
          week,
          day_index: dayIndex,
          exercise_index: exerciseIndex,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,week,day_index,exercise_index' }).then()
      } else {
        supabase.from('workout_logs').update({ completed: false, completed_at: null })
          .match({ user_id: get().userId, week, day_index: dayIndex, exercise_index: exerciseIndex }).then()
      }
    }
  },

  addMetric: async (metric) => {
    const metrics = [...get().metrics, { ...metric, date: new Date().toISOString().split('T')[0] }]
    set({ metrics })

    if (supabase && get().userId) {
      await supabase.from('metrics').insert({
        user_id: get().userId,
        date: metric.date || new Date().toISOString().split('T')[0],
        week: get().currentWeek,
        weight_lbs: metric.weight || null,
        waist_inches: metric.waist || null,
        source: 'manual',
      })
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
    if (!supabase) {
      set({ loading: false })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false })
        return
      }

      set({ userId: user.id })

      const [profileRes, logsRes, metricsRes] = await Promise.all([
        supabase.from('profiles').select('current_week').eq('id', user.id).single(),
        supabase.from('workout_logs').select('*').eq('user_id', user.id),
        supabase.from('metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
      ])

      const completed = {}
      if (logsRes.data) {
        logsRes.data.forEach((log) => {
          if (log.completed) {
            completed[`${log.week}-${log.day_index}-${log.exercise_index}`] = true
          }
        })
      }

      set({
        currentWeek: profileRes.data?.current_week || 1,
        completedExercises: completed,
        metrics: metricsRes.data || [],
        loading: false,
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      set({ loading: false })
    }
  },
}))
