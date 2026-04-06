import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

const PIN = '9404';
const SESSION_KEY = 'fitness_pin_ok';

export function isPinVerified() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export default function PinGate({ children }) {
  const [verified, setVerified] = useState(isPinVerified());
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!verified && inputRef.current) {
      inputRef.current.focus();
    }
  }, [verified]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setVerified(true);
    } else {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        // Auto-submit when 4 digits entered
        setTimeout(() => {
          if (next === PIN) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setVerified(true);
          } else {
            setError(true);
            setShake(true);
            setPin('');
            setTimeout(() => setShake(false), 500);
            setTimeout(() => setError(false), 2000);
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  if (verified) return children;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: '#0a0a14' }}>
      <div className={`w-full max-w-[320px] flex flex-col items-center gap-8 ${shake ? 'animate-shake' : ''}`}>
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Lock size={28} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#e0e0ec' }}>Return to Fitness</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Enter PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full transition-all duration-200"
              style={{
                background: i < pin.length
                  ? error ? '#EF5350' : '#66BB6A'
                  : 'rgba(255,255,255,0.1)',
                transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-5">
          {error && (
            <p className="text-sm" style={{ color: '#EF5350' }}>Wrong PIN</p>
          )}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back'].map((key, idx) => {
            if (key === null) return <div key={idx} />;
            if (key === 'back') {
              return (
                <button
                  key={idx}
                  onClick={handleBackspace}
                  className="h-14 rounded-xl flex items-center justify-center text-lg transition-colors"
                  style={{
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  ←
                </button>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleDigit(String(key))}
                className="h-14 rounded-xl flex items-center justify-center text-lg font-medium transition-colors active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e0e0ec',
                }}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Hidden form for password managers */}
        <form onSubmit={handleSubmit} className="sr-only">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            autoComplete="current-password"
          />
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
