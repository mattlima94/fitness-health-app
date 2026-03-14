import { useStore } from '../../lib/store'

export default function Toast() {
  const toast = useStore((s) => s.toast)
  if (!toast) return null

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-opacity duration-300"
      style={{ background: toast.isError ? '#C62828' : '#2E7D32', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
    >
      {toast.message}
    </div>
  )
}
