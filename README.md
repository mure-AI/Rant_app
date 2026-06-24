# Rant AI MVP

An AI-powered emotional clarity web app that accepts typed or spoken rants, turns them into structured summaries, identifies likely problem patterns, suggests actionable next steps, and saves private history.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage
- OpenAI APIs for transcription, analysis, and optional text-to-speech
- Vercel deployment

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. Run Supabase migrations from `supabase/migrations`.

4. Start the app:

```bash
npm run dev
```

## MVP Flow

Users can type or record what is on their mind, review the transcript, receive an AI-generated emotional summary and next steps, save the entry privately, replay recordings, and revisit prior entries.
