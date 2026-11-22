# Ask the Sources — TODO

## Foundation and build

- [ ] The repository installs cleanly with a compatible Vite/esbuild toolchain.
- [ ] `npm run build` produces the Vite client bundle and bundled Express server.
- [ ] `npm run lint` passes TypeScript checking.
- [ ] The project exposes a synchronized `GET /manus-routes.json` route manifest.

## Source-grounded core

- [ ] The app lets a person enter a real question and select named works rather than denomination tiles.
- [ ] Source cards show the exact passage text returned by the server, with work, locator, translator, edition, and provenance status.
- [ ] AI commentary is visibly separated from source text and is labeled as AI commentary, not doctrine or counsel.
- [ ] The server rejects empty, oversized, malformed, and unrecognized source selections.
- [ ] The server never accepts source text from the client and never lets the client synthesize a response.
- [ ] A no-close-passage result is represented honestly rather than padded with unrelated passages.

## Safety and privacy

- [ ] The first ask is blocked until the user explicitly consents to sending the question and selected passages to the named AI provider.
- [ ] Consent version and timestamp are stored locally and can be withdrawn from the UI.
- [ ] High-risk crisis language returns only supportive resources and does not render source passages.
- [ ] Crisis resources are reachable without an AI response.
- [ ] A lightweight anonymous session quota and request length limit are enforced server-side.
- [ ] The UI states that this is an educational reading tool, not therapy, medical, legal, or religious counsel.

## Transparency

- [ ] The current prototype corpus is visibly marked as editorial review pending.
- [ ] `DECISIONS.md`, `BLOCKED.md`, and `STATUS.md` record what is verified, provisional, or blocked.
- [ ] The final report separates built code, automated checks, and owner-only tasks.
