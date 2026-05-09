/* ============================================================
   HEALTHLINK — EMERGENCY SERVICE
   Business logic for emergency dispatching and management.
============================================================ */

const EmergencyService = (() => {

  /**
   * Dispatch ambulance for a specific emergency by index.
   */
  function dispatchEmergency(index) {
    if (Database.emergencies[index]) {
      Database.emergencies[index].status = 'Dispatched';
      return { success: true, message: '🚑 Ambulance dispatched! ETA: 6 minutes.' };
    }
    return { success: false, message: 'Emergency record not found.' };
  }

  /**
   * Dispatch a general ambulance (from patient emergency page).
   */
  function dispatchAmbulance() {
    return { success: true, message: '🚑 Ambulance dispatched! ETA: 8 minutes.' };
  }

  return { dispatchEmergency, dispatchAmbulance };
})();

export default EmergencyService;
window.EmergencyService = EmergencyService;
