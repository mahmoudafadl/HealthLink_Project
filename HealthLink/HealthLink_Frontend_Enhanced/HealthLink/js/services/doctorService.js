/* ============================================================
   HEALTHLINK — DOCTOR SERVICE
   Handles API calls to backend (Standardized)
============================================================ */

const DoctorService = (() => {

  const API_URL = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + "/api/doctors";

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  }

  // =========================
  // 👨‍⚕️ Get all doctors (ACTIVE only from backend)
  // =========================
  async function getDoctors(forceRefresh = false) {
    try {
      const res = await fetch(API_URL, {
        headers: getAuthHeaders(),
        cache: forceRefresh ? "no-store" : "default"
      });

      if (!res.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  }

  // =========================
  // 📄 Get doctor by id
  // =========================
  async function getDoctorById(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error("Doctor not found");
      }

      return await res.json();

    } catch (error) {
      console.error("Error fetching doctor:", error);
      throw error;
    }
  }

  // =========================
  // ⭐ Rate doctor
  // =========================
  async function rateDoctor(id, rate) {
    try {
      if (rate < 1 || rate > 5) {
        throw new Error("Rate must be between 1 and 5");
      }

      const res = await fetch(`${API_URL}/rate/${id}?rate=${rate}`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error("Failed to rate doctor");
      }

      return await res.json();

    } catch (error) {
      console.error("Error rating doctor:", error);
      throw error;
    }
  }

  // =========================
  // 👨‍💼 Admin approve user (Mapped to Registration Approval)
  // =========================
  async function approveUser(id) {
    try {
      const res = await fetch(`${(window.APP_CONFIG?.API_URL || "http://localhost:8080")}/api/registrations/${id}/approve`, {
        method: "PUT",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error("Failed to approve user");
      }

      return await res.json();

    } catch (error) {
      console.error("Error approving user:", error);
      throw error;
    }
  }

  // =========================
  // ❌ Admin reject user (Mapped to Registration Approval)
  // =========================
  async function rejectUser(id) {
    try {
      const res = await fetch(`${(window.APP_CONFIG?.API_URL || "http://localhost:8080")}/api/registrations/${id}/reject`, {
        method: "PUT",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error("Failed to reject user");
      }

      return await res.json();

    } catch (error) {
      console.error("Error rejecting user:", error);
      throw error;
    }
  }

  // =========================
  // 🔥 EXPORT
  // =========================
  return {
    getDoctors,
    getDoctorById,
    rateDoctor,
    approveUser,
    rejectUser
  };
})();

export default DoctorService;
window.DoctorService = DoctorService;