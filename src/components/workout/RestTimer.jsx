import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function RestTimer() {
  const toggleTimer = useStore((s) => s.toggleTimer);
  const timerDuration = useStore((s) => s.timerDuration);
  const setTimerDuration = useStore((s) => s.setTimerDuration);

  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Reset time when duration changes
  useEffect(() => {
    setTimeLeft(timerDuration);
    setIsRunning(false);
  }, [timerDuration]);

  // Timer interval
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Subtle vibration on completion
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(timerDuration);
  };

  const handlePreset = (duration) => {
    setTimerDuration(duration);
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = (1 - timeLeft / timerDuration) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={toggleTimer}
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 relative text-white"
      >
        {/* Close Button */}
        <button
          onClick={toggleTimer}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          <X size={24} />
        </button>

        {/* Circular Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-56 h-56">
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 200 200"
            >
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--phase-accent)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercent / 100)}`}
                strokeLinecap="round"
                style={{
                  transition: isRunning ? 'none' : 'stroke-dashoffset 0.3s ease',
                }}
              />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-6xl font-bold tracking-tight text-white">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-xs text-white/60 mt-2">
                {isRunning ? 'Running' : 'Paused'}
              </p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 mb-6">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex-1 px-4 py-3 rounded-lg bg-[var(--phase-accent)] text-black font-semibold transition-all hover:opacity-90"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 px-4 py-3 rounded-lg bg-[var(--phase-accent)] text-black font-semibold transition-all hover:opacity-90"
            >
              Start
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white font-semibold transition-all hover:bg-white/15"
          >
            Reset
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[30, 60, 90, 120].map((duration) => (
            <button
              key={duration}
              onClick={() => handlePreset(duration)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                timerDuration === duration
                  ? 'bg-[var(--phase-accent)] text-black'
                  : 'bg-white/10 text-white'
              }`}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
