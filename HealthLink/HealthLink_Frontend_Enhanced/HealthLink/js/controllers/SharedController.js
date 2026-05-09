/* ============================================================
   HEALTHLINK — SHARED CONTROLLER
   Actions shared across roles (Nurse, shared emergency, etc.)
============================================================ */

import EmergencyService from '../services/EmergencyService.js';
import NurseService from '../services/NurseService.js';
import ToastService from '../services/ToastService.js';
import NurseView from '../views/NurseView.js';

const SharedController = (() => {

  function dispatchAmbulance() {
    const result = EmergencyService.dispatchAmbulance();
    ToastService.show(result.message, 'success');
  }

  return { dispatchAmbulance };
})();

/* ============================================================
   NURSE CONTROLLER (INTEGRATED)
   Handles nurse-specific dashboard actions.
============================================================ */

const NurseController = (() => {

  async function acceptRequest(requestId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await NurseService.acceptRequest(requestId, user.id);
      NurseView.renderDashboard();
      ToastService.show('Service request accepted.', 'success');
    } catch (e) {
      ToastService.show(e.message || "Action failed", "error");
    }
  }

  async function rejectRequest(requestId) {
    try {
      await NurseService.updateRequestStatus(requestId, 'REJECTED');
      NurseView.renderDashboard();
      ToastService.show('Request rejected.', 'error');
    } catch (e) {
      ToastService.show(e.message || "Action failed", "error");
    }
  }

  async function completeRequest(requestId) {
    try {
      await NurseService.updateRequestStatus(requestId, 'COMPLETED');
      NurseView.renderDashboard();
      ToastService.show('Service marked complete ✅', 'success');
    } catch (e) {
      ToastService.show(e.message || "Action failed", "error");
    }
  }

  return { acceptRequest, rejectRequest, completeRequest };
})();

export { SharedController, NurseController };
export default SharedController;
window.SharedController = SharedController;
window.NurseController = NurseController;
