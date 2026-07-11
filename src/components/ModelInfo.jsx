const METRICS = [
  { label: 'F1 Toxic',   value: '74.6%', color: 'text-red-400' },
  { label: 'AUC-ROC',   value: '65.0%', color: 'text-brand-500' },
  { label: 'Recall',    value: '93.3%', color: 'text-purple-400' },
  { label: 'Precision', value: '62.1%', color: 'text-yellow-400' },
]

const PIPELINE = [
  { step: '1', name: 'XLM-R + LoRA',  desc: 'Binary toxicity classifier (r=16, α=32)' },
  { step: '2', name: 'Threshold',      desc: 'Decision boundary at 0.55 probability' },
  { step: '3', name: 'RL Policy',      desc: 'REINFORCE MLP — PASS below 0.29, FLAG mid-band, REMOVE above 0.62' },
  { step: '4', name: 'RAG',            desc: 'FAISS k-NN from 76K exemplar knowledge base' },
]

export default function ModelInfo() {
  return (
    <div className="card space-y-5">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Model Pipeline
      </h2>

      <div className="space-y-2.5">
        {PIPELINE.map(({ step, name, desc }) => (
          <div key={step} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/50
                             text-brand-500 text-xs font-bold flex items-center justify-center mt-0.5">
              {step}
            </span>
            <div>
              <span className="text-sm font-medium text-slate-200">{name}</span>
              <span className="text-slate-500 text-xs ml-2">— {desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Test-set Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {METRICS.map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
              <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
