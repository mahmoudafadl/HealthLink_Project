/* ============================================================
   HEALTHLINK — SUPER ADMIN VIEW
============================================================ */

import AdminView from './AdminView.js';
import SuperAdminController from '../controllers/SuperAdminController.js';
import SuperAdminService from '../services/SuperAdminService.js';

const SuperAdminView = (() => {

  // ===== ONLY CUSTOM DASHBOARD =====
  async function renderDashboard() {

    try {

      // USERS
      const users =
        await SuperAdminService.getAllUsers();

      document.getElementById(
        "superadmin-total-users"
      ).textContent =
        users.length;

      // ADMINS
      const admins =
        users.filter(
          u => u.role === "ADMIN"
        );

      document.getElementById(
        "superadmin-admins-count"
      ).textContent =
        admins.length;


      // HOME REQUESTS
let homeRequests = [];

try {

  homeRequests =
    await window.AdminService
      .getAllHomeRequests();

} catch (error) {

  console.error(
    "Home requests error:",
    error
  );

  homeRequests = [];

}

document.getElementById(
  "superadmin-home-count"
).textContent =
  homeRequests.length;
      // FEEDBACK
      let feedbacks = [];

      try {

        const feedbackRes =
          await fetch(
            "http://localhost:8080/api/feedback",
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`
              }
            }
          );

        if (feedbackRes.ok) {
          feedbacks =
            await feedbackRes.json();
        }

      } catch (_) { }

      document.getElementById(
        "superadmin-feedback-count"
      ).textContent =
        feedbacks.length;


      // RECENT FEEDBACK
      const recentBox =
        document.getElementById(
          "superadmin-recent-feedback"
        );

      if (recentBox) {

        const recent =
          feedbacks.slice(0, 5);

        if (!recent.length) {

          recentBox.innerHTML =
            `<div>No feedback yet</div>`;

        } else {

          recentBox.innerHTML =
            recent.map(f => `

              <div class="feedback-card">

                <div style="
                  display:flex;
                  justify-content:space-between;
                ">

                  <div>

                    <div style="font-weight:600;">
                      ${f.patient?.fullName || "Patient"}
                    </div>

                    <div>
                      ${f.content || ""}
                    </div>

                  </div>

                  <div style="color:gold;">
                    ${"★".repeat(f.rating || 0)}
                  </div>

                </div>

              </div>

            `).join("");

        }
      }

    } catch (error) {

      console.error(
        "SuperAdmin dashboard error:",
        error
      );

    }
  }


  // ===== KEEP ADMIN FEATURES AS IS =====
  function renderActivityLogs() {
    AdminView.renderActivityLogs();
  }

  function renderFeedbackManagement() {
    AdminView.renderFeedbackManagement();
  }

  function renderPayments() {
    AdminView.renderPayments();
  }

  function renderEmergencyManagement() {
    AdminView.renderEmergencyManagement();
  }

  function renderUserManagement() {
    SuperAdminController.loadAllUsers();
  }

  return {
    renderDashboard,
    renderActivityLogs,
    renderFeedbackManagement,
    renderPayments,
    renderEmergencyManagement,
    renderUserManagement
  };

})();

export default SuperAdminView;
window.SuperAdminView = SuperAdminView;