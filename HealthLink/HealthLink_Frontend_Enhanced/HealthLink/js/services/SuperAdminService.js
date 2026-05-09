/* ============================================================
   HEALTHLINK — SUPER ADMIN SERVICE
   Handles all API calls for the SuperAdmin role.
   Calls /api/superadmin/** endpoints (Backend-protected).
============================================================ */

const SuperAdminService = (() => {

  const API_BASE = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + "/api";
  const API = `${API_BASE}/superadmin`;

  function _getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // =========================
  // GET ALL USERS (full system view)
  // =========================
  async function getAllUsers() {
    const res = await fetch(`${API}/users`, {
      method: "GET",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to load users");
    return await res.json();
  }

  // =========================
  // GET ALL ADMINS
  // =========================
  async function getAllAdmins() {
    const res = await fetch(`${API}/admins`, {
      method: "GET",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to load admins");
    return await res.json();
  }

  // =========================
  // CREATE ADMIN
  // =========================
  async function createAdmin(data) {
    const res = await fetch(`${API}/admins`, {
      method: "POST",
      headers: _getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create admin");
    }
    return await res.json();
  }

  // =========================
  // SUSPEND ADMIN
  // =========================
  async function suspendAdmin(id) {
    const res = await fetch(`${API}/admins/${id}/suspend`, {
      method: "PUT",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to suspend admin");
    return await res.json();
  }

  // =========================
  // REACTIVATE ADMIN
  // =========================
  async function reactivateAdmin(id) {
    const res = await fetch(`${API}/admins/${id}/reactivate`, {
      method: "PUT",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to reactivate admin");
    return await res.json();
  }

  // =========================
  // GET PENDING REGISTRATION REQUESTS (SuperAdmin sees all scopes)
  // =========================
  async function getPendingRequests() {
    const res = await fetch(`${API_BASE}/registrations/pending/all`, {
      method: "GET",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to load pending requests");
    return await res.json();
  }

  // =========================
  // APPROVE REGISTRATION REQUEST (by requestId not userId)
  // =========================
  async function approveRegistration(requestId) {
    const res = await fetch(`${API_BASE}/registrations/${requestId}/approve`, {
      method: "PUT",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to approve");
    return await res.json();
  }

  // =========================
  // REJECT REGISTRATION REQUEST (by requestId not userId)
  // =========================
  async function rejectRegistration(requestId) {
    const res = await fetch(`${API_BASE}/registrations/${requestId}/reject`, {
      method: "PUT",
      headers: _getHeaders()
    });
    if (!res.ok) throw new Error("Failed to reject");
    return await res.json();
  }

  return {
    getAllUsers, getAllAdmins, createAdmin, suspendAdmin,
    reactivateAdmin, getPendingRequests, approveRegistration,
    rejectRegistration
  };
})();

export default SuperAdminService;
window.SuperAdminService = SuperAdminService;
