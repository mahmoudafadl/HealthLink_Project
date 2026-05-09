/* ============================================================
   HEALTHLINK — ADMIN VIEW
   All render functions for the Admin role pages.
============================================================ */

import AdminController from '../controllers/AdminController.js';
import Database from '../repositories/Database.js';
import BillingService from '../services/BillingService.js';
import ToastService from '../services/ToastService.js';
import * as api from '../repositories/apiRepository.js';

const AdminView = (() => {

  function renderUsers() {
    AdminController.loadUsers();
  }

  async function renderDashboard() {

  try {

    // doctors dropdown
    await AdminController.loadDoctors();

    // load real data
    const users =
  await window.AdminService
    .getAllUsers();

const feedbacks =
  await window.AdminService
    .getAllFeedback();

const appointments =
  await window.AdminService
    .getAllAppointments();

const homeRequests =
  await window.AdminService
    .getAllHomeRequests();

    const statEls =
      document.querySelectorAll(
        "#page-admin-dashboard .stat-value"
      );


    // 1) Total Users
    if (statEls[0]) {
      statEls[0].textContent =
        users.length;
    }


    // 2) Appointments
    if (statEls[1]) {
      statEls[1].textContent =
        appointments.length;
    }


    // 3) Home Requests
    const homeReqEl =
      document.getElementById(
        "admin-home-req-count"
      );

    if (homeReqEl) {
      homeReqEl.textContent =
        homeRequests.length;
    }


    // 4) Feedback
    const feedbackEl =
      document.getElementById(
        "admin-feedback-count"
      );

    if (feedbackEl) {
      feedbackEl.textContent =
        feedbacks.length;
    }


    // Recent feedback
    _renderRecentFeedback(
      feedbacks
    );

  }

  catch (e) {

    console.error(
      "Admin dashboard error:",
      e
    );

  }

}


  function _renderRecentFeedback(
    feedbacks
  ) {

    const list =
      document.getElementById(
        "admin-recent-feedback"
      );

    if (!list) return;


    if (
      !feedbacks ||
      feedbacks.length === 0
    ) {

      list.innerHTML =
        `<div style="color:var(--color-muted);">
          No feedback yet.
        </div>`;

      return;

    }


    const recent =
      [...feedbacks]
        .reverse()
        .slice(0, 4);


    list.innerHTML =
      recent.map(f => `

        <div class="card" style="padding:14px;">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:10px;
          ">

            <div>

              <div style="
                color:var(--color-heading);
                font-weight:600;
                font-size:.9rem;
              ">
                ${f.patient?.fullName || 'Patient'}
              </div>

              <div style="
                color:var(--color-muted);
                font-size:.82rem;
                margin-top:4px;
              ">
                ${f.content}
              </div>

            </div>

            <div style="
              color:var(--color-warning);
              flex-shrink:0;
            ">
              ${'★'.repeat(f.rating)}
            </div>

          </div>

        </div>

      `).join("");

  }


  async function renderActivityLogs(
    filterType = 'all'
  ) {

    const list =
      document.getElementById(
        'activity-logs'
      );

    if (!list) return;

    try {

      const logs =
        await api.getActivityLogs();

      const filtered =
        filterType === 'all'
          ? logs
          : logs.filter(l => {

              if (
                filterType === 'payment'
              ) {
                return (
                  l.action.toLowerCase().includes('wallet') ||
                  l.action.toLowerCase().includes('top-up')
                );
              }

              if (
                filterType === 'home-req'
              ) {
                return l.action
                  .toLowerCase()
                  .includes('home service');
              }

              if (
                filterType === 'user-req'
              ) {
                return l.action
                  .toLowerCase()
                  .includes('appointment');
              }

              return true;

            });


      if (
        filtered.length === 0
      ) {

        list.innerHTML =
          '<div style="color:var(--color-muted);padding:20px;">No logs found.</div>';

        return;

      }


      list.innerHTML =
        filtered.map(log => `

          <div class="log-item">

            <span class="log-type ${log.role.toLowerCase()}">
              ${log.role}
            </span>

            <div style="flex:1;">

              <div style="
                color:var(--color-heading);
                font-size:.9rem;
                font-weight:600;
              ">
                ${log.userEmail}
              </div>

              <div style="
                color:var(--color-muted);
                font-size:.82rem;
                margin-top:2px;
              ">
                <b>${log.action}:</b>
                ${log.details}
              </div>

            </div>

            <div style="
              color:var(--color-muted);
              font-size:.75rem;
              text-align:right;
              flex-shrink:0;
            ">

              <div>
                ${new Date(
                  log.timestamp
                ).toLocaleTimeString()}
              </div>

              <div>
                ${new Date(
                  log.timestamp
                ).toLocaleDateString()}
              </div>

            </div>

          </div>

        `).join('');

    }

    catch (e) {

      list.innerHTML =
        '<div style="color:var(--color-danger);padding:20px;">Failed to load logs.</div>';

    }

  }


  async function renderFeedbackManagement() {

    try {

      const allFb =
        await window.AdminService
          .getAllFeedback();

      const avgRating =
        allFb.length > 0
          ? allFb.reduce(
              (s, f) =>
                s + f.rating,
              0
            ) / allFb.length
          : 0;
        const now =
  new Date();

const sevenDaysAgo =
  new Date();

sevenDaysAgo.setDate(
  now.getDate() - 7
);


const thisWeekCount =
  allFb.filter(f => {

    if (!f.createdAt) {
      return false;
    }

    const createdDate =
      new Date(
        f.createdAt
      );

    return (
      createdDate >=
      sevenDaysAgo
    );

  }).length;    

      const avgEl =
        document.getElementById(
          'avg-rating-display'
        );

      if (avgEl)
        avgEl.textContent =
          avgRating.toFixed(1);


      const totalEl =
        document.getElementById(
          'total-reviews-count'
        );

      if (totalEl)
        totalEl.textContent =
          allFb.length;
      const weeklyEl =
  document.getElementById(
    "feedback-week-count"
  );

if (weeklyEl) {

  weeklyEl.textContent =
    thisWeekCount;

}

      const list =
        document.getElementById(
          'admin-all-feedback'
        );

      if (!list) return;


      if (
        allFb.length === 0
      ) {

        list.innerHTML =
          '<div style="color:var(--color-muted);padding:20px;">No feedback received yet.</div>';

        return;

      }


      list.innerHTML =
        [...allFb]
          .reverse()
          .map(f => `

            <div class="card" style="padding:18px;">

              <div style="
                display:flex;
                justify-content:space-between;
                gap:14px;
                flex-wrap:wrap;
              ">

                <div style="flex:1;">

                  <div style="
                    color:var(--color-heading);
                    font-weight:600;
                    margin-bottom:8px;
                  ">
                    ${f.patient?.fullName}
                  </div>

                  <p style="
                    color:var(--color-text);
                    font-size:.87rem;
                  ">
                    ${f.content}
                  </p>

                </div>

                <div style="
                  display:flex;
                  flex-direction:column;
                  align-items:flex-end;
                ">

                  <span style="
                    color:var(--color-warning);
                  ">
                    ${'★'.repeat(f.rating)}
                  </span>

                  <div style="
                    color:var(--color-muted);
                    font-size:.75rem;
                  ">
                    ${new Date(
                      f.createdAt
                    ).toLocaleString()}
                  </div>

                </div>

              </div>

            </div>

          `).join('');

    }

    catch (e) {

      console.error(e);

    }

  }


  async function renderPayments() {

    const tbody =
      document.getElementById(
        'payments-body'
      );

    if (!tbody) return;

    try {

      const transactions =
        await BillingService
          .getAllTransactions();
      const today =
  new Date()
    .toDateString();


const todayTransactions =
  transactions.filter(t =>
    new Date(
      t.createdAt
    ).toDateString() ===
    today
  );


const revenue =
  todayTransactions.reduce(
    (sum, t) =>
      sum + t.amount,
    0
  );


const pendingCount =
  transactions.filter(t =>
    t.status ===
    "PENDING"
  ).length;


const successCount =
  todayTransactions.filter(t =>
    t.status ===
    "SUCCESS"
  ).length;


/*
عندكم لسه مفيش insurance
فنخليه عدد topups حاليا
*/
const insuranceCount =
  transactions.filter(t =>
    t.type ===
    "TOPUP"
  ).length;


document.getElementById(
  "admin-revenue-today"
).textContent =
  `EGP ${revenue}`;


document.getElementById(
  "admin-pending-payments"
).textContent =
  pendingCount;


document.getElementById(
  "admin-insurance-count"
).textContent =
  insuranceCount;


document.getElementById(
  "admin-success-payments"
).textContent =
  successCount;
  
      if (
        transactions.length === 0
      ) {

        tbody.innerHTML =
          '<tr><td colspan="7" style="text-align:center;color:var(--color-muted);padding:20px;">No transactions found.</td></tr>';

        return;

      }


      tbody.innerHTML =
        transactions.map(t => {

          const isTopup =
            t.type.toUpperCase() === 'TOPUP';

          const dateStr =
            new Date(
              t.createdAt
            ).toLocaleString();


          return `

          <tr>

            <td>
              ${t.patientName}
            </td>

            <td>
              ${
                isTopup
                  ? '<span class="badge badge-green">Top-up</span>'
                  : '<span class="badge badge-amber">Deduction</span>'
              }
            </td>

            <td style="
              font-weight:600;
              color:${
                isTopup
                  ? 'var(--color-success)'
                  : 'var(--color-danger)'
              };
            ">
              ${isTopup ? '+' : '-'}EGP ${t.amount}
            </td>

            <td>
              ${t.method}
            </td>

            <td>
              ${dateStr}
            </td>

            <td>
              <span class="badge ${
                t.status === 'SUCCESS'
                  ? 'badge-green'
                  : 'badge-amber'
              }">
                ${t.status}
              </span>
            </td>

            <td>
              ✓ Logged
            </td>

          </tr>

          `;

        }).join('');

    }

    catch (e) {

      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;color:var(--color-danger);padding:20px;">Failed to load transactions.</td></tr>';

      ToastService.show(
        "Failed to load admin transactions",
        "error"
      );

    }

  }


  function renderEmergencyManagement() {

    const list =
      document.getElementById(
        'emergency-list'
      );

    if (!list) return;


    list.innerHTML =
      Database.emergencies
        .map((e, i) => `

          <div class="card">

            ${e.type}

          </div>

        `).join('');

  }


  return {
    renderUsers,
    renderDashboard,
    renderActivityLogs,
    renderFeedbackManagement,
    renderPayments,
    renderEmergencyManagement
  };

})();

export default AdminView;
window.AdminView = AdminView;