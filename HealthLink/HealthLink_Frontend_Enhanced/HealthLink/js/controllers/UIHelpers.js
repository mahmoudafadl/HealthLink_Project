/* ============================================================
   HEALTHLINK — UI HELPERS
   Small reusable UI utility functions.
============================================================ */

const UIHelpers = (() => {

  /**
   * Set the active tab within a .filter-tabs container.
   * @param {HTMLElement} el - The tab element clicked.
   */
  function setTabActive(el) {
    el.closest('.filter-tabs').querySelectorAll('.filter-tab')
      .forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }

  /**
   * Set default values for all date inputs on the page
   * (min = today, default value = today).
   */
  function initDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
      input.min   = today;
      input.value = today;
    });
  }

  return { setTabActive, initDateInputs };
})();

export default UIHelpers;
window.UIHelpers = UIHelpers;
