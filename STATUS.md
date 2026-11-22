# Status

## Built

The repository now has a consent-first reading-room flow, guarded `/api/ask`, anonymous per-session quota, conservative crisis interception, explicit no-close-passage behavior, server-only synthesis, source-work result cards, and the required route manifest. The client no longer runs a synthesis fallback when the API is unavailable.

The prototype corpus remains visibly marked as editorial-review pending. This is intentional: the current hand-entered passages and mixed editions have not yet passed the canonical-source, license, and worldwide-rights pipeline described in the build specification.

## Verified in this environment

`npm install`, `npm run build`, and `npm run lint` pass. Runtime checks returned HTTP 200 for `/api/health` and `/api/consent`; a normal ask returned two source-backed answers; a high-risk request returned only crisis support resources with no passages.

## Not verified

No physical iOS or Android device, app-store package, database, RevenueCat subscription, production provider account, canonical corpus import, external legal review, or store submission was tested. The current repository is a web MVP foundation rather than a submission-ready native app.
