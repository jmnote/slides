import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../site/assets/language.js', import.meta.url), 'utf8');

function load({ saved, languages = ['en'], blocked = false } = {}) {
  const storage = new Map(saved ? [['jmnote.language', saved]] : []);
  const listeners = [];
  class Element {
    constructor(language) { this.dataset = { language }; }
    closest(selector) { return selector === 'a[data-language]' && this.dataset.language ? this : null; }
  }
  const window = {};
  vm.runInNewContext(script, {
    window, Element, navigator: { languages },
    document: { addEventListener: (type, listener) => listeners.push(listener) },
    localStorage: {
      getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key); },
      setItem(key, value) { if (blocked) throw Error('blocked'); storage.set(key, value); },
    },
  });
  const click = language => listeners.forEach(listener => listener({ target: new Element(language) }));
  return { language: window.jmnoteLanguage, storage, click };
}

test('root language follows saved choice, then browser, then English', () => {
  assert.equal(load({ saved: 'ko', languages: ['en-US'] }).language.preferred(), 'ko');
  assert.equal(load({ languages: ['fr', 'ko-KR', 'en-US'] }).language.preferred(), 'ko');
  assert.equal(load({ languages: ['fr'] }).language.preferred(), 'en');
  assert.equal(load({ saved: 'fr', languages: ['en'] }).language.preferred(), 'en');
});

test('language links save the explicit choice; automatic selection saves nothing', () => {
  const page = load({ languages: ['ko'] });
  page.language.preferred();
  assert.equal(page.storage.size, 0);
  page.click('en');
  assert.equal(page.storage.get('jmnote.language'), 'en');
  page.click(undefined);
  assert.equal(page.storage.get('jmnote.language'), 'en');
});

test('blocked storage still falls back to the browser language', () => {
  const page = load({ blocked: true, languages: ['ko'] });
  assert.equal(page.language.preferred(), 'ko');
  assert.doesNotThrow(() => page.click('en'));
});
