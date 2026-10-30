import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { validateCatalog, renderIndex, renderReadmeTable, loadCatalog } from './catalog.mjs';

function fixture(t) {
  const directory = mkdtempSync(resolve(tmpdir(), 'slides-catalog-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const path of ['2026/2026-01-01-first/slides.md', '2026/2026-02-01-second/slides.md', '2025/2025-01-01-older.pdf', '2026/2026-01-01-first.pdf', '2026/2026-02-01-second.pdf']) {
    const full = resolve(directory, path);
    mkdirSync(resolve(full, '..'), { recursive: true });
    writeFileSync(full, path.endsWith('.pdf') ? '%PDF-1.7' : '# Example');
  }
  const data = {
    site: { title: 'Talks', description: 'Archive', base: '/slides/', origin: 'https://example.github.io', repository: 'https://github.com/example/slides' },
    talks: [
      { id: 'older', date: '2025-01-01', event: 'Community Meetup', title: '지난 발표' },
      { id: 'first', date: '2026-01-01', event: 'Community Meetup', title: '첫 발표', slides: true },
      { id: 'second', date: '2026-02-01', event: 'Community Meetup', title: '두 번째 발표', slides: true },
    ],
  };
  return { directory, data };
}

test('multiple decks and derived PDF paths keep independent URLs under a shared base', t => {
  const { directory, data } = fixture(t);
  const catalog = validateCatalog(data, directory);
  assert.deepEqual(catalog.talks.map(talk => talk.id), ['second', 'first', 'older']);
  const html = renderIndex(catalog);
  assert.ok(html.includes('href="/slides/first/"'));
  assert.ok(html.includes('href="/slides/second/"'));
  assert.ok(html.includes('/slides/2025/2025-01-01-older.pdf'));
  assert.ok(renderReadmeTable(catalog).includes('[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](https://example.github.io/slides/second/)'));
  assert.ok(renderReadmeTable(catalog).startsWith('| 제목 | 웹 | PDF | 날짜 | 행사 |'));
  assert.ok(renderReadmeTable(catalog).includes('| Community Meetup |'));
  data.site.base = '/';
  assert.ok(renderIndex(validateCatalog(data, directory)).includes('href="/second/"'));
  assert.ok(renderReadmeTable(validateCatalog(data, directory)).includes('https://example.github.io/second/'));
});

test('duplicate IDs fail before a build', t => {
  const { directory, data } = fixture(t);
  const duplicateId = structuredClone(data);
  duplicateId.talks[1].id = 'older';
  assert.throws(() => validateCatalog(duplicateId, directory), /duplicate talk id/);
});

test('invalid dates, escaping source paths, and malformed base paths are rejected', t => {
  const { directory, data } = fixture(t);
  const invalid = structuredClone(data);
  invalid.talks[0].date = '2025-02-30';
  assert.throws(() => validateCatalog(invalid, directory), /Invalid date/);
  const escape = structuredClone(data);
  escape.talks[1].id = '../../private';
  assert.throws(() => validateCatalog(escape, directory), /Invalid or duplicate talk id/);
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

test('all talks require a PDF derived from date and ID without mutating input', t => {
  const { directory, data } = fixture(t);
  const before = structuredClone(data);
  const catalog = validateCatalog(data, directory);
  assert.equal(catalog.talks.find(talk => talk.id === 'older').pdf, '2025/2025-01-01-older.pdf');
  assert.deepEqual(data, before);
  rmSync(resolve(directory, '2026/2026-01-01-first.pdf'));
  assert.throws(() => validateCatalog(data, directory), /Talk "first" \(2026-01-01\): missing PDF: 2026\/2026-01-01-first\.pdf/);
});

test('invalid or duplicate string IDs and missing events are rejected', t => {
  const { directory, data } = fixture(t);
  for (const id of [undefined, 1, '', '../escape', 'Upper', 'two words', 'older']) {
    const invalid = structuredClone(data);
    invalid.talks[1].id = id;
    assert.throws(() => validateCatalog(invalid, directory), /Invalid or duplicate talk id/);
  }
  for (const event of [undefined, '', '   ', null, 123]) {
    const invalid = structuredClone(data);
    invalid.talks[0].event = event;
    assert.throws(() => validateCatalog(invalid, directory), /Invalid event/);
  }
});

test('slides true derives the source path and requires an existing file', t => {
  const { directory, data } = fixture(t);
  const catalog = validateCatalog(data, directory);
  assert.equal(catalog.talks.find(talk => talk.id === 'first').slides, '2026/2026-01-01-first/slides.md');
  rmSync(resolve(directory, '2026/2026-01-01-first/slides.md'));
  assert.throws(() => validateCatalog(data, directory), /Talk "first" \(2026-01-01\): missing Slidev source: 2026\/2026-01-01-first\/slides\.md/);
});

test('omitted or false slides is PDF-only and other values are rejected', t => {
  const { directory, data } = fixture(t);
  data.talks[1].slides = false;
  const catalog = validateCatalog(data, directory);
  assert.equal(catalog.talks.find(talk => talk.id === 'older').slides, undefined);
  assert.equal(catalog.talks.find(talk => talk.id === 'first').slides, undefined);
  assert.ok(!renderIndex(catalog).includes('href="/slides/first/"'));
  assert.ok(renderReadmeTable(catalog).includes('[<img src="tooling/site/icons/file-pdf.svg" width="20" height="20" alt="PDF 다운로드">](2026/2026-01-01-first.pdf?raw=true)'));
  for (const slides of ['true', '2026/example/slides.md', 1, null]) {
    data.talks[1].slides = slides;
    assert.throws(() => validateCatalog(data, directory), /slides must be a boolean/);
  }
});

test('year-directory IDs and site filenames cannot become presentation routes', t => {
  const { directory, data } = fixture(t);
  for (const id of ['2025', '2026', '2099']) {
    const invalid = structuredClone(data);
    invalid.talks[1].id = id;
    assert.throws(() => validateCatalog(invalid, directory), /Reserved talk id/);
  }
  for (const id of ['site.css', 'index.html', '.nojekyll']) {
    const invalid = structuredClone(data);
    invalid.talks[1].id = id;
    assert.throws(() => validateCatalog(invalid, directory), /Invalid or duplicate talk id/);
  }
});
