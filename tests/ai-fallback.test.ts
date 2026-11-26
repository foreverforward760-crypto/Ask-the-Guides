import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalGroundedInterpretation, generateLocalComparison } from '../src/lib/ai.ts';
import { PASSAGES, TRADITIONS } from '../src/lib/sources.ts';

test('no-provider fallback does not invent a doctrinal summary', () => {
  const result = generateLocalGroundedInterpretation(
    'What does forgiveness mean?',
    TRADITIONS[0],
    [PASSAGES[0]]
  );
  assert.match(result.whatSourcesSay, /AI commentary is unavailable/i);
  assert.match(result.howItApplies, /No automated application/i);
});

test('no-provider comparison does not invent agreement between traditions', () => {
  const result = generateLocalComparison([]);
  assert.deepEqual(result.convergence, []);
  assert.deepEqual(result.divergence, []);
  assert.match(result.keyTension, /requires at least two/i);
});
