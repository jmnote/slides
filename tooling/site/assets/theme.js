(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  const getSavedTheme = () => localStorage.getItem('theme') || localStorage.getItem('DARK_LIGHT_THEME');
  const setSavedTheme = (theme) => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('DARK_LIGHT_THEME', theme);
  };

  const updateUI = () => {
    const isDark = root.dataset.theme !== 'light';
    const nextTheme = isDark ? 'light' : 'dark';
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      toggle.setAttribute('title', `Switch to ${nextTheme} theme`);
    }
    if (icon) {
      // Determine root-relative path for asset
      const isKo = window.location.pathname.startsWith('/ko');
      const base = isKo ? '../assets' : 'assets';
      icon.src = isDark ? `${base}/sun.svg` : `${base}/moon.svg`;
    }
  };

  updateUI();

  if (toggle) {
    toggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = nextTheme;
      setSavedTheme(nextTheme);
      updateUI();
    });
  }
})();
