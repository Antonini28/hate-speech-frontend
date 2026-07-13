# 🛡️ Multilingual Hate-Speech Moderation — Web UI

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel)](https://hate-speech-frontend-phi.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

React frontend for a **multilingual hate-speech moderation system**. Instead of a bare
probability score, the system outputs an **actionable moderation decision** —
**PASS / WARN / FLAG / REMOVE** — chosen by a reinforcement-learning policy on top of a
fine-tuned cross-lingual transformer.

**▶ Try it live: [hate-speech-frontend-phi.vercel.app](https://hate-speech-frontend-phi.vercel.app)**

<!-- Screenshot: add docs/screenshot.png showing a classified example -->

## How it works

```
User text ──▶ React UI ──▶ FastAPI backend (Hugging Face Space)
                              │
                              ├── XLM-RoBERTa + LoRA  → hate-speech classification
                              ├── FAISS retrieval     → similar past examples (few-shot grounding)
                              └── RL policy           → PASS / WARN / FLAG / REMOVE
                              ▼
              Decision + confidence + rationale rendered in the UI
```

| Component | Technology |
|-----------|-----------|
| Classifier | XLM-RoBERTa fine-tuned with LoRA (parameter-efficient) |
| Retrieval | FAISS similarity search over labelled examples |
| Decision layer | RL policy mapping model outputs → moderation actions |
| Backend | FastAPI, hosted as a Hugging Face Space |
| Frontend | React 18 + Vite + Tailwind CSS, deployed on Vercel |

## Key features

- **Cross-lingual:** one model handles multiple languages — no per-language models
- **Action-oriented:** the RL policy outputs the moderation action itself, cutting human review time
- **Language-consistent decisions:** the retrained policy is near-Bayes-optimal and does not change its decision based on language alone
- **Transparent UI:** shows confidence, decision rationale, and backend model info

## Running locally

```bash
git clone https://github.com/Antonini28/hate-speech-frontend.git
cd hate-speech-frontend
npm install
cp .env.example .env    # set VITE_API_URL to the backend endpoint
npm run dev             # http://localhost:5173
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the moderation API (Hugging Face Space or local FastAPI) |

## Project structure

```
src/
├── App.jsx                    # App shell and state
├── components/
│   ├── TextInput.jsx          # Text entry + language selection
│   ├── ResultCard.jsx         # Decision, confidence, rationale
│   ├── LanguageSelector.jsx
│   ├── ModelInfo.jsx          # Backend model metadata
│   ├── BackendStatus.jsx      # Space cold-start / health indicator
│   └── Header.jsx
└── main.jsx
```

## Deployment

Deployed on **Vercel** (`vercel.json` included). Any push to `main` triggers a
production deploy. The backend runs as a free Hugging Face Space, so the first
request after idle may take ~30 s while the Space wakes up — the UI surfaces
this via the backend status indicator.

## Roadmap

- [ ] Streaming inference for real-time chat moderation
- [ ] Expand the FAISS index with edge-case idioms and slang
- [ ] Per-decision feedback loop to refine the RL policy

## License

[MIT](LICENSE) © 2026 Anthony Olisa
