# Ask the Sources — Comparative Reading Web MVP

**Repository:** Ask-the-Guides  
**Current interface name:** Ask the Sources

## Concept

Ask the Sources is an experimental reading tool intended to let a user ask a question, retrieve selected passages from several traditions, and compare interpretations. The project owner states that the underlying concept originated with him; AI systems generated the application code and suggested implementation mechanisms.

## What the current code does

- Stores a hand-entered passage corpus in `src/lib/sources.ts`.
- Uses a synonym/theme map and whole-word scoring to retrieve up to two matching passages per selected tradition.
- Returns no passages when the query does not meet a minimum lexical/theme score; it no longer inserts generic fallback passages.
- Sends the question and selected excerpts to Google Gemini when `GEMINI_API_KEY` is configured.
- Uses a neutral notice instead of invented doctrinal summaries when no Gemini key is configured or synthesis is unavailable.
- Provides a keyword-based crisis-language screen and links to region-specific support resources.
- Enforces a server-issued consent token before `/api/ask`; tokens can be revoked and expire after 30 days.
- Applies a daily request quota per IP address.

## What it does not establish

- The corpus is not a verified critical edition or authoritative collection. Text, citations, translation labels, edition details, and context notes remain under editorial review.
- The presence of a citation or translator name in the data does not prove that the excerpt matches that edition.
- The retrieval system is lexical/theme matching, not semantic search or scholarly source verification.
- Gemini-generated summaries and comparisons are interpretations, not authoritative statements of what an entire tradition believes. They may still be inaccurate.
- The crisis screen is keyword-only. It can miss indirect or unrecognized crisis language and is not a validated risk assessment.
- The application is not therapy, religious authority, legal advice, or emergency support.

## Consent and data handling

Before a question is sent to Gemini, the user must accept the consent notice. The server issues a random consent token, checks it on every `/api/ask` request, and supports revocation. The consent token is held in process memory on the server and delivered to the browser only as an HttpOnly, SameSite cookie; client JavaScript cannot read it. A server restart invalidates outstanding consent cookies.

The server does not store question text in an application database. The question and selected passages are sent to Google Gemini when the provider is configured. Provider-side retention and training treatment are governed by Google's current API terms; review those terms before sending sensitive information.

The daily quota is per IP address, not a per-user identity system. This prototype has no user accounts, no persistent consent database, and no multi-user account management.

## Corpus and commercial rights — blocking issue

The current corpus contains hand-entered passages from mixed editions, including modern translations. Exact text, source locators, translator/edition attribution, public-domain status, and commercial reuse rights have not all been independently verified. Some translations may require permission or a commercial license.

Do not distribute, sell, or commercially launch the corpus until every excerpt has a verified source, exact locator, edition/translation metadata, provenance record, and documented reuse rights. The app code and the passage corpus must be reviewed as separate assets.

## Local development

```bash
npm install
```

Set `GEMINI_API_KEY` in the server environment to enable Gemini synthesis. Without a provider key, the application displays a neutral notice and does not invent doctrinal summaries.

```bash
npm run dev
```

Open the local Vite address shown in the terminal. The app's consent screen must be accepted before asking a question.

## Verification

```bash
npm run lint
npm test
npm run build
```

Tests cover retrieval thresholds, no-AI fallback behavior, keyword-screen examples, and server-enforced consent/revocation. Passing tests do not validate the corpus, translations, theological interpretations, crisis detection, or commercial rights.

## Commercial assessment

The most plausible product direction is a comparative reading and reflection interface. The immediate blockers are corpus accuracy/licensing, editorial governance, AI output evaluation, and independent safety review. The current prototype should not be presented as a finished scholarly database or safety system.