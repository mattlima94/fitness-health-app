import { useStore } from './lib/store';
import { useProfile } from './hooks/useProfile';
import PinGate from './components/PinGate';
import BottomNav from './components/layout/BottomNav';
import TodayPage from './components/today/TodayPage';
import WorkoutPage from './components/workout/WorkoutPage';
import BodyPage from './components/body/BodyPage';
import InsightsPage from './components/insights/InsightsPage';
import SettingsPage from './components/settings/SettingsPage';
import Toast from './components/layout/Toast';

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
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
      {/* Main content area */}
      <main className="w-full">
        {activeTab === 'today' && <TodayPage />}
        {activeTab === 'workout' && <WorkoutPage />}
        {activeTab === 'body' && <BodyPage />}
        {activeTab === 'insights' && <InsightsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Toast notifications */}
      <Toast />
    </div>
    </PinGate>
  );
}
