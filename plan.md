# Ask the Sources — MVP plan

## Implementation

This iteration turns the existing React/Vite prototype into a focused, source-grounded web MVP. The core flow stays intact: a question is matched to the local corpus, selected works are shown as primary-source cards, and commentary is clearly separated from the source text. The client never synthesizes or invents passages; it only renders passages returned by the server. The server validates inputs, applies a conservative crisis screen, enforces a lightweight anonymous session quota, and performs synthesis only on the server when a provider key is available. Without a provider key, the experience uses a clearly labeled deterministic fallback built from retrieved passages.

The first release deliberately keeps the current corpus as a **prototype editorial corpus**. It exposes edition metadata and a visible note that the corpus must pass the planned license/provenance review before commercial launch. Unsupported or uncertain metadata is not presented as verified.

## Project structure

- `src/App.tsx`: application shell, consent gate, ask flow, library drawer, crisis states, and local saves.
- `src/components/`: reusable reading-room UI components.
- `src/lib/sources.ts`: current prototype corpus and work registry.
- `src/lib/retrieve.ts`: deterministic retrieval and crisis keyword screening.
- `src/lib/ai.ts`: server-only synthesis adapter plus deterministic grounded fallback.
- `server.ts`: API routes, quota, consent/session handling, crisis response, and static serving.
- `public/manus-routes.json`: route manifest for the web project.
- `STATUS.md`, `DECISIONS.md`, `BLOCKED.md`: implementation transparency and owner follow-ups.

## Design

### Options considered

- **Quiet Reading Room / archival editorial** — probability 0.06
- **Warm modern journaling companion** — probability 0.08
- **Dark academic dashboard** — probability 0.04

### Chosen direction: Quiet Reading Room

**Design movement:** contemporary literary editorial, with the restraint of a museum reading room and the warmth of a well-used study.

**Core principles:** source text is visually primary; interpretation is visibly secondary; calm density over decoration; every claim carries provenance.

**Color philosophy:** charcoal and parchment create focus and seriousness; muted gold marks interaction and provenance; blue-green is reserved for system trust and safety states.

**Layout paradigm:** a wide reading column with a persistent “method rail” rather than a centered marketing hero. Source cards are arranged as shelves of works, while the answer area reads like an annotated folio.

**Signature elements:** a thin gold rule used as a provenance marker; pill-shaped “edition” labels; layered cards titled “Passage,” “Reading,” and “Application.”

**Interaction philosophy:** no surprise automation. Users select works, agree to data sharing, ask, and can always inspect the exact edition behind a result.

**Animation:** short opacity and vertical transitions only; reduced motion disables transforms.

**Typography:** Newsreader/Georgia for passages; Plus Jakarta Sans for controls; Cinzel only for the wordmark and small editorial labels; JetBrains Mono for IDs and method metadata.

**Brand essence:** a source-grounded reading room for difficult questions. Personality: careful, humane, unhurried.

**Brand voice:** headlines are direct and literary; CTAs are specific. Example lines: “Bring a real question.” “Read what the sources actually say.”

**Wordmark & logo:** a small open-book mark formed by two offset vertical strokes and one gold baseline; the wordmark is set in a restrained serif, never as a generic bold sans logo.

**Signature brand color:** aged saffron `#c99a4e`.
