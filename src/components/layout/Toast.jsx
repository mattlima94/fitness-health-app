import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

let toastListener = null;

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The toast type: 'success', 'error', or 'info' (default: 'success')
 */
export function showToast(message, type = 'success') {
  if (toastListener) {
    toastListener({ message, type });
  }
}

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastListener = (t) => {
      setToast(t);
      const timeout = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timeout);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  if (!toast) return null;

  const baseClasses = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg border backdrop-blur-sm animate-fade-in';

  let bgClasses = '';
  let textColor = '';

  switch (toast.type) {
    case 'error':
      bgClasses = 'bg-red-500/20 border-red-500/30';
      textColor = 'text-red-100';
      break;
    case 'info':
      bgClasses = 'bg-blue-500/20 border-blue-500/30';
      textColor = 'text-blue-100';
      break;
    case 'success':
    default:
      bgClasses = 'bg-green-500/20 border-green-500/30';
      textColor = 'text-green-100';
      break;
  }

  return (
    <div className={`${baseClasses} ${bgClasses} ${textColor} text-sm font-medium shadow-lg flex items-center gap-3 max-w-xs`}>
      <span>{toast.message}</span>
      <button
        onClick={() => setToast(null)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}
