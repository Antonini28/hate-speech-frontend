const STATUS = {
  checking: {
    dot: 'bg-yellow-400 animate-pulse',
    text: 'Checking model server…',
    cls: 'border-slate-700 bg-slate-900 text-slate-400',
  },
  waking: {
    dot: 'bg-yellow-400 animate-pulse',
    text: 'Waking up the model server — free-tier Spaces sleep when idle. This can take a minute or two.',
    cls: 'border-yellow-800 bg-yellow-900/20 text-yellow-400',
  },
  offline: {
    dot: 'bg-red-500',
    text: 'Model server is not responding.',
    cls: 'border-red-800 bg-red-900/20 text-red-400',
  },
}

export default function BackendStatus({ status, onRetry }) {
  // Online: stay out of the way entirely.
  if (status === 'online') return null

  const s = STATUS[status] ?? STATUS.checking

  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 mb-6 text-xs ${s.cls}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} aria-hidden="true" />
      <span>{s.text}</span>
      {status === 'offline' && (
        <button
          onClick={onRetry}
          className="ml-auto underline underline-offset-2 hover:text-red-300 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
        >
          Retry
        </button>
      )}
    </div>
  )
}
