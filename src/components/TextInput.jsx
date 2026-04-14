export default function TextInput({ value, onChange, maxLength = 5000 }) {
  const remaining = maxLength - value.length

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        rows={5}
        placeholder="Enter text to analyse for hate speech…"
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4
                   text-slate-100 placeholder-slate-500 resize-none
                   focus:outline-none focus:ring-2 focus:ring-brand-500
                   focus:border-transparent transition-all duration-150 text-sm"
      />
      <span className="absolute bottom-3 right-4 text-xs text-slate-500">
        {remaining} / {maxLength}
      </span>
    </div>
  )
}
