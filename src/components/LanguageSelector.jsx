const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'tr', label: '🇹🇷 Turkish' },
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={[
            'text-sm px-4 py-2 rounded-lg border transition-colors duration-150 font-medium',
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
