import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';

process.env.NODE_ENV = 'test';
const { app } = await import('../server.ts');

const server = app.listen(0, '127.0.0.1');
let baseUrl = '';

before(async () => {
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('server rejects an AI question without an issued consent token', async () => {
  const response = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'How do sources discuss forgiveness?', traditionIds: ['new_testament'] }),
  });
  assert.equal(response.status, 403);
});

test('issued consent token permits a request and revocation blocks later requests', async () => {
  const consentResponse = await fetch(`${baseUrl}/api/consent`, { method: 'POST' });
  assert.equal(consentResponse.status, 200);
  const setCookie = consentResponse.headers.get('set-cookie') || '';
  const consentCookie = setCookie.split(';')[0];
  assert.match(consentCookie, /^ask_consent=.+$/);

  const askResponse = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': consentCookie,
    },
    body: JSON.stringify({ question: 'I am struggling to forgive someone who betrayed me', traditionIds: ['new_testament'] }),
  });
  assert.equal(askResponse.status, 200);

  const revokeResponse = await fetch(`${baseUrl}/api/consent/revoke`, {
    method: 'POST',
    headers: { 'Cookie': consentCookie },
  });
  assert.equal(revokeResponse.status, 200);

  const afterRevoke = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ask-Consent': consent.consentToken,
    },
    body: JSON.stringify({ question: 'How do sources discuss forgiveness?', traditionIds: ['new_testament'] }),
  });
  assert.equal(afterRevoke.status, 403);
});
