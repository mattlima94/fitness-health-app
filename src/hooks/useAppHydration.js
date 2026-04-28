import { useEffect } from 'react';
import { useStore } from '../lib/store';
import {
  pullSnapshot,
  migrateLocalToSupabase,
  isMigrationDone,
  markMigrationDone,
} from '../lib/syncService';
import { isSupabaseConnected } from '../lib/supabase';

// Loads the user's metrics, GLP-1 doses, and workout completions from
// Supabase into the Zustand store on app startup. Runs a one-time
// localStorage->Supabase migration on first launch after this version
// ships so existing per-device data is not lost.
export function useAppHydration() {
  const isHydrated = useStore((s) => s.isHydrated);
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isSupabaseConnected()) {
        if (!cancelled) hydrate({ metrics: [], glp1Logs: [], completedExercises: {} }, { merge: true });
        return;
      }

      try {
        const snapshot = await pullSnapshot();

        if (!isMigrationDone()) {
          await migrateLocalToSupabase(snapshot);
          markMigrationDone();
          const refreshed = await pullSnapshot();
          if (!cancelled) hydrate(refreshed);
          return;
        }

        if (!cancelled) hydrate(snapshot);
      } catch (err) {
        console.error('[hydration] failed', err);
        if (!cancelled) hydrate({ metrics: [], glp1Logs: [], completedExercises: {} });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isHydrated;
}
