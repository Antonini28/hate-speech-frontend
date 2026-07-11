const ACTION_STYLES = {
  PASS:   { bg: 'bg-emerald-900/50', border: 'border-emerald-700', text: 'text-emerald-400', icon: '✅' },
  WARN:   { bg: 'bg-yellow-900/50',  border: 'border-yellow-700',  text: 'text-yellow-400',  icon: '⚠️' },
  FLAG:   { bg: 'bg-blue-900/50',    border: 'border-blue-700',    text: 'text-blue-400',    icon: '🚩' },
  REMOVE: { bg: 'bg-red-900/50',     border: 'border-red-700',     text: 'text-red-400',     icon: '🚫' },
}

const LABEL_STYLES = {
  'toxic':     { bg: 'bg-red-500/20',     border: 'border-red-500',     text: 'text-red-400' },
  'non-toxic': { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
}

function ConfidenceBar({ value, label, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className="font-mono">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
}

function SimilarExample({ example, index }) {
  const labelColor = example.label === 'hatespeech' ? 'text-red-400' : 'text-emerald-400'
  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-slate-500">#{index + 1}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
          {example.label}
        </span>
        <span className="text-xs text-slate-500 ml-auto">{example.category}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{example.text}</p>
    </div>
  )
}

export default function ResultCard({ result, elapsedMs }) {
  if (!result) return null

  const labelStyle  = LABEL_STYLES[result.label]  ?? LABEL_STYLES['non-toxic']
  const actionStyle = ACTION_STYLES[result.action] ?? ACTION_STYLES['PASS']

  return (
    <div className="card space-y-5 animate-pulse-once">
      {/* Label + Action header */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold
                      ${labelStyle.bg} ${labelStyle.border} ${labelStyle.text}`}
        >
          {result.label === 'toxic' ? '⚡' : '✓'} {result.label.toUpperCase()}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-semibold
                      ${actionStyle.bg} ${actionStyle.border} ${actionStyle.text}`}
        >
          {actionStyle.icon} {result.action}
        </span>

        <span className="ml-auto text-xs text-slate-500 font-mono">
          lang: {result.language.toUpperCase()} · threshold: {result.threshold_used}
          {elapsedMs != null && ` · ${(elapsedMs / 1000).toFixed(1)}s`}
        </span>
      </div>

      {/* Action description */}
      <p className={`text-sm ${actionStyle.text} bg-slate-800 rounded-lg px-4 py-2.5 border ${actionStyle.border}/40`}>
        {result.action_description}
      </p>

      {/* Confidence bars */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Classifier Probabilities
        </h3>
        <ConfidenceBar
          value={result.prob_toxic}
          label="Toxic"
          color="bg-red-500"
        />
        <ConfidenceBar
          value={result.prob_nontoxic}
          label="Non-toxic"
          color="bg-emerald-500"
        />
      </div>

      {/* Similar examples from KB */}
      {result.similar_examples && result.similar_examples.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Similar Examples from Knowledge Base
          </h3>
          {result.similar_examples.map((ex, i) => (
            <SimilarExample key={i} example={ex} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
