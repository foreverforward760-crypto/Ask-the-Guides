import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCrisis } from '../src/lib/safety.ts';

test('keyword screen flags explicit high-risk language', () => {
  assert.equal(classifyCrisis('I want to kill myself'), 'high');
});

test('keyword screen flags selected elevated language', () => {
  assert.equal(classifyCrisis('I feel hopeless'), 'elevated');
});

test('ordinary question does not trigger a keyword flag', () => {
  assert.equal(classifyCrisis('How do different traditions discuss forgiveness?'), 'none');
});
