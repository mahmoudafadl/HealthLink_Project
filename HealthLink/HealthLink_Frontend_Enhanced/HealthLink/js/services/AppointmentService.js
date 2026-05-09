/* ============================================================
   HEALTHLINK — APPOINTMENT SERVICE (INTEGRATED)
============================================================ */

import * as api from '../repositories/apiRepository.js';

const AppointmentService = (() => {
  const BOOKING_FEE = 100;

  async function bookAppointment(data) {
    // Backend handles fee deduction internally — do NOT call api.deduct() here
    return await api.createAppointment(data);
  }

  async function getPatientAppointments(patientId) {
    return await api.getPatientAppointments(patientId);
  }

  async function getDoctorAppointments(doctorId) {
    return await api.getDoctorAppointments(doctorId);
  }

  async function cancelAppointment(id) {
    return await api.updateAppointmentStatus(id, 'cancel');
  }

  async function approveAppointment(id) {
    return await api.updateAppointmentStatus(id, 'approve');
  }

  async function rejectAppointment(id) {
    return await api.updateAppointmentStatus(id, 'reject');
  }

  async function completeAppointment(id) {
    return await api.updateAppointmentStatus(id, 'complete');
  }

  return { 
    bookAppointment, 
    getPatientAppointments, 
    getDoctorAppointments,
    cancelAppointment, 
    approveAppointment, 
    rejectAppointment, 
    completeAppointment 
  };
})();

export default AppointmentService;
window.AppointmentService = AppointmentService;
