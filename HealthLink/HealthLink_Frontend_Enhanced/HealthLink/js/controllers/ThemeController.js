/* ============================================================
   HEALTHLINK — THEME CONTROLLER
   Manages Light / Dark mode toggle.
============================================================ */

const ThemeController = (() => {
  const STORAGE_KEY = 'healthlink-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  const ICONS = { dark: '🌙', light: '☀️' };

  function _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = ICONS[theme];
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  /**
   * Toggle between light and dark themes.
   */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || DARK;
    _applyTheme(current === DARK ? LIGHT : DARK);
  }

  /**
   * Load persisted theme on app start.
   */
  function init() {
    let saved = DARK;
    try { saved = localStorage.getItem(STORAGE_KEY) || DARK; } catch (_) {}
    _applyTheme(saved);
  }

  return { toggle, init };
})();

export default ThemeController;
window.ThemeController = ThemeController;
