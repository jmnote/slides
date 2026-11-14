// Shared contract with jmnote.com/slides/: lang query > saved choice > browser > en.
(() => {
  const key = 'jmnote.language';
  const supported = value => value === 'ko' || value === 'en';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage may be disabled. */ }
  const explicit = new URL(location.href).searchParams.get('lang');
  const browser = (navigator.languages || [navigator.language])
    .map(value => String(value).toLowerCase().split('-')[0]).find(supported);
  const lang = supported(explicit) ? explicit : supported(saved) ? saved : browser || 'en';
  if (supported(explicit)) {
    try { localStorage.setItem(key, lang); } catch { /* Storage may be disabled. */ }
  }
  document.documentElement.lang = lang;
  if (lang !== 'en') {
    document.documentElement.dataset.languageLoading = 'true';
    setTimeout(() => { delete document.documentElement.dataset.languageLoading; }, 3000);
  }
  const apply = () => {
    try {
    document.querySelectorAll('[data-en][data-ko]').forEach(element => {
      element.textContent = element.getAttribute('data-' + lang);
    });
    for (const attr of ['content', 'aria-label', 'title', 'alt']) {
      document.querySelectorAll('[data-ko-' + attr + ']').forEach(element => {
        element.setAttribute(attr, element.getAttribute('data-' + lang + '-' + attr));
      });
    }
    document.querySelectorAll('[data-language]').forEach(link => {
      const target = new URL(location.href);
      target.searchParams.set('lang', link.dataset.language);
      link.href = target.href;
      link.classList.toggle('active', link.dataset.language === lang);
      if (link.dataset.language === lang) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    // Carry explicit choices through navigation even when storage is unavailable.
    if (supported(explicit)) document.querySelectorAll('a[data-language-nav]').forEach(link => {
      const target = new URL(link.href);
      target.searchParams.set('lang', lang);
      link.href = target.href;
    });
    } finally {
      delete document.documentElement.dataset.languageLoading;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
