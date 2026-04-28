import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  pushMetric,
  pushGlp1Dose,
  deleteGlp1Dose,
  setWorkoutCompletion,
} from './syncService';

// Supabase is the source of truth for metrics, glp1Logs, and completedExercises.
// We keep the rest (currentWeek / programStartDate / UI state) in localStorage
// so the app boots with the right phase and tab even before hydration completes.
export const useStore = create(
  persist(
    (set, get) => ({
      currentWeek: 1,
      programStartDate: null,

      completedExercises: {},
      metrics: [],
      glp1Logs: [],
      isHydrated: false,

      activeTab: 'today',
      selectedDay: null,
      showTimer: false,
      timerDuration: 60,
      weekPickerOpen: false,

      setCurrentWeek: (week) => set({ currentWeek: Math.max(1, Math.min(52, week)) }),
      setStartDate: (date) => set({ programStartDate: date }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedDay: (day) => set({ selectedDay: day }),

      hydrate: (snapshot, opts = {}) =>
        set((state) => {
          if (opts.merge) {
            return {
              metrics: snapshot.metrics ?? state.metrics,
              glp1Logs: snapshot.glp1Logs ?? state.glp1Logs,
              completedExercises:
                snapshot.completedExercises ?? state.completedExercises,
              isHydrated: true,
            };
          }
          return {
            metrics: snapshot.metrics ?? [],
            glp1Logs: snapshot.glp1Logs ?? [],
            completedExercises: snapshot.completedExercises ?? {},
            isHydrated: true,
          };
        }),

      toggleExercise: (week, dayIdx, exIdx) => {
        const key = `${week}-${dayIdx}-${exIdx}`;
        const wasCompleted = !!get().completedExercises[key];
        set((state) => {
          const updated = { ...state.completedExercises };
          if (wasCompleted) delete updated[key];
          else updated[key] = new Date().toISOString();
          return { completedExercises: updated };
        });
        setWorkoutCompletion(week, dayIdx, exIdx, !wasCompleted).catch((e) =>
          console.error('[store] toggleExercise sync', e)
        );
      },

      isExerciseCompleted: (week, dayIdx, exIdx) =>
        !!get().completedExercises[`${week}-${dayIdx}-${exIdx}`],

      getDayProgress: (week, dayIdx, totalExercises) => {
        let done = 0;
        for (let i = 0; i < totalExercises; i++) {
          if (get().completedExercises[`${week}-${dayIdx}-${i}`]) done++;
        }
        return totalExercises > 0 ? done / totalExercises : 0;
      },

      getWeekProgress: (week, plan) => {
        if (!plan || !plan[week]) return 0;
        let done = 0,
          total = 0;
        plan[week].forEach((day, dayIdx) => {
          total += day.exercises.length;
          day.exercises.forEach((_, exIdx) => {
            if (get().completedExercises[`${week}-${dayIdx}-${exIdx}`]) done++;
          });
        });
        return total > 0 ? done / total : 0;
      },

      getStreak: (plan) => {
        const state = get();
        let streak = 0;
        for (let w = state.currentWeek; w >= 1; w--) {
          if (!plan || !plan[w]) break;
          let daysWithProgress = 0;
          plan[w].forEach((day, dayIdx) => {
            const hasAny = day.exercises.some((_, exIdx) =>
              state.completedExercises[`${w}-${dayIdx}-${exIdx}`]
            );
            if (hasAny) daysWithProgress++;
          });
          if (daysWithProgress >= 2) streak++;
          else if (w < state.currentWeek) break;
          else break;
        }
        return streak;
      },

      addMetric: (metric) => {
        const enriched = {
          ...metric,
          date: metric.date || new Date().toISOString().split('T')[0],
        };
        set((state) => ({ metrics: [...state.metrics, enriched] }));
        pushMetric(enriched).catch((e) =>
          console.error('[store] addMetric sync', e)
        );
      },

      getLatestMetric: () => {
        const metrics = get().metrics;
        return metrics.length > 0 ? metrics[metrics.length - 1] : null;
      },

      getWeightTrend: (count = 20) =>
        get().metrics.filter((m) => m.weight).slice(-count),

      addGlp1Log: (log) => {
        const enriched = {
          ...log,
          date: log.date || new Date().toISOString().split('T')[0],
        };
        set((state) => ({ glp1Logs: [...state.glp1Logs, enriched] }));
        pushGlp1Dose(enriched).catch((e) =>
          console.error('[store] addGlp1Log sync', e)
        );
      },

      deleteGlp1Log: (date) => {
        set((state) => ({
          glp1Logs: state.glp1Logs.filter((l) => l.date !== date),
        }));
        deleteGlp1Dose(date).catch((e) =>
          console.error('[store] deleteGlp1Log sync', e)
        );
      },

      getLatestGlp1Log: () => {
        const logs = get().glp1Logs;
        if (logs.length === 0) return null;
        return [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
      },

      getDaysSinceLastGlp1: () => {
        const latest = get().getLatestGlp1Log();
        if (!latest) return null;
        const last = new Date(latest.date);
        const today = new Date();
        const diffMs = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
      },

      toggleTimer: () => set((s) => ({ showTimer: !s.showTimer })),
      setTimerDuration: (d) => set({ timerDuration: d }),
      toggleWeekPicker: () => set((s) => ({ weekPickerOpen: !s.weekPickerOpen })),
    }),
    {
      name: 'fitness-store',
      // Persist only profile + UI scaffolding. metrics, glp1Logs, and
      // completedExercises are owned by Supabase and rehydrated on every
      // launch, so we deliberately exclude them from localStorage.
      partialize: (state) => ({
        currentWeek: state.currentWeek,
        programStartDate: state.programStartDate,
      }),
    }
  )
);
