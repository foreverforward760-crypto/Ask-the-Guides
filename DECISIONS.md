# Decisions

- 2026-11-21: Start with the existing React/Vite prototype and preserve its calm reading-room visual language.
- 2026-11-21: Keep synthesis server-side. The browser renders trusted passages returned by the API and does not run an AI fallback.
- 2026-11-21: Treat the current hand-entered corpus as prototype/editorial-review-pending data until each edition, license, and exact source match is verified.
- 2026-11-21: Use a local consent gate before the first ask; the consent copy names the configured provider generically unless a provider is configured.
- 2026-11-21: Use a conservative server crisis screen before retrieval/synthesis. High-risk requests receive no source cards.
