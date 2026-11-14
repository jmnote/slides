// Language lives in the URL path (/en/, /ko/). This script remembers explicit choices from
// language links and picks the entry language on the root page: saved choice > browser > en.
(() => {
  const key = 'jmnote.language';
  const supported = value => value === 'ko' || value === 'en';
  const save = language => {
    try { localStorage.setItem(key, language); } catch { /* Storage may be disabled. */ }
  };
  const preferred = () => {
    let saved;
    try { saved = localStorage.getItem(key); } catch { /* Storage may be disabled. */ }
    if (supported(saved)) return saved;
    const browser = (navigator.languages || [navigator.language])
      .map(value => String(value).toLowerCase().split('-')[0]).find(supported);
    return browser || 'en';
  };
  window.jmnoteLanguage = { preferred, save };
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[data-language]') : null;
    if (link && supported(link.dataset.language)) save(link.dataset.language);
  });
})();
