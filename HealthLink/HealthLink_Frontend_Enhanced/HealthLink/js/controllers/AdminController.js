import AdminService from '../services/AdminService.js';
import ToastService from '../services/ToastService.js';
import DoctorService from '../services/doctorService.js';

const AdminController = (() => {

  let allUsers = [];
  let pendingRequests = [];

  // =========================
  // 📥 LOAD USERS
  // =========================
  async function loadUsers() {
    const tbody = document.getElementById("admin-users-body");
    if (!tbody) return;

    try {
      tbody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

      // Fetch both users and pending registration requests
      const [users, requests] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getPendingRegistrations().catch(() => [])
      ]);

      allUsers = users;
      pendingRequests = requests;

      renderUsers(users);

    } catch (err) {
      console.error("❌ ERROR:", err);
      tbody.innerHTML = `<tr><td colspan="5">Failed to load users</td></tr>`;
    }
  }

  // =========================
  // 🎨 RENDER USERS
  // =========================
  function renderUsers(users) {
    const tbody = document.getElementById("admin-users-body");
    if (!tbody) return;

    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      // Find requestId if this user is in pendingRequests
      const req = pendingRequests.find(r => r.userId === u.id);
      const requestId = req ? req.requestId : null;

      let actions = "-";

  // Pending users → approve/reject
  if (
    u.status === "PENDING" &&
    u.role !== "ADMIN" &&
    u.role !== "SUPER_ADMIN" &&
    requestId
  ) {

    actions = `
      <button class="btn btn-success btn-sm"
        onclick="AdminController.approveUser(${requestId})">
        Approve
      </button>

      <button class="btn btn-danger btn-sm"
        onclick="AdminController.rejectUser(${requestId})">
        Reject
      </button>
    `;
  }

  // Active doctors / nurses → delete
  else if (
    (u.role === "DOCTOR" || u.role === "NURSE") &&
    (u.status === "ACTIVE" || u.status === "SUSPENDED")
  ) {

    const isSuspended =
      u.status === "SUSPENDED";

   actions = `
      <button class="btn btn-danger btn-sm"
        onclick="AdminController.deleteUser(${u.id})">

        ${isSuspended ? "Reactivate" : "Suspend"}

      </button>
    `;
  }

  // Protected accounts
  else if (
    u.role === "ADMIN" ||
    u.role === "SUPER_ADMIN"
  ) {

    actions = `
      <span style="color:var(--color-muted);font-size:.82rem;">
        Protected
      </span>
    `;
  }

      return `
        <tr>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td><span class="badge ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}">${u.status}</span></td>
          <td>${actions}</td>
        </tr>
      `;
    }).join("");
  }

  // =========================
  // 🔍 FILTER USERS
  // =========================
  function filterUsers(btn, type) {
    document.querySelectorAll(".filter-tab")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    let filtered = allUsers;

    if (type === "pending") {
      filtered = allUsers.filter(u => u.status === "PENDING");
    } else if (type === "approved") {
      filtered = allUsers.filter(u => u.status === "ACTIVE");
    } else if (type === "rejected") {
      filtered = allUsers.filter(u => u.status === "SUSPENDED");
    }

    renderUsers(filtered);
  }

  // =========================
  // ✅ APPROVE
  // =========================
  async function approveUser(requestId) {
    try {
      await AdminService.approveUser(requestId);
      ToastService.show("User Approved ✅", "success");
      loadUsers(); // refresh
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to approve user", "error");
    }
  }

  // =========================
  // ❌ REJECT
  // =========================
  async function rejectUser(requestId) {
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await AdminService.rejectUser(requestId, reason);
      ToastService.show("User Rejected ❌", "warning");
      loadUsers(); // refresh
    } catch (err) {
      console.error(err);
      ToastService.show("Failed to reject user", "error");
    }
  }

  // =========================
  // 📢 ALERTS
  // =========================

 async function loadDoctors() {

  const select =
    document.getElementById(
      "alert-target"
    );

  if (!select) return;

  try {

    const doctors =
      await DoctorService
        .getDoctors();

    let options = `
      <option value="ALL_DOCTORS">
        All Doctors
      </option>
    `;

    doctors.forEach(
      doctor => {

      // users.id الحقيقي
      const userId =
        doctor.userId;

      const fullName =
        doctor.fullName;

      options += `
        <option value="${userId}">
          Dr. ${fullName}
        </option>
      `;
    }
  );

    options += `
      <option value="ALL_NURSES">
        All Nurses
      </option>
    `;

    select.innerHTML =
      options;

  } catch (error) {

    console.error(
      "Doctors dropdown error:",
      error
    );
  }
}

 async function sendDoctorAlert() {

  const target =
    document.getElementById(
      "alert-target"
    ).value;

  const message =
    document.getElementById(
      "alert-message"
    ).value.trim();

    const alertType =
      document.getElementById(
        "alert-type"
      ).value
        .toUpperCase();

  if (!message) {

    ToastService.show(
      "Please enter alert message",
      "error"
    );

    return;
  }

  let targetType;

  // Frontend dropdown mapping
  if (
    target === "all" ||
    target === "ALL_DOCTORS"
  ) {

    targetType =
      "ALL_DOCTORS";

  } else if (
    target === "nurse" ||
    target === "ALL_NURSES"
  ) {

    targetType =
      "ALL_NURSES";

  } else {

    // specific user id
    targetType =
      "USER";
  }

  const payload = {

    message,

    targetType,

    alertType
  };

  // specific user support
  if (
    targetType === "USER"
  ) {

    payload.targetUserId =
      Number(target);
  }

  try {

    await api.sendAlert(
      payload
    );

    ToastService.show(
      "Alert sent successfully 📢",
      "success"
    );

    document.getElementById(
      "alert-message"
    ).value = "";

  } catch (err) {

    console.error(err);

    ToastService.show(
      "Failed to send alert",
      "error"
    );
  }
 }

  // =========================
  // 📋 LOGS
  // =========================
 async function filterLogs(btn, type) {
    document.querySelectorAll("#page-admin-logs .filter-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    window.AdminView?.renderActivityLogs(type);
  }

  // delete user 
  async function deleteUser(userId) {

  const confirmed =
    confirm("Change account status?");

  if (!confirmed) return;

  try {

    await AdminService.deleteUser(userId);

    ToastService.show(
      "Account status updated successfully"
    );

    loadUsers();

  } catch (err) {

    console.error(err);

    ToastService.show(
      "Failed to delete account",
      "error"
    );
  }
 }

  return {
    loadUsers,
    loadDoctors,
    filterUsers,
    approveUser,
    rejectUser,
    sendDoctorAlert,
    filterLogs,
    deleteUser
  };

})();

window.AdminController = AdminController;
export default AdminController;