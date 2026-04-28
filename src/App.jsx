import { useStore } from './lib/store';
import { useProfile } from './hooks/useProfile';
import { useAppHydration } from './hooks/useAppHydration';
import PinGate from './components/PinGate';
import BottomNav from './components/layout/BottomNav';
import TodayPage from './components/today/TodayPage';
import WorkoutPage from './components/workout/WorkoutPage';
import BodyPage from './components/body/BodyPage';
import InsightsPage from './components/insights/InsightsPage';
import SettingsPage from './components/settings/SettingsPage';
import Toast from './components/layout/Toast';

function HydrationSplash() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a14', color: 'rgba(255,255,255,0.5)' }}
    >
      <div className="text-sm">Syncing…</div>
    </div>
  );
}

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const isHydrated = useAppHydration();
  const { phase } = useProfile();

  const cssVariables = {
    '--phase-accent': phase.accent,
    '--phase-color': phase.color,
  };

  return (
    <PinGate>
      <div
        className="max-w-[480px] mx-auto pb-24 min-h-screen relative"
        style={cssVariables}
      >
        {!isHydrated ? (
          <HydrationSplash />
        ) : (
          <>
            <main className="w-full">
              {activeTab === 'today' && <TodayPage />}
              {activeTab === 'workout' && <WorkoutPage />}
              {activeTab === 'body' && <BodyPage />}
              {activeTab === 'insights' && <InsightsPage />}
              {activeTab === 'settings' && <SettingsPage />}
            </main>
            <BottomNav />
            <Toast />
          </>
        )}
      </div>
    </PinGate>
  );
}
