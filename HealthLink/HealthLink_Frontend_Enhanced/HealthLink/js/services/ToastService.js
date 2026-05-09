/* ============================================================
   HEALTHLINK — TOAST SERVICE
   Handles all in-app toast notification rendering.
============================================================ */

const ToastService = (() => {
  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const DURATION_MS = 3500;
  const FADE_MS = 300;

  /**
   * Display a toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'info'|'warning'} type - Toast type.
   */
  function show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${ICONS[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.cssText = `opacity:0;transform:translateX(20px);transition:${FADE_MS}ms`;
      setTimeout(() => toast.remove(), FADE_MS);
    }, DURATION_MS);
  }

  return { show };
})();

export default ToastService;
window.ToastService = ToastService;
