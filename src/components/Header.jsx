export default function Header() {
  return (
    <header className="text-center py-10 px-4">
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-brand-500 to-purple-400 bg-clip-text text-transparent">
          Hate Speech Detector
        </h1>
      </div>
      <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
        Multilingual content moderation powered by{' '}
        <span className="text-brand-500 font-medium">XLM-RoBERTa + LoRA</span> and a{' '}
        <span className="text-purple-400 font-medium">reinforcement-learning moderation policy</span>.
        Supports English, Spanish, Italian, Turkish and more.
      </p>

      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {['EN', 'ES', 'IT', 'TR', '+ multilingual'].map(lang => (
          <span
            key={lang}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
          >
            {lang}
          </span>
        ))}
      </div>
    </header>
  )
}
