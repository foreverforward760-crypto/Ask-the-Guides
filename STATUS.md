# Status

## Implemented in the current prototype

- React/Vite reading interface with tradition selection, passage cards, comparison view, and passage library.
- Local hand-entered corpus with editorial-review-pending labels.
- Theme/synonym retrieval with whole-word scoring and a minimum match threshold.
- Neutral no-provider fallback; no fabricated doctrinal summaries when Gemini is unavailable.
- Gemini synthesis constrained to supplied excerpts, with instructions not to invent citations or metadata.
- Server-issued consent token, server-side enforcement on `/api/ask`, token revocation, 30-day expiry, and per-IP daily quota.
- Keyword-only crisis language screen with explicit limitations and support links.
- Regression tests and CI workflow for TypeScript checks, tests, and production build.

## Not verified

- The exact text, citations, translations, edition metadata, context notes, and licensing status of the corpus.
- Gemini model availability, provider-side data handling, or output accuracy under real user questions.
- The completeness or effectiveness of crisis-language detection.
- Production hosting, persistent user identity, database storage, subscriptions, or native mobile packaging.
- Commercial rights to all passages and translations.

## Current release status

Web MVP foundation only. Not ready for commercial launch until corpus provenance and licensing are resolved and AI/safety behavior receives independent review.