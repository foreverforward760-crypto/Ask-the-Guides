# Remaining Work

## Blocking before public or commercial release

- [ ] Audit every passage against the exact primary source and edition.
- [ ] Replace uncertain translation/edition metadata with verified citations.
- [ ] Record provenance, source hashes, exact locators, and license/permission for each excerpt.
- [ ] Remove or license any copyrighted text that cannot be reused commercially.
- [ ] Obtain editorial review from qualified readers for each represented tradition.
- [ ] Evaluate Gemini outputs for fabricated context, inaccurate summaries, and unsupported cross-tradition claims.
- [ ] Review crisis-language screening with qualified safety specialists; do not market it as crisis detection.
- [ ] Review privacy notice and Google Gemini API data terms for the intended deployment.

## Engineering improvements

- [ ] Add a persistent consent store and user/session identity if multi-user deployment is required.
- [ ] Add robust per-IP and per-account rate limiting for production.
- [ ] Add tests for provider errors, invalid tokens, quota exhaustion, and no-close-passage responses.
- [ ] Add source-by-source retrieval evaluation and a benchmark set.
- [ ] Add monitoring and operational error reporting without logging private question text.
- [ ] Confirm the configured Gemini model ID and API compatibility before deployment.

## Not part of the current MVP

- Native iOS/Android app packaging.
- Subscription billing or RevenueCat.
- A live external scholarly database or web search.
- A verified crisis assessment or clinical support product.