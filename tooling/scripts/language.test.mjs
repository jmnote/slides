import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../site/assets/language.js', import.meta.url), 'utf8');
function visit({ query = '', saved, languages = ['en'], blocked = false } = {}) {
  const storage = new Map(saved ? [['jmnote.language', saved]] : []);
  const location = { href: `https://jmnote.com/slides/${query}#/7` };
  const attrs = {};
  const link = { dataset: { language: 'ko' }, classList: { toggle() {} }, setAttribute(k, v) { attrs[k] = v; }, removeAttribute(k) { delete attrs[k]; } };
  const nav = { href: 'https://jmnote.com/' };
  const document = {
    documentElement: { dataset: {} }, readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '[data-language]') return [link];
      if (selector === 'a[data-language-nav]') return [nav];
      return [];
    },
  };
  vm.runInNewContext(script, {
    URL, location, setTimeout() {}, navigator: { languages }, document,
    localStorage: {
      getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k); },
      setItem(k, v) { if (blocked) throw Error('blocked'); storage.set(k, v); },
    },
  });
  return { lang: document.documentElement.lang, storage, link, nav, location };
}

test('explicit language overrides saved and browser choice and is saved', () => {
  const result = visit({ query: '?lang=ko', saved: 'en' });
  assert.equal(result.lang, 'ko');
  assert.equal(result.storage.get('jmnote.language'), 'ko');
  assert.equal(result.nav.href, 'https://jmnote.com/?lang=ko');
});
test('saved choice overrides browser without adding a query or saving automatic choices', () => {
  assert.equal(visit({ saved: 'en', languages: ['ko-KR'] }).lang, 'en');
  const result = visit({ languages: ['fr', 'ko-KR', 'en-US'] });
  assert.equal(result.lang, 'ko');
  assert.equal(result.storage.size, 0);
  assert.equal(result.location.href, 'https://jmnote.com/slides/#/7');
});
test('unsupported languages fall back to English; invalid query falls through', () => {
  assert.equal(visit({ languages: ['fr'] }).lang, 'en');
  assert.equal(visit({ query: '?lang=fr', saved: 'ko' }).lang, 'ko');
});
test('blocked storage still supports browser selection and explicit navigation', () => {
  assert.equal(visit({ blocked: true, languages: ['ko'] }).lang, 'ko');
  const result = visit({ query: '?lang=en&foo=bar', blocked: true });
  assert.equal(result.nav.href, 'https://jmnote.com/?lang=en');
  assert.equal(result.link.href, 'https://jmnote.com/slides/?lang=ko&foo=bar#/7');
});
