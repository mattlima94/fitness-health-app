import { useStore } from '../../lib/store';
import { useProfile } from '../../hooks/useProfile';
import { Home, Dumbbell, Heart, TrendingUp, Settings } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'body', label: 'Body', icon: Heart },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const { phase } = useProfile();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-[#0a0a14] border-t border-white/6 h-20 flex items-center justify-around px-2 pb-safe">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const iconColor = isActive
          ? phase.accent
          : 'rgba(255, 255, 255, 0.4)';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors duration-200 hover:bg-white/5 active:bg-white/10"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={24}
              strokeWidth={2}
              style={{ color: iconColor }}
            />
            <span
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: iconColor }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
