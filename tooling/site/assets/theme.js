(() => {
  const root = document.documentElement;

  const getSavedTheme = () => {
    try {
      return localStorage.getItem('theme') || localStorage.getItem('DARK_LIGHT_THEME');
    } catch {
      return null;
    }
  };

  const getPreferredTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
  };

  // 1. Immediately apply saved or system theme to root (prevents FOUC)
  const initialTheme = getSavedTheme() || getPreferredTheme();
  applyTheme(initialTheme);

  // 2. Setup interactive UI when DOM is ready
  const setupUI = () => {
    const toggle = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const isKo = document.documentElement.lang === 'ko';

    const updateUI = () => {
      const isDark = root.dataset.theme !== 'light';
      const nextTheme = isDark ? 'light' : 'dark';

      if (toggle) {
        const label = isKo
          ? (isDark ? '라이트 모드로 전환' : '다크 모드로 전환')
          : `Switch to ${nextTheme} theme`;
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('title', label);
      }

      if (icon) {
        const src = icon.getAttribute('src') || '';
        const targetIcon = isDark ? 'sun.svg' : 'moon.svg';
        const newSrc = src.replace(/(sun|moon)\.svg$/, targetIcon);
        if (newSrc && newSrc !== src) {
          icon.setAttribute('src', newSrc);
        }
      }
    };

    updateUI();

    if (toggle) {
      toggle.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        try {
          localStorage.setItem('theme', nextTheme);
          localStorage.setItem('DARK_LIGHT_THEME', nextTheme);
        } catch {
          // ignore localStorage error in private mode
        }
        updateUI();
      });
    }

    // Sync across open tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme' || e.key === 'DARK_LIGHT_THEME') {
        const newTheme = e.newValue || getPreferredTheme();
        applyTheme(newTheme);
        updateUI();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUI);
  } else {
    setupUI();
  }
})();
