import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDevArgs } from './dev-args.mjs';

test('dev arguments strip only the leading separator and preserve forwarded arguments', () => {
  const input = ['--', 'example', '--', '--port', '3030'];
  assert.deepEqual(parseDevArgs(input, 'latest'), { id: 'example', args: ['--', '--port', '3030'] });
  assert.deepEqual(input, ['--', 'example', '--', '--port', '3030']);
  assert.deepEqual(parseDevArgs(['example', '--', '--port', '3030'], 'latest'), { id: 'example', args: ['--', '--port', '3030'] });
  assert.deepEqual(parseDevArgs(['--', '--port', '3030'], 'latest'), { id: 'latest', args: ['--port', '3030'] });
  assert.deepEqual(parseDevArgs([], 'latest'), { id: 'latest', args: [] });
});
