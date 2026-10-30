import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { validateCatalog, renderIndex, renderReadmeTable, loadCatalog } from './catalog.mjs';

function fixture(t) {
  const directory = mkdtempSync(resolve(tmpdir(), 'slides-catalog-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const path of ['2026/first/slides.md', '2026/second/slides.md', '2025/발표 자료.pdf']) {
    const full = resolve(directory, path);
    mkdirSync(resolve(full, '..'), { recursive: true });
    writeFileSync(full, path.endsWith('.pdf') ? '%PDF-1.7' : '# Example');
  }
  const data = {
    site: { title: 'Talks', description: 'Archive', base: '/slides/', repository: 'https://github.com/example/slides' },
    talks: [
      { id: 'older', date: '2025-01-01', title: '지난 발표', pdf: '2025/발표 자료.pdf' },
      { id: 'first', date: '2026-01-01', title: '첫 발표', slides: '2026/first/slides.md' },
      { id: 'second', date: '2026-02-01', title: '두 번째 발표', slides: '2026/second/slides.md' },
    ],
  };
  return { directory, data };
}

test('multiple decks and Korean PDF names keep independent URLs under a shared base', t => {
  const { directory, data } = fixture(t);
  const catalog = validateCatalog(data, directory);
  assert.deepEqual(catalog.talks.map(talk => talk.id), ['second', 'first', 'older']);
  const html = renderIndex(catalog);
  assert.ok(html.includes('href="/slides/2026/first/"'));
  assert.ok(html.includes('href="/slides/2026/second/"'));
  assert.ok(html.includes('/slides/2025/%EB%B0%9C%ED%91%9C%20%EC%9E%90%EB%A3%8C.pdf'));
  data.site.base = '/';
  assert.ok(renderIndex(validateCatalog(data, directory)).includes('href="/2026/second/"'));
  assert.ok(renderReadmeTable(catalog).includes('[Slidev 원본](2026/second/slides.md)'));
});

test('missing files and duplicate IDs or deployment paths fail before a build', t => {
  const { directory, data } = fixture(t);
  const missing = structuredClone(data);
  missing.talks[1].slides = '2026/missing/slides.md';
  assert.throws(() => validateCatalog(missing, directory), /ENOENT/);
  const duplicateId = structuredClone(data);
  duplicateId.talks[1].id = 'older';
  assert.throws(() => validateCatalog(duplicateId, directory), /duplicate talk id/);
  const duplicateRoute = structuredClone(data);
  duplicateRoute.talks[2].slides = duplicateRoute.talks[1].slides;
  assert.throws(() => validateCatalog(duplicateRoute, directory), /Duplicate slide route/);
});

test('invalid dates, escaping source paths, and malformed base paths are rejected', t => {
  const { directory, data } = fixture(t);
  const invalid = structuredClone(data);
  invalid.talks[0].date = '2025-02-30';
  assert.throws(() => validateCatalog(invalid, directory), /Invalid date/);
  const escape = structuredClone(data);
  escape.talks[0].pdf = '2025/../../private.pdf';
  assert.throws(() => validateCatalog(escape, directory), /Invalid source path/);
  for (const base of ['slides/', '//example.com/', '/slides', '/slides/../']) {
    assert.throws(() => validateCatalog({ ...data, site: { ...data.site, base } }, directory), /site.base/);
  }
});

test('metadata is escaped in HTML text and link labels', t => {
  const { directory, data } = fixture(t);
  data.talks[1].title = '<script>alert("test")</script>';
  const html = renderIndex(validateCatalog(data, directory));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(&quot;test&quot;)'));
});

test('the real catalog resolves all registered sources', () => {
  const catalog = loadCatalog();
  assert.ok(catalog.talks.some(talk => talk.slides));
  assert.ok(catalog.talks.some(talk => talk.pdf));
});
