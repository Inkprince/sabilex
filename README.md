# SabiLex ⚖️

**AI-powered Nigerian constitutional rights advisor** — grounded in real law, built for every Nigerian.

> _Know Your Rights, Instantly._

---

## What It Does

SabiLex lets you:

1. **Search** — semantically search 6 Nigerian legal documents (Constitution Chapters I–IV, Labour Act, ACJA/Police Act) and get the most relevant excerpts
2. **Rights Advisor** ⭐ — describe a situation in plain English, and get an AI-powered analysis of your exact constitutional rights, with legal citations and practical guidance
3. **Browse Law** — navigate the full corpus by chapter and section

Every answer is grounded in real legal text — no hallucinations, no guesswork.

---

## Required Environment Variables

Create a `.env.local` file in the project root:

```env
UPSTASH_VECTOR_REST_URL=your-upstash-vector-rest-url
UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-rest-token
CEREBRAS_API_KEY=your-cerebras-api-key
```

- **Upstash Vector**: [upstash.com](https://upstash.com) → Create a Vector database with a built-in embedding model (`mxbai-embed-large-v1`)
- **Cerebras**: [cloud.cerebras.ai](https://cloud.cerebras.ai) → Sign up and create an API key

---

## Setup & Run

```bash
# 1. Clone and install
git clone https://github.com/YOUR-USERNAME/sabilex
cd sabilex
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your real credentials

# 3. Ingest the legal corpus into Upstash Vector
npm run ingest

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/sabilex)

When deploying to Vercel, add all three environment variables in your project settings. Run the ingest script locally first — the vector index is hosted on Upstash and shared between local and production.

---

## Legal Corpus

| Document | Sections |
|---|---|
| Constitution Ch. I — General Provisions | §1–12 |
| Constitution Ch. II — Fundamental Objectives | §13–24 |
| Constitution Ch. III — Citizenship | §25–32 |
| Constitution Ch. IV — Fundamental Rights | §33–46 |
| Labour Act (Cap L1) | Employment contracts, wages, termination |
| ACJA 2015 & Police Act 2020 | Arrest rights, detention, bail |

---

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Vector DB**: Upstash Vector (built-in embeddings)
- **AI**: Cerebras GPT OSS 120B via `@ai-sdk/cerebras` (streaming at ~1000 tok/s)
- **Deployment**: Vercel

---

## ⚠️ Disclaimer

SabiLex is a workshop demo application. It is not legal advice. Always consult a qualified legal practitioner for your specific situation. For urgent matters, contact the Legal Aid Council of Nigeria.
