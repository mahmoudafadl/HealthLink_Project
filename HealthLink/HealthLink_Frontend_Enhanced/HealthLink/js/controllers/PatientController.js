/* ============================================================
   HEALTHLINK — PATIENT CONTROLLER (INTEGRATED)
   Handles all patient-facing action handlers.
============================================================ */

import * as api from '../repositories/apiRepository.js';
import AppointmentService from '../services/AppointmentService.js';
import NurseService from '../services/NurseService.js';
import FeedbackService from '../services/FeedbackService.js';
import BillingService from '../services/BillingService.js';
import ToastService from '../services/ToastService.js';
import ModalService from '../services/ModalService.js';
import NavigationController from './NavigationController.js';
import { AppState } from '../app.js';

const PatientController = (() => {

  /* ---- DASHBOARD LOADING ---- */

  async function loadDashboard() {
    try {
      // 1. Fetch data
      const doctors = await api.getDoctors();
      AppState.doctors = doctors;

      // 2. Render UI
      window.PatientView?.loadHomeUserInfo();
      window.PatientView?.renderHomeStats();
      window.PatientView?.renderDoctors();
      window.PatientView?.renderAppointmentsTable();
      window.PatientView?.renderMedicalHistory();
      window.PatientView?.renderHomeServices();
      window.PatientView?.renderWallet();
      window.PatientView?.renderDoctorDropdown();
      window.PatientView?.renderFeedbackDoctorList();
      window.PatientView?.renderPatientFeedback();

    } catch (e) {
      console.error("Dashboard Load Error:", e);
      ToastService.show("Failed to load dashboard data", "error");
    }
  }

  /* ---- DOCTORS ---- */

  /**
   * Navigate to book-appointment page with this doctor pre-selected.
   */
  function viewDoctor(profileId) {
    window.NavigationController.navigate('book-appointment');
    // After navigation re-render, pre-select the correct doctor by userId
    setTimeout(() => {
      const select = document.getElementById('book-doctor');
      if (!select) return;
      // Find the doctor whose profile id matches
      const doctor = (AppState.doctors || []).find(d => d.id === profileId);
      if (doctor && doctor.userId) {
        select.value = String(doctor.userId);
      }
    }, 150);
  }

  function filterDoctors(searchValue) {
    window.PatientView?.renderDoctors(AppState.specFilter, searchValue);
  }

  function filterBySpec(el, spec) {
    document.querySelectorAll('#spec-filter .filter-tab').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    AppState.specFilter = spec;
    window.PatientView?.renderDoctors(spec, document.getElementById('doctor-search-input')?.value || '');
  }

  /* ---- APPOINTMENTS ---- */

  async function bookAppointment() {
    const btn = document.querySelector('#page-book-appointment .btn-primary');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Processing...";
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const rawDoctorId = document.getElementById("book-doctor")?.value;
      const appointmentDate = document.getElementById("book-date")?.value;
      const appointmentTime = document.getElementById("book-time")?.value || "09:00:00";
      const reason = document.querySelector('#page-book-appointment textarea')?.value || "General checkup";
      const visitType = document.getElementById("visit-type")?.value || "In-Clinic";

      if (!rawDoctorId || !appointmentDate) {
         throw new Error("Please select a doctor and date");
      }

      const payload = {
        patientId: user.id,
        doctorId: parseInt(rawDoctorId),  // This is now the User ID from userId-based dropdown
        appointmentDate,
        appointmentTime,
        visitType,
        reason
      };

      await AppointmentService.bookAppointment(payload);
      
      ToastService.show("Appointment booked successfully 📅", "success");
      NavigationController.navigate('my-appointments');
      window.PatientView?.renderAppointmentsTable();
      window.PatientView?.renderWallet();
      window.PatientView?.renderHomeStats();

    } catch (e) {
      console.error(e);
      ToastService.show(e.message || "Booking failed", "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Confirm Booking & Deduct EGP 100 →";
      }
    }
  }

  async function cancelAppointment(id) {
    try {
      await AppointmentService.cancelAppointment(id);
      ToastService.show("Appointment cancelled successfully", "success");
      window.PatientView?.renderAppointmentsTable();
      window.PatientView?.renderHomeStats();
    } catch (e) {
      ToastService.show(e.message || "Cancellation failed", "error");
    }
  }

  /* ---- HOME SERVICES ---- */

  async function requestHomeService() {
    const serviceType = document.getElementById('service-type')?.value;
    const address = document.getElementById('service-address')?.value;
    const contactNumber = document.getElementById('service-phone')?.value;
    const btn = document.querySelector('#page-home-services .btn-primary');

    if (!address || !contactNumber) {
      ToastService.show("Address and Contact Phone are required", "warning");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Processing...";
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // nurseId is null as per requirement 5
      await NurseService.requestHomeService(user.id, null, serviceType, address, contactNumber);
      
      ToastService.show('Home service request submitted! 🏠', 'success');
      window.PatientView?.renderHomeServices();
      window.PatientView?.renderWallet();
    } catch (e) {
      ToastService.show(e.message || "Request failed", "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit Request →";
      }
    }
  }

  async function cancelHomeService(id) {
    if (!confirm("Are you sure you want to cancel this request? The fee will be refunded to your wallet.")) return;
    try {
      await api.updateHomeServiceStatus(id, 'CANCELLED');
      ToastService.show("Request cancelled and refunded.", "success");
      window.PatientView?.renderHomeServices();
      window.PatientView?.renderWallet();
    } catch (e) {
      ToastService.show(e.message || "Cancellation failed", "error");
    }
  }

  /* ---- FEEDBACK / RATINGS ---- */

  function setRating(val) {
    AppState.currentRating = val;
    document.querySelectorAll('#star-rating span').forEach((s, i) => {
      s.classList.toggle('active', i < val);
    });
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    document.getElementById('rating-label').textContent = `${val}/5 — ${labels[val]}`;
  }

  async function submitFeedback() {
    const target = document.getElementById('feedback-target')?.value;
    const content = document.getElementById('feedback-text')?.value?.trim();

    if (!AppState.currentRating) {
      ToastService.show("Please select a rating", "error");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await FeedbackService.submitReview(user.id, content, AppState.currentRating);
      
      ToastService.show("Thanks for your feedback ⭐", "success");

      window.PatientView
          ?.renderPatientFeedback?.();
      // Reset
      AppState.currentRating = 0;
      document.querySelectorAll('#star-rating span').forEach(s => s.classList.remove('active'));
      document.getElementById('feedback-text').value = '';
    } catch (e) {
      ToastService.show(e.message || "Submission failed", "error");
    }
  }

  /* ---- WALLET ---- */

  function showTopupModal() {
    ModalService.open(
      'Top Up Wallet',
      `<div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Top-up Amount</label>
          <select class="form-control" id="topup-amount">
            <option value="200">EGP 200</option>
            <option value="500">EGP 500</option>
            <option value="1000">EGP 1,000</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <select class="form-control" id="topup-method">
            <option value="Visa">Visa / Mastercard</option>
            <option value="Fawry">Fawry</option>
          </select>
        </div>
      </div>`,
      [
        { label: 'Confirm Top-up', cls: 'btn-primary', action: 'PatientController.confirmTopup()' },
        { label: 'Cancel',         cls: 'btn-ghost',   action: 'ModalService.close()' }
      ]
    );
  }

  async function confirmTopup() {
    const amount = parseInt(document.getElementById('topup-amount')?.value || 500);
    const method = document.getElementById('topup-method')?.value || "Visa";
    
    try {
      await BillingService.topUp(amount, method);
      ModalService.close();
      ToastService.show(`EGP ${amount} added to wallet!`, 'success');
      window.PatientView?.renderWallet();
      window.PatientView?.renderHomeStats();
    } catch (e) {
      ToastService.show(e.message || "Failed to process top-up", "error");
    }
  }

  return {
    loadDashboard,
    filterDoctors,
    filterBySpec,
    viewDoctor,
    bookAppointment,
    cancelAppointment,
    requestHomeService,
    cancelHomeService,
    setRating,
    submitFeedback,
    showTopupModal,
    confirmTopup
  };
})();

export default PatientController;
window.PatientController = PatientController;
