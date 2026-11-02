import test from 'node:test';
import assert from 'node:assert/strict';
import { requestPath, refererPath } from './site-request.mjs';

test('requestPath decodes the path and drops the query', () => {
  assert.equal(requestPath('/slides/a%20b.pdf?x=1'), '/slides/a b.pdf');
});

test('requestPath returns null for malformed percent-encoding', () => {
  assert.equal(requestPath('/%'), null);
  assert.equal(requestPath('/%E0%A4%A'), null);
});

test('refererPath falls back to / for missing or invalid referers', () => {
  assert.equal(refererPath('http://localhost:4174/slides/a/export/3?x=1'), '/slides/a/export/3');
  assert.equal(refererPath(undefined), '/');
  assert.equal(refererPath('http://['), '/');
});
