import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from './catalog.mjs';
import { loadHome, validateHome, renderHome, renderRoot, renderSitemap, renderRobots } from './pages.mjs';

const { site } = loadCatalog();
const home = {
  title: 'Jmnote',
  greeting: { en: "Hi, I'm Jmnote", ko: '안녕하세요' },
  bio: { en: 'Engineer', ko: '엔지니어' },
  groups: [
    { owner: 'jmnote', repos: [
      { name: 'Zeta', repo: 'zeta', description: { en: 'Last', ko: '마지막' } },
      { name: 'alpha', repo: 'Alpha', description: { en: 'First <b>', ko: '처음' } },
    ] },
    { owner: 'mailapi', repos: [{ name: 'Mail API', repo: 'mailapi', description: { en: 'Mail', ko: '메일' } }] },
  ],
};

test('home repos are sorted by repository name within each group, case-insensitively', () => {
  const sorted = validateHome(structuredClone(home));
  assert.deepEqual(sorted.groups[0].repos.map(repo => repo.repo), ['Alpha', 'zeta']);
  assert.deepEqual(sorted.groups.map(group => group.owner), ['jmnote', 'mailapi']);
});

test('home content requires both languages', () => {
  const missing = structuredClone(home);
  delete missing.groups[0].repos[0].description.ko;
  assert.throws(() => validateHome(missing), /repo needs name, repo, description/);
  assert.throws(() => validateHome({ ...home, bio: { en: 'x' } }), /bio/);
});

test('home renders one language per page with escaped text and hreflang alternates', () => {
  const data = validateHome(structuredClone(home));
  const en = renderHome(site, 'en', data);
  const ko = renderHome(site, 'ko', data);
  assert.ok(en.includes('<html lang="en">') && ko.includes('<html lang="ko">'));
  assert.ok(en.includes('<h1>Hi, I&#39;m Jmnote</h1>') && ko.includes('<h1>안녕하세요</h1>'));
  assert.ok(en.includes('<td class="col-desc">First &lt;b&gt;</td>') && ko.includes('<td class="col-desc">처음</td>'));
  assert.ok(en.indexOf('github.com/jmnote/Alpha') < en.indexOf('github.com/jmnote/zeta'));
  assert.ok(ko.includes('<link rel="canonical" href="https://jmnote.com/ko/">'));
  assert.ok(ko.includes('<link rel="alternate" hreflang="x-default" href="https://jmnote.com/">'));
  assert.ok(ko.includes('<a href="/ko/" aria-current="page">홈</a>') && ko.includes('<a href="/ko/slides/">슬라이드</a>'));
});

test('the real home content loads', () => {
  const data = loadHome();
  assert.ok(data.groups.some(group => group.repos.some(repo => repo.repo === 'jmnote.github.io')));
});

test('root page picks a language and still offers both links without JavaScript', () => {
  const html = renderRoot(site);
  assert.ok(html.includes('jmnoteLanguage.preferred()'));
  assert.ok(html.includes('<a href="/en/"') && html.includes('<a href="/ko/"'));
  assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://jmnote.com/">'));
});

test('sitemap lists language pages, decks per language, and PDFs under /ko/slides/', () => {
  const catalog = loadCatalog();
  const xml = renderSitemap(catalog);
  for (const path of ['en/', 'ko/', 'en/slides/', 'ko/slides/', 'ko/slides/k8s-ai-agent/', 'en/slides/k8s-ai-agent/', 'ko/slides/2026/2026-10-28-k8s-ai-agent.pdf'])
    assert.ok(xml.includes(`<loc>https://jmnote.com/${path}</loc>`), path);
  assert.ok(!xml.includes('en/slides/go-tests/'));
  assert.ok(renderRobots(catalog.site).includes('Sitemap: https://jmnote.com/sitemap.xml'));
});
