import test from 'node:test';
import assert from 'node:assert/strict';
import { extractThemesAndKeywords, retrievePassagesForTraditions } from '../src/lib/retrieve.ts';

test('forgiveness and betrayal language maps to relevant themes', () => {
  const result = extractThemesAndKeywords('I am struggling to forgive someone who betrayed me');
  assert.ok(result.themes.includes('forgiveness'));
  assert.ok(result.themes.includes('betrayal'));
});

test('unrelated query does not receive generic fallback themes or passages', () => {
  const extracted = extractThemesAndKeywords('quasar telescope asteroid spectroscopy');
  assert.deepEqual(extracted.themes, []);
  const result = retrievePassagesForTraditions(
    'quasar telescope asteroid spectroscopy',
    ['new_testament', 'quran']
  );
  assert.equal(result.passagesByTradition.new_testament.length, 0);
  assert.equal(result.passagesByTradition.quran.length, 0);
});

test('relevant forgiveness query can retrieve the matching New Testament excerpt', () => {
  const result = retrievePassagesForTraditions(
    'I am struggling to forgive someone who betrayed me',
    ['new_testament']
  );
  assert.ok(result.passagesByTradition.new_testament.some((passage) => passage.id === 'nt-01'));
});
