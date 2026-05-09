/* ============================================================
   HEALTHLINK — NURSE SERVICE (INTEGRATED)
   Business logic for home service requests and nurse dashboard.
============================================================ */

import * as api from '../repositories/apiRepository.js';

const NurseService = (() => {

  /**
   * Patient creates a home service request.
   */
  async function requestHomeService(patientId, nurseId, serviceType, address, contactNumber) {
    const request = {
      patient: { id: patientId },
      ...(nurseId ? { nurse: { id: nurseId } } : {}),  // omit nurse if not assigned
      serviceType,
      address,
      contactNumber
    };
    return await api.createHomeServiceRequest(request);
  }

  /**
   * Nurse gets available requests (not assigned).
   */
  async function getAvailableRequests() {
    return await api.getAvailableHomeServiceRequests();
  }

  /**
   * Nurse accepts a request.
   */
  async function acceptRequest(requestId, nurseId) {
    return await api.acceptHomeServiceRequest(requestId, nurseId);
  }

  /**
   * Nurse gets her assigned requests.
   */
  async function getMyRequests(nurseId) {
    return await api.getNurseRequests(nurseId);
  }

  /**
   * Nurse updates request status (APPROVE, REJECT, COMPLETE).
   */
  async function updateRequestStatus(requestId, status) {
    return await api.updateHomeServiceStatus(requestId, status);
  }

  return { requestHomeService, getMyRequests, getAvailableRequests, acceptRequest, updateRequestStatus };
})();

export default NurseService;
window.NurseService = NurseService;
