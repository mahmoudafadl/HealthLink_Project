/* ============================================================
   HEALTHLINK — DOCTOR CONTROLLER
   UI + Backend Integration
 ============================================================ */

import DoctorService from '../services/doctorService.js';
import { AppState } from '../app.js';
import ToastService from '../services/ToastService.js';
import ModalService from '../services/ModalService.js';
import AppointmentService from '../services/AppointmentService.js';
import Database from '../repositories/Database.js';
import * as api from '../repositories/apiRepository.js';

const DoctorController = (() => {

  const API = DoctorService;

  // =========================
  // 🔗 API CALLS
  // =========================

  async function fetchDoctors() {
    try {
      const doctors = await API.getDoctors();
      console.log("Doctors from backend:", doctors);
      AppState.doctors = doctors;
      return doctors;
    } catch (error) {
      console.error(error);
      ToastService.show("Failed to load doctors", "error");
      return [];
    }
  }

  async function getDoctorById(id) {
    return await API.getDoctorById(id);
  }

  async function rateDoctor(id, rate) {
    try {
      const data = await API.rateDoctor(id, rate);
      ToastService.show("Doctor rated successfully ⭐", "success");
      return data;
    } catch (error) {
      ToastService.show("Rating failed", "error");
    }
  }

  async function approveDoctor(id) {
    try {
      const res = await API.approveDoctor(id);
      ToastService.show("Doctor approved ✓", "success");
      return res;
    } catch (error) {
      ToastService.show("Approve failed", "error");
    }
  }

  async function rejectDoctor(id) {
    try {
      const res = await API.rejectDoctor(id);
      ToastService.show("Doctor rejected ✗", "warning");
      return res;
    } catch (error) {
      ToastService.show("Reject failed", "error");
    }
  }

  // FIXED:
  // Doctor domain uses doctor_profile.id
  async function fetchDoctorPatients() {
    try {

      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      const doctorId = user.id;

      console.log(
        "Loading doctor patients using doctorId:",
        doctorId
      );

      const patients =
        await api.getDoctorPatients(
          doctorId
        );

      AppState.docPatients =
        Array.isArray(patients)
          ? patients
          : [];

      return AppState.docPatients;

    } catch (error) {

      console.error(
        "Patient loading error:",
        error
      );

      AppState.docPatients = [];

      return [];
    }
  }

  // =========================
  // 📅 APPOINTMENT ACTIONS
  // =========================

  async function approveAppointment(id) {
    try {
      await api.updateAppointmentStatus(id, "approve");
      ToastService.show("Appointment approved ✓", "success");
      window.DoctorView?.renderAppointments();
      window.DoctorView?.renderDashboard();
    } catch (error) {
      ToastService.show("Approve failed", "error");
    }
  }

  async function rejectAppointment(id) {
    try {
      await api.updateAppointmentStatus(id, "reject");
      ToastService.show("Appointment rejected ✗", "warning");
      window.DoctorView?.renderAppointments();
      window.DoctorView?.renderDashboard();
    } catch (error) {
      ToastService.show("Reject failed", "error");
    }
  }

  async function completeAppointment(id) {
    try {
      await api.updateAppointmentStatus(id, "complete");
      ToastService.show("Appointment completed ✓", "success");
      window.DoctorView?.renderAppointments();
      window.DoctorView?.renderDashboard();
    } catch (error) {
      ToastService.show("Complete failed", "error");
    }
  }

  // =========================
  // 🎨 UI FUNCTIONS
  // =========================

  async function renderDoctors() {
    try {
      const doctors = await fetchDoctors();
      const container = document.getElementById("doctors-container");
      if (!container) return;

      const list = Array.isArray(doctors) ? doctors : [];
      if (list.length === 0) {
        container.innerHTML = "<p>No doctors found</p>";
        return;
      }

      container.innerHTML = list.map(doc => `
        <div class="card">
          <h3>${doc.fullName}</h3>
          <p>Specialization: ${doc.specialization || "Not set"}</p>
          <p>Experience: ${doc.experienceYears || 0} years</p>
          <p>Rating: ⭐ ${doc.rating ?? 0}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
            <button onclick="DoctorController.rateDoctor(${doc.id}, 5)">⭐ Rate 5</button>
            ${doc.status === "PENDING"
              ? `<button onclick="DoctorController.approveDoctor(${doc.id})">Approve</button>
                 <button onclick="DoctorController.rejectDoctor(${doc.id})">Reject</button>`
              : `<span style="color:green; font-weight:bold;">Approved</span>`
            }
          </div>
        </div>
      `).join("");
    } catch (error) {
      console.error(error);
      ToastService.show("Failed to load doctors", "error");
    }
  }

  function showPatientDetails(name) {
    ModalService.open('Patient: ' + name, `
      <div style="padding:10px;">
        <b>${name}</b>
        <p>Patient details here...</p>
      </div>
    `, [
      { label: 'Close', action: 'ModalService.close()' }
    ]);
  }

  function markComplete(index) {
    AppointmentService.markDoctorAppointmentComplete(index);
    ToastService.show('Appointment marked as completed ✓', 'success');
  }

  async function uploadDocument() {
    const patientId = document.getElementById("upload-patient-id")?.value;
    const type = document.getElementById("upload-doc-type")?.value;
    const notesArea = document.getElementById("upload-notes");

    if (!patientId) {
      ToastService.show("Please select a patient", "warning");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    const doctorId = user.id;

    const record = {
      patient: { id: parseInt(patientId) },
      doctor: { id: doctorId },
      documentType: type,
      medicalNotes: notesArea?.value || "",
      diagnosis: "See notes",
      prescription: "N/A"
    };

    try {
      await api.addClinicalRecord(record);
      ToastService.show('Clinical report uploaded successfully 📄', 'success');
      if (notesArea) notesArea.value = "";
      window.DoctorView?.renderDashboard();
    } catch (e) {
      ToastService.show("Failed to upload report", "error");
    }
  }

  function searchPatients(searchValue) {
    window.DoctorView?.renderPatients(searchValue);
  }

  async function markAlertRead(alertId) {
    try {
      await fetch(`http://localhost:8080/api/alerts/${alertId}/read`, {
        method: "PUT"
      });

      window.DoctorView?.renderAlerts();

    } catch (e) {
      console.error(e);
    }
  }

  async function createTestAppointment() {
    try {

      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      const today =
        new Date()
          .toISOString()
          .split('T')[0];

      let patientId = 1;

      const patients =
        AppState.docPatients || [];

      if (patients.length > 0) {
        patientId = patients[0].id;
      }

      // Appointments use users.id
      const payload = {
        patientId: patientId,
        doctorId: user.id,
        appointmentDate: today,
        appointmentTime: "10:00:00",
        visitType: "Test",
        reason: "System verification test"
      };

      console.log(
        "Creating test appointment with payload:",
        payload
      );

      await api.createAppointment(payload);

      ToastService.show(
        "Test appointment created! ✓",
        "success"
      );

      await fetchDoctorPatients();

      window.DoctorView?.renderDashboard();
      window.DoctorView?.renderAppointments();

    } catch (e) {

      console.error(
        "Test creation error:",
        e
      );

      ToastService.show(
        `Test failed: ${e.message}`,
        "error"
      );
    }
  }

  return {
    fetchDoctors,
    getDoctorById,
    rateDoctor,
    approveDoctor,
    rejectDoctor,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    renderDoctors,
    markComplete,
    uploadDocument,
    searchPatients,
    showPatientDetails,
    markAlertRead,
    fetchDoctorPatients,
    createTestAppointment
  };

})();

export default DoctorController;
window.DoctorController = DoctorController;