import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import LanguageSelector from './components/LanguageSelector'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ModelInfo from './components/ModelInfo'
import BackendStatus from './components/BackendStatus'

// In production the env var VITE_API_URL points to your HF Space URL.
// During local dev the vite proxy rewrites /api → http://localhost:7860
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const HEALTH_POLL_MS = 12_000
const HEALTH_MAX_POLLS = 25 // ~5 min — free HF Spaces can take a while to wake

// Toxic + benign examples per language, verified against the live model so
// visitors see both a REMOVE and a PASS outcome when cycling through them.
const EXAMPLE_TEXTS = {
  en: [
    'All immigrants are vermin and should be exterminated.',
    'What a beautiful morning! I hope everyone has a wonderful day.',
  ],
  es: [
    'Esa gente de mierda debería morir toda, son basura subhumana.',
    '¡Qué día tan bonito! Espero que todos tengan una semana estupenda.',
  ],
  it: [
    'Tutti quelli di quella razza sono criminali schifosi da eliminare.',
    'Che bella giornata! Auguro a tutti una splendida settimana.',
  ],
  tr: [
    'O ırk insan değil, hepsi pislik, hepsinin ölmesi lazım.',
    'Ne güzel bir gün! Herkese harika bir hafta diliyorum.',
  ],
}

function friendlyError(err) {
  if (err.response?.status === 503) {
    return 'The model is still loading on the server. This usually takes under a minute after the Space wakes up — please try again shortly.'
  }
  if (err.response?.data?.detail) {
    return err.response.data.detail
  }
  if (err.code === 'ECONNABORTED' || !err.response) {
    return 'Could not reach the model server. The free-tier Space may be waking from sleep — give it a minute and try again.'
  }
  return err.message ?? 'An unexpected error occurred. Please try again.'
}

export default function App() {
  const [text, setText]       = useState('')
  const [language, setLang]   = useState('en')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [elapsed, setElapsed] = useState(null)

  // 'checking' | 'online' | 'waking' | 'offline'
  const [backend, setBackend] = useState('checking')
  const exampleIdx = useRef(0)
  const pollCount = useRef(0)

  const checkHealth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/health`, { timeout: 10_000 })
      if (data.classifier_loaded && data.rl_loaded) {
        setBackend('online')
        return true
      }
      setBackend('waking')
      return false
    } catch {
      setBackend(prev => (prev === 'online' ? 'online' : 'waking'))
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer

    async function poll() {
      const ok = await checkHealth()
      if (cancelled || ok) return
      pollCount.current += 1
      if (pollCount.current >= HEALTH_MAX_POLLS) {
        setBackend('offline')
        return
      }
      timer = setTimeout(poll, HEALTH_POLL_MS)
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [checkHealth])

  function retryHealth() {
    pollCount.current = 0
    setBackend('checking')
    checkHealth().then(ok => {
      if (!ok) setBackend('waking')
    })
  }

  async function handleAnalyse() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    const started = performance.now()
    try {
      const { data } = await axios.post(
        `${API_BASE}/predict`,
        { text: text.trim(), language },
        { timeout: 120_000 },
      )
      setElapsed(Math.round(performance.now() - started))
      setResult(data)
      setBackend('online')
    } catch (err) {
      setError(friendlyError(err))
      checkHealth()
    } finally {
      setLoading(false)
    }
  }

  function loadExample() {
    const pool = EXAMPLE_TEXTS[language] ?? EXAMPLE_TEXTS.en
    setText(pool[exampleIdx.current % pool.length])
    exampleIdx.current += 1
    setResult(null)
    setError(null)
  }

  function handleClear() {
    setText('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-4 pb-16 flex-1">
        <Header />

        <BackendStatus status={backend} onRetry={retryHealth} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left / main column ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card space-y-5">
              {/* Language picker */}
              <div>
                <span
                  id="language-label"
                  className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5"
                >
                  Language
                </span>
                <LanguageSelector value={language} onChange={setLang} labelledBy="language-label" />
              </div>

              {/* Text input */}
              <div>
                <label
                  htmlFor="analyse-input"
                  className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5"
                >
                  Text to Analyse
                </label>
                <TextInput
                  id="analyse-input"
                  value={text}
                  onChange={setText}
                  onSubmit={handleAnalyse}
                />
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
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                             focus:outline-none focus:ring-2 focus:ring-brand-500
                             focus:ring-offset-2 focus:ring-offset-slate-950
                             transition-colors duration-150"
                >
                  Load Example
                </button>

                {text && (
                  <button
                    onClick={handleClear}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors
                               focus:outline-none focus:ring-2 focus:ring-slate-600 rounded-md px-1"
                  >
                    Clear
                  </button>
                )}

                <span className="ml-auto hidden sm:inline text-xs text-slate-600">
                  Ctrl+Enter to analyse
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-800 bg-red-900/30 px-5 py-4 text-red-400 text-sm"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="card space-y-4 animate-pulse" aria-hidden="true">
                <div className="h-8 bg-slate-800 rounded-full w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-800 rounded w-4/6" />
              </div>
            )}

            {/* Result */}
            <div aria-live="polite">
              {!loading && result && <ResultCard result={result} elapsedMs={elapsed} />}
            </div>
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

            <div className="card text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-2">
                ⚠️ Responsible Use
              </p>
              <p>
                This is a research demo. Example texts and knowledge-base excerpts may
                contain offensive content shown for illustration only. Predictions can
                be wrong — do not use this tool as the sole basis for moderation
                decisions about real people or content.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="pb-8 text-center text-xs text-slate-600 space-y-2">
        <p>XLM-RoBERTa-base + LoRA (r=16) · REINFORCE RL policy · Threshold 0.55</p>
        <p>Trained on HateXplain · Jigsaw · Measuring Hate Speech datasets</p>
        <p className="space-x-3">
          <a
            href="https://github.com/Antonini28/hate-speech-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-brand-500 underline underline-offset-2 transition-colors"
          >
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://huggingface.co/spaces/Stoic1344223/hate-speech-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-brand-500 underline underline-offset-2 transition-colors"
          >
            API on Hugging Face
          </a>
        </p>
      </footer>
    </div>
  )
}
