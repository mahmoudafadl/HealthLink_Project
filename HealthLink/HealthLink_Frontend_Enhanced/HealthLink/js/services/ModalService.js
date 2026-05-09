/* ============================================================
   HEALTHLINK — MODAL SERVICE
   Manages the single shared modal dialog.
============================================================ */

const ModalService = (() => {
  function open(title, bodyHTML, buttons = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = buttons
      .map(b => `<button class="btn ${b.cls}" onclick="${b.action}">${b.label}</button>`)
      .join('');
    document.getElementById('modal-backdrop').classList.add('open');
  }

  function close() {
    document.getElementById('modal-backdrop').classList.remove('open');
  }

  function closeOnBackdrop(event) {
    if (event.target === document.getElementById('modal-backdrop')) close();
  }

  return { open, close, closeOnBackdrop };
})();

/* Legacy global alias used in inline HTML onclick attributes */
function closeModalDirect() { ModalService.close(); }

export default ModalService;
window.ModalService = ModalService;
