/* ============================================================
   HEALTHLINK — SUPER ADMIN CONTROLLER
   Handles SuperAdmin UI logic:
     - View ALL users (including Admins)
     - View & Approve/Reject pending registration requests
     - Create Admin accounts
     - Suspend / Reactivate Admins
   Does NOT touch any existing AdminController logic.
============================================================ */

import SuperAdminService from '../services/SuperAdminService.js';
import ToastService from '../services/ToastService.js';

const SuperAdminController = (() => {

  let allUsers        = [];
  let allAdmins       = [];
  let pendingRequests = [];  // registration requests from /registrations/pending/all

  // ─── Load All Users (full system) ────────────────────────────────────────────
  async function loadAllUsers() {
    const tbody = document.getElementById("superadmin-users-body");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    try {
      // جيب المستخدمين والريكوستات مع بعض
      [allUsers, pendingRequests] = await Promise.all([
        SuperAdminService.getAllUsers(),
        SuperAdminService.getPendingRequests().catch(() => [])
      ]);
      renderUsers(allUsers);
    } catch (err) {
      console.error("SuperAdmin loadAllUsers:", err);
      tbody.innerHTML = `<tr><td colspan="5">Failed to load users</td></tr>`;
    }
  }

  // ─── Render Users Table ───────────────────────────────────────────────────────
  function renderUsers(users) {
    const tbody = document.getElementById("superadmin-users-body");
    if (!tbody) return;

    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {

      // دور على الـ requestId للـ user ده في الـ pendingRequests
      const req = pendingRequests.find(r => r.userId === u.id);
      const requestId = req ? req.requestId : null;

      let actions = "";

      if (u.role === "ADMIN" && u.status === "PENDING" && requestId) {
        // Admin ينتظر موافقة SuperAdmin
        actions = `
          <button class="btn btn-success btn-sm"
            onclick="SuperAdminController.approveAdmin(${requestId})">
            Approve
          </button>
          <button class="btn btn-danger btn-sm"
            onclick="SuperAdminController.rejectAdmin(${requestId})">
            Reject
          </button>`;

      } else if (u.role === "ADMIN" && u.status === "ACTIVE") {
        actions = `
          <button class="btn btn-danger btn-sm"
            onclick="SuperAdminController.suspendAdmin(${u.id})">
            Suspend
          </button>`;

      } else if (u.role === "ADMIN" && u.status === "SUSPENDED") {
        actions = `
          <button class="btn btn-success btn-sm"
            onclick="SuperAdminController.reactivateAdmin(${u.id})">
            Reactivate
          </button>`;

      } else if (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN") {
        actions = `-`;
      }

      return `
        <tr>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td><span class="badge ${roleBadge(u.role)}">${u.role}</span></td>
          <td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td>
          <td>${actions}</td>
        </tr>`;
    }).join("");
  }

  // ─── Filter Users ─────────────────────────────────────────────────────────────
  function filterUsers(btn, type) {
    document.querySelectorAll(".superadmin-filter-tab")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    let filtered = allUsers;
    if (type === "pending")   filtered = allUsers.filter(u => u.status === "PENDING");
    if (type === "active")    filtered = allUsers.filter(u => u.status === "ACTIVE");
    if (type === "suspended") filtered = allUsers.filter(u => u.status === "SUSPENDED");
    if (type === "admins")    filtered = allUsers.filter(u => u.role === "ADMIN");

    renderUsers(filtered);
  }

  // ─── Approve Pending Admin Registration ───────────────────────────────────────
  async function approveAdmin(requestId) {
    try {
      await SuperAdminService.approveRegistration(requestId);
      ToastService.show("Admin approved successfully!", "success");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to approve admin", "error");
    }
  }

  // ─── Reject Pending Admin Registration ────────────────────────────────────────
  async function rejectAdmin(requestId) {
    try {
      await SuperAdminService.rejectRegistration(requestId);
      ToastService.show("Admin rejected", "warning");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to reject admin", "error");
    }
  }

  // ─── Suspend Active Admin ─────────────────────────────────────────────────────
  async function suspendAdmin(id) {
    try {
      await SuperAdminService.suspendAdmin(id);
      ToastService.show("Admin suspended", "warning");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to suspend admin", "error");
    }
  }

  // ─── Reactivate Suspended Admin ───────────────────────────────────────────────
  async function reactivateAdmin(id) {
    try {
      await SuperAdminService.reactivateAdmin(id);
      ToastService.show("Admin reactivated!", "success");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to reactivate admin", "error");
    }
  }

  // ─── Show / Hide Create Admin Form ───────────────────────────────────────────
  function showCreateAdminForm() {
    const modal = document.getElementById("create-admin-modal");
    if (modal) modal.style.display = "flex";
  }

  function hideCreateAdminForm() {
    const modal = document.getElementById("create-admin-modal");
    if (modal) modal.style.display = "none";
    ["create-admin-name","create-admin-email","create-admin-pass"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  // ─── Create Admin ─────────────────────────────────────────────────────────────
  async function createAdmin() {
    const fullName = document.getElementById("create-admin-name")?.value?.trim();
    const email    = document.getElementById("create-admin-email")?.value?.trim();
    const password = document.getElementById("create-admin-pass")?.value?.trim();

    if (!fullName || !email || !password) {
      ToastService.show("All fields are required", "error");
      return;
    }

    try {
      await SuperAdminService.createAdmin({ fullName, email, password });
      ToastService.show("Admin created successfully!", "success");
      hideCreateAdminForm();
      loadAllUsers();
    } catch (err) {
      console.error(err);
      ToastService.show(err.message || "Failed to create admin", "error");
    }
  }

  // ─── Badge helpers ────────────────────────────────────────────────────────────
  function roleBadge(role) {
    const map = {
      SUPER_ADMIN: "badge-red",
      ADMIN:       "badge-amber",
      DOCTOR:      "badge-green",
      NURSE:       "badge-green",
      PATIENT:     "badge-blue"
    };
    return map[role] || "";
  }

  function statusBadge(status) {
    const map = {
      ACTIVE:    "badge-green",
      PENDING:   "badge-amber",
      SUSPENDED: "badge-red"
    };
    return map[status] || "";
  }

  return {
    loadAllUsers, filterUsers, approveAdmin, rejectAdmin,
    suspendAdmin, reactivateAdmin, showCreateAdminForm,
    hideCreateAdminForm, createAdmin
  };
})();

export default SuperAdminController;
window.SuperAdminController = SuperAdminController;
