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
    site: { title: 'Talks', description: 'Archive', base: '/', origin: 'https://example.github.io', repository: 'https://github.com/example/site' },
    talks: [
      { id: 'older', date: '2025-01-01', event: 'Community Meetup', title: '지난 발표' },
      { id: 'first', date: '2026-01-01', event: 'Community Meetup', title: '첫 발표', slides: true },
      { id: 'second', date: '2026-02-01', event: 'Community Meetup', title: '두 번째 발표', slides: true },
    ],
  };
  return { directory, data };
}

test('template showcase link appears only when requested', t => {
  const { directory, data } = fixture(t);
  const catalog = validateCatalog(data, directory);
  assert.ok(!renderIndex(catalog, 'en').includes('template-showcase'));
  assert.ok(renderIndex(catalog, 'en', { showcase: true }).includes('href="/ko/slides/template-showcase/">Template Showcase</a>'));
});

test('multiple decks and derived PDF paths keep independent URLs under a shared base', t => {
  const { directory, data } = fixture(t);
  const catalog = validateCatalog(data, directory);
  assert.deepEqual(catalog.talks.map(talk => talk.id), ['second', 'first', 'older']);
  const html = renderIndex(catalog, 'ko');
  assert.ok(html.includes('href="/ko/slides/first/"'));
  assert.ok(html.includes('href="/ko/slides/second/"'));
  assert.ok(html.includes('href="/ko/slides/2025/2025-01-01-older.pdf"'));
  assert.ok(renderIndex(catalog, 'en').includes('<meta property="og:title" content="Talks">'));
  assert.ok(html.includes('<meta name="twitter:card" content="summary">'));
  assert.ok(html.includes('<link rel="canonical" href="https://example.github.io/ko/slides/">'));
  assert.ok(renderReadmeTable(catalog).includes('[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](https://example.github.io/ko/slides/second/)'));
  assert.ok(renderReadmeTable(catalog).startsWith('| 제목 | 웹 | PDF | 날짜 | 행사 |'));
  assert.ok(renderReadmeTable(catalog).includes('| Community Meetup |'));
  data.site.base = '/site/';
  assert.ok(renderIndex(validateCatalog(data, directory), 'ko').includes('href="/site/ko/slides/second/"'));
  assert.ok(renderReadmeTable(validateCatalog(data, directory)).includes('https://example.github.io/site/ko/slides/second/'));
});

test('each language gets its own list page with hreflang alternates', t => {
  const { directory, data } = fixture(t);
  data.talks[1].title_en = 'First Presentation';
  const catalog = validateCatalog(data, directory);
  const en = renderIndex(catalog, 'en');
  const ko = renderIndex(catalog, 'ko');
  assert.ok(en.includes('<html lang="en">') && ko.includes('<html lang="ko">'));
  assert.ok(en.includes('hreflang="ko">First Presentation</a>'), 'English list links the Korean deck and marks its language');
  assert.ok(ko.includes('>첫 발표</a>'));
  for (const html of [en, ko]) {
    assert.ok(html.includes('<link rel="alternate" hreflang="en" href="https://example.github.io/en/slides/">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="ko" href="https://example.github.io/ko/slides/">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://example.github.io/en/slides/">'));
    assert.ok(!html.includes('data-en') && !html.includes('?lang'));
  }
  assert.ok(en.includes('<a href="/ko/slides/" hreflang="ko" lang="ko" data-language="ko">한국어</a>'));
  assert.ok(en.includes('<a href="/en/slides/" hreflang="en" lang="en" data-language="en" class="active" aria-current="true">English</a>'));
  assert.ok(en.includes('<a href="/en/">Home</a>') && ko.includes('<a href="/ko/slides/" aria-current="page">슬라이드</a>'));
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
  const html = renderIndex(validateCatalog(data, directory), 'ko');
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
  assert.ok(!renderIndex(catalog, 'ko').includes('href="/ko/slides/first/"'));
  assert.ok(renderReadmeTable(catalog).includes('[<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2026/2026-01-01-first.pdf?raw=true)'));
  for (const slides of ['true', '2026/example/slides.md', 1, null]) {
    data.talks[1].slides = slides;
    assert.throws(() => validateCatalog(data, directory), /slides must be a boolean/);
  }
});

test('year-directory IDs and site filenames cannot become presentation routes', t => {
  const { directory, data } = fixture(t);
  for (const id of ['2025', '2026', '2099', 'template-showcase']) {
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

test('English slide sources are explicit and must exist', t => {
  const { directory, data } = fixture(t);
  data.talks[1].slides_en = true;
  assert.throws(() => validateCatalog(data, directory), /missing Slidev source/);
  writeFileSync(resolve(directory, '2026/2026-01-01-first/slides.en.md'), '# English');
  assert.equal(validateCatalog(data, directory).talks.find(talk => talk.id === 'first').slidesEn, '2026/2026-01-01-first/slides.en.md');
  const catalog = validateCatalog(data, directory);
  assert.ok(renderIndex(catalog, 'en').includes('href="/en/slides/first/"'));
  assert.ok(renderIndex(catalog, 'ko').includes('href="/ko/slides/first/"'));
  data.talks[1].slides = false;
  assert.throws(() => validateCatalog(data, directory), /requires slides/);
});
