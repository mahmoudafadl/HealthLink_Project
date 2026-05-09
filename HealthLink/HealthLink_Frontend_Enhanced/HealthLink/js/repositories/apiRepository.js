const API_URL = window.APP_CONFIG?.API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
}

// =========================
// 🔐 Auth Helpers
// =========================
export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function register(userData) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  return handleResponse(res);
}

// =========================
// 👨‍⚕️ Doctors
// =========================
export async function getDoctors() {
  const res = await fetch(`${API_URL}/api/doctors`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// =========================
// 📅 Appointments
// =========================
export async function createAppointment(data) {
  const res = await fetch(`${API_URL}/api/appointments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function getPatientAppointments(patientId) {
  const res = await fetch(`${API_URL}/api/appointments/patient/${patientId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getDoctorAppointments(doctorId) {
  const res = await fetch(`${API_URL}/api/appointments/doctor/${doctorId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function updateAppointmentStatus(id, action) {
  const res = await fetch(`${API_URL}/api/appointments/${id}/${action}`, {
    method: "PUT",
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// =========================
// 🏥 Clinical Records
// =========================
export async function addClinicalRecord(record) {
  const res = await fetch(`${API_URL}/api/clinical/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(record)
  });
  return handleResponse(res);
}

export async function getPatientRecords(patientId) {
  const res = await fetch(`${API_URL}/api/clinical/patient/${patientId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// =========================
// 💳 Billing
// =========================
export async function getBalance() {
  const res = await fetch(`${API_URL}/api/billing/balance`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function topUp(amount, method) {
  const res = await fetch(`${API_URL}/api/billing/topup`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, method })
  });
  return handleResponse(res);
}

export async function deduct(amount, appointmentId) {
  const res = await fetch(`${API_URL}/api/billing/deduct`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, appointmentId })
  });
  return handleResponse(res);
}

export async function getTransactions() {
  const res = await fetch(`${API_URL}/api/billing/transactions`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getAllTransactions() {
  const res = await fetch(`${API_URL}/api/billing/admin/transactions`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// =========================
// ⭐ Feedback
// =========================
export async function submitFeedback(feedback) {
  const res = await fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(feedback)
  });
  return handleResponse(res);
}

export async function getAllFeedback() {
  const res = await fetch(`${API_URL}/api/feedback`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getPatientFeedback(patientId) {

  const res =
    await fetch(

      `${API_URL}/api/feedback/patient/${patientId}`,

      {
        headers: getAuthHeaders()
      }

    );

  return handleResponse(res);

}

// =========================
// 🔔 Alerts
// =========================
export async function sendAlert(alert) {

  const res =
    await fetch(
      `${API_URL}/api/alerts/send`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(alert)
      }
    );

  if (!res.ok) {

    const error =
      await res.text();

    throw new Error(
      error || "Request failed"
    );
  }

  return await res.text();
}

// =========================
// 👩‍⚕️ Nurse Home Service
// =========================
export async function createHomeServiceRequest(request) {
  const res = await fetch(`${API_URL}/api/home-service-requests`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });
  return handleResponse(res);
}

export async function getNurseRequests(nurseId) {
  const res = await fetch(`${API_URL}/api/home-service-requests/nurse/${nurseId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getRequestsByPatient(patientId) {
  const res = await fetch(`${API_URL}/api/home-service-requests/patient/${patientId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function updateHomeServiceStatus(requestId, status) {
  const res = await fetch(`${API_URL}/api/home-service-requests/${requestId}/status?status=${status}`, {
    method: "PUT",
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getAvailableHomeServiceRequests() {
  const res = await fetch(`${API_URL}/api/home-service-requests/available`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function acceptHomeServiceRequest(requestId, nurseId) {
  const res = await fetch(`${API_URL}/api/home-service-requests/${requestId}/accept/${nurseId}`, {
    method: "PUT",
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// =========================
// 👨‍💼 Admin
// =========================
export async function getPendingRegistrations() {
  const res = await fetch(`${API_URL}/api/registrations/pending`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function approveRegistration(id) {
  const res = await fetch(`${API_URL}/api/registrations/${id}/approve`, {
    method: "PUT",
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function rejectRegistration(id, reason) {
  const res = await fetch(`${API_URL}/api/registrations/${id}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  return handleResponse(res);
}

export async function getActivityLogs() {
  const res = await fetch(`${API_URL}/api/admin/logs`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getDoctorPatients(doctorId) {
  const res = await fetch(`${API_URL}/api/doctors/${doctorId}/patients`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getClinicalRecordsByDoctor(doctorId) {
  const res = await fetch(`${API_URL}/api/clinical/doctor/${doctorId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getDoctorAlerts() {

  const res =
    await fetch(
      `${API_URL}/api/alerts/my`,
      {
        headers: getAuthHeaders()
      }
    );

  return handleResponse(res);
}

export async function getMyAlerts() {
  const res = await fetch(`${API_URL}/api/alerts/my`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// Expose globally
const api = {
  login, register, getDoctors, createAppointment, getPatientAppointments,
  getDoctorAppointments, updateAppointmentStatus, addClinicalRecord,
  getPatientRecords, getBalance, topUp, deduct, getTransactions, getAllTransactions,
  submitFeedback, getAllFeedback, getPatientFeedback, sendAlert, getDoctorAlerts: getMyAlerts, getMyAlerts,
  createHomeServiceRequest, getNurseRequests, getRequestsByPatient, updateHomeServiceStatus,
  getAvailableHomeServiceRequests, acceptHomeServiceRequest,
  getPendingRegistrations, approveRegistration, rejectRegistration,
  getActivityLogs, getDoctorPatients, getClinicalRecordsByDoctor
};
window.api = api;