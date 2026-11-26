# Ask the Sources — Product and Engineering Plan

## Product concept

An experimental comparative-reading interface: users ask a question, select traditions or works, review retrieved excerpts, and optionally receive an AI-generated interpretation. The project owner states that the concept originated with him; AI systems generated the implementation code and suggested technical mechanisms.

## Current implementation

- Local passage corpus in `src/lib/sources.ts`; no live scholarly database or web search.
- Synonym/theme retrieval with whole-word scoring and a minimum match threshold.
- No generic passage fallback: if the query does not match sufficiently, the API reports that no close passage was found.
- Gemini synthesis runs server-side when configured.
- Without a Gemini key, the app displays a neutral no-AI notice rather than generating doctrinal summaries from hard-coded assumptions.
- A server-issued HttpOnly SameSite consent cookie is required before `/api/ask`; the user must separately press Ask after accepting.
- Daily quota is per IP address. There are no user accounts or persistent user identities.
- Keyword-only crisis-language screening is included, with an explicit warning that it can miss risk and is not a validated assessment.

## Source and editorial status

The current corpus is hand-entered and contains mixed editions. Exact text, locators, translations, translator names, edition metadata, context notes, and reuse rights have not all been independently verified. Every passage is visibly marked as editorial-review pending.

The UI must distinguish the supplied excerpt from AI interpretation. AI summaries must use only the excerpt, avoid invented citations and universal claims, and acknowledge when evidence is insufficient. AI output still requires evaluation and may be inaccurate.

## Release blockers

1. Verify each excerpt against a primary source and exact edition.
2. Document provenance and reuse rights for each passage, including modern translations.
3. Obtain editorial review from qualified readers for the traditions represented.
4. Evaluate retrieval precision and AI synthesis quality on a reviewed benchmark.
5. Review privacy, provider terms, and crisis-language handling before public deployment.

## Design direction

Quiet Reading Room: source excerpts remain visually primary; AI interpretation is visibly secondary; provenance status is visible; users control when a question is submitted. The current interface should not claim that it presents an authoritative or complete account of what a tradition teaches.