const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'tr', label: '🇹🇷 Turkish' },
]

export default function LanguageSelector({ value, onChange, labelledBy }) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          aria-pressed={value === code}
          className={[
            'text-sm px-4 py-2 rounded-lg border transition-colors duration-150 font-medium',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950',
            value === code
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-brand-500 hover:text-white',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
