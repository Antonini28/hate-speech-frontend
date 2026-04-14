import { useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import LanguageSelector from './components/LanguageSelector'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ModelInfo from './components/ModelInfo'

// In production the env var VITE_API_URL points to your HF Space URL.
// During local dev the vite proxy rewrites /api → http://localhost:7860
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const EXAMPLE_TEXTS = {
  en: "I hate all people from that country, they should go back where they came from.",
  es: "Odio a toda esa gente, no deberían estar aquí.",
  it: "Queste persone sono una piaga per la società.",
  tr: "Bu insanlar burada olmamalı, hepsi geri dönsün.",
}

export default function App() {
  const [text, setText]       = useState('')
  const [language, setLang]   = useState('en')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleAnalyse() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await axios.post(`${API_BASE}/predict`, {
        text: text.trim(),
        language,
      })
      setResult(data)
    } catch (err) {
      const msg =
        err.response?.data?.detail ??
        err.message ??
        'An unexpected error occurred. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function loadExample() {
    setText(EXAMPLE_TEXTS[language] ?? EXAMPLE_TEXTS.en)
    setResult(null)
    setError(null)
  }

  function handleClear() {
    setText('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left / main column ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card space-y-5">
              {/* Language picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Language
                </label>
                <LanguageSelector value={language} onChange={setLang} />
              </div>

              {/* Text input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Text to Analyse
                </label>
                <TextInput value={text} onChange={setText} />
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAnalyse}
                  disabled={!text.trim() || loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Analysing…
                    </>
                  ) : (
                    <>🔍 Analyse</>
                  )}
                </button>

                <button
                  onClick={loadExample}
                  className="text-sm px-4 py-2.5 rounded-xl border border-slate-700
                             text-slate-300 hover:border-brand-500 hover:text-white
                             transition-colors duration-150"
                >
                  Load Example
                </button>

                {text && (
                  <button
                    onClick={handleClear}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-800 bg-red-900/30 px-5 py-4 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="card space-y-4 animate-pulse">
                <div className="h-8 bg-slate-800 rounded-full w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-800 rounded w-4/6" />
              </div>
            )}

            {/* Result */}
            {!loading && result && <ResultCard result={result} />}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">
            <ModelInfo />

            <div className="card text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">
                Moderation Actions
              </p>
              {[
                ['✅ PASS',   'Content is acceptable'],
                ['⚠️ WARN',   'Warning label added'],
                ['🚩 FLAG',   'Sent to human review'],
                ['🚫 REMOVE', 'Auto-removed'],
              ].map(([action, desc]) => (
                <div key={action} className="flex gap-2">
                  <span className="font-mono w-24 flex-shrink-0">{action}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-600 space-y-1">
          <p>XLM-RoBERTa-base + LoRA (r=16) · REINFORCE RL policy · Threshold 0.55</p>
          <p>Trained on HateXplain · Jigsaw · Measuring Hate Speech datasets</p>
        </footer>
      </div>
    </div>
  )
}
