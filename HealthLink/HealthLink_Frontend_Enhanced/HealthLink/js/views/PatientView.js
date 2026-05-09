/* ============================================================
   HEALTHLINK — PATIENT VIEW (INTEGRATED)
   All render functions for the Patient role pages.
============================================================ */

import { AppState } from '../app.js';
import AppointmentService from '../services/AppointmentService.js';
import * as api from '../repositories/apiRepository.js';
import BillingService from '../services/BillingService.js';
import NotificationService from "../services/NotificationService.js";

const PatientView = (() => {

  /**
   * Render the doctors grid.
   */
  function renderDoctors(spec = "All", search = "") {
    const container = document.getElementById("doctors-grid");
    if (!container) return;

    let list = AppState.doctors || [];

    if (spec && spec !== "All") {
      list = list.filter(d => d.specialization === spec);
    }

    if (search) {
      list = list.filter(d =>
        d.fullName.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 40px;">No doctors found matching your criteria.</div>`;
      return;
    }

    container.innerHTML = list.map(doc => `
      <div class="card doctor-card">
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
          <div class="avatar">${doc.fullName.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <h3 style="margin:0; font-size:1rem;">${doc.fullName}</h3>
            <p style="margin:0; font-size:0.8rem; color:var(--color-muted);">${doc.specialization}</p>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <span style="color:var(--color-warning);">⭐ ${doc.rating?.toFixed(1) || '0.0'}</span>
          <span style="font-size:0.85rem; color:var(--color-muted);">${doc.experienceYears ?? 0} yrs exp</span>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="PatientController.viewDoctor(${doc.id})">
          View Profile & Book
        </button>
      </div>
    `).join("");
  }

  /**
   * Render appointments table with real data.
   */
  async function renderAppointmentsTable() {
    const tbody = document.getElementById('appt-table-body');
    if (!tbody) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const appointments = await AppointmentService.getPatientAppointments(user.id);

      if (appointments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-muted);">No appointments found.</td></tr>`;
        return;
      }

      tbody.innerHTML = appointments.map(a => {
        const initials = a.doctorName.split(' ').map(w => w[0]).join('');
        const statusBadge = {
          COMPLETED: 'badge-green',
          APPROVED:  'badge-teal',
          PENDING:   'badge-amber',
          REJECTED:  'badge-red',
          CANCELLED: 'badge-red'
        }[a.status] || 'badge-amber';

        const actionBtn = (a.status === 'PENDING' || a.status === 'APPROVED')
          ? `<button class="btn btn-danger btn-sm" onclick="PatientController.cancelAppointment(${a.id})">Cancel</button>`
          : `<button class="btn btn-ghost btn-sm">Details</button>`;

        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar" style="width:30px;height:30px;font-size:.7rem;">${initials}</div>
              ${a.doctorName}
            </div>
          </td>
          <td>${a.specialization}</td>
          <td>${a.appointmentDate}<br><span style="color:var(--color-muted);font-size:.78rem;">${a.appointmentTime}</span></td>
          <td><span class="badge badge-purple">${a.visitType}</span></td>
          <td><span class="badge ${statusBadge}">${a.status}</span></td>
          <td>${actionBtn}</td>
        </tr>`;
      }).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-danger);">Failed to load appointments.</td></tr>`;
    }
  }

  /**
   * Render medical history (clinical records).
   */
  async function renderMedicalHistory() {
    const timeline = document.getElementById('history-timeline');
    if (!timeline) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const records = await api.getPatientRecords(user.id);

      if (records.length === 0) {
        timeline.innerHTML = '<div style="color:var(--color-muted); padding:20px;">No medical records found.</div>';
        return;
      }

      timeline.innerHTML = records.map(r => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <div style="color:var(--color-muted);font-size:.78rem;margin-bottom:3px;">${new Date(r.createdAt).toLocaleDateString()}</div>
            <div style="color:var(--color-heading);font-weight:600;font-size:.93rem;">${r.documentType || 'Clinical Visit'}</div>
            <div style="color:var(--color-muted);font-size:.82rem;">By Dr. ${r.doctor?.fullName || 'Specialist'}</div>
            <div style="color:var(--color-text);font-size:.85rem;margin-top:5px;line-height:1.5;">
              <b>Diagnosis:</b> ${r.diagnosis || 'N/A'}<br>
              <b>Notes:</b> ${r.medicalNotes || 'No additional notes.'}
            </div>
          </div>
        </div>`).join('');
    } catch (e) {
      timeline.innerHTML = '<div style="color:var(--color-danger); padding:20px;">Failed to load history.</div>';
    }
  }

  /**
   * Render home service requests.
   */
  async function renderHomeServices() {
    const list = document.getElementById('home-service-list');
    if (!list) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const requests = await api.getRequestsByPatient(user.id); // Assuming this helper exists in apiRepository

      if (requests.length === 0) {
        list.innerHTML = '<div style="color:var(--color-muted); text-align:center; padding:20px;">No requests found.</div>';
        return;
      }

      list.innerHTML = requests.map(s => {
        const statusBadge = {
          COMPLETED: 'badge-green',
          PENDING:   'badge-amber',
          APPROVED:  'badge-teal'
        }[s.status] || 'badge-amber';

        return `
          <div class="card" style="padding:16px;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div>
                <div style="color:var(--color-heading);font-weight:600;font-size:.92rem;margin-bottom:4px;">${s.serviceType}</div>
                <div style="color:var(--color-muted);font-size:.8rem;">${new Date(s.requestedAt).toLocaleString()}</div>
                <div style="color:var(--color-muted);font-size:.8rem;">📍 ${s.address}</div>
                <div style="color:var(--color-muted);font-size:.8rem;margin-top:4px;">Nurse: ${s.nurse?.fullName || 'Awaiting Assignment'}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                <span class="badge ${statusBadge}">${s.status}</span>
                ${s.status === 'PENDING' ? `<button class="btn btn-ghost btn-sm" style="color:var(--color-danger);" onclick="PatientController.cancelHomeService(${s.id})">Cancel</button>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');
    } catch (e) {
      list.innerHTML = '<div style="color:var(--color-danger); text-align:center; padding:20px;">Failed to load services.</div>';
    }
  }

  /**
   * Render wallet info and transactions.
   */
  async function renderWallet() {

  try {

    const balanceData =
      await BillingService.getBalance();

    const transactions =
      await BillingService.getTransactions();

    const balance =
      balanceData.balance || 0;

    const balanceFormatted =
      `EGP ${balance.toLocaleString()}`;

    // =========================
    // Balance Displays
    // =========================
    const balanceDisplay =
      document.getElementById(
        'wallet-balance-display'
      );

    if (balanceDisplay) {
      balanceDisplay.textContent =
        balanceFormatted;
    }

    const homeVal =
      document.getElementById(
        'home-wallet-val'
      );

    if (homeVal) {
      homeVal.textContent =
        balanceFormatted;
    }

    const bookDisplay =
      document.getElementById(
        'wallet-book-display'
      );

    if (bookDisplay) {
      bookDisplay.textContent =
        balanceFormatted;
    }
    const user =
  JSON.parse(
    localStorage.getItem("user")
  );

const walletOwner =
  document.getElementById(
    "wallet-owner-name"
  );

if (
  walletOwner &&
  user
) {

  walletOwner.textContent =

    `HealthLink Wallet · ${

      user.fullName ||
      "Patient"

    }`;

}

    // =========================
    // Wallet Stats
    // =========================
    const totalSpent =
      transactions
        .filter(
          tx =>
            tx.type &&
            tx.type.toUpperCase() === 'DEDUCT'
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const spentElement =
      document.getElementById(
        'wallet-total-spent'
      );

    if (spentElement) {
      spentElement.textContent =
        `EGP ${totalSpent}`;
    }

    const countElement =
      document.getElementById(
        'wallet-transactions-count'
      );

    if (countElement) {
      countElement.textContent =
        transactions.length;
    }

    // =========================
    // Transactions List
    // =========================
    const txList =
      document.getElementById(
        'wallet-transactions'
      );

    if (!txList) return;

    if (transactions.length === 0) {

      txList.innerHTML = `
        <div style="
          color:var(--color-muted);
          padding:10px;
        ">
          No transactions yet.
        </div>
      `;

      return;
    }

    txList.innerHTML =
      transactions.map(tx => {

        const type =
          tx.type?.toUpperCase();

        const isTopup =
          type === 'TOPUP';

        const isRefund =
          type === 'REFUND';

        const dateStr =
          new Date(
            tx.createdAt
          ).toLocaleDateString();

        return `
          <div class="card" style="padding:14px;">

            <div style="
              display:flex;
              align-items:center;
              gap:14px;
            ">

              <div style="font-size:1.5rem;">

                ${
                  isTopup
                    ? '💰'
                    : isRefund
                      ? '↩️'
                      : '💸'
                }

              </div>

              <div style="flex:1;">

                <div style="
                  color:var(--color-heading);
                  font-weight:600;
                  font-size:.9rem;
                ">

                  ${
                    isTopup
                      ? 'Top-up'
                      : isRefund
                        ? 'Refund'
                        : 'Deduction'
                  }

                </div>

                <div style="
                  color:var(--color-muted);
                  font-size:.78rem;
                ">
                  ${dateStr}
                </div>

              </div>

              <div style="
                font-weight:700;
                font-size:1rem;
                color:
                  ${
                    isTopup || isRefund
                      ? 'var(--color-success)'
                      : 'var(--color-danger)'
                  };
              ">

                ${
                  isTopup || isRefund
                    ? '+'
                    : '-'
                }

                EGP ${tx.amount}

              </div>

            </div>

          </div>
        `;

      }).join('');

  }

  catch (e) {

    console.error(e);

  }

}

async function renderPatientFeedback() {

  const container =
    document.getElementById(
      "patient-reviews-list"
    );

  if (!container) return;

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  if (!user) return;

  try {

    const feedbacks =
      await api.getPatientFeedback(
        user.id
      );

    if (
      !feedbacks ||
      feedbacks.length === 0
    ) {

      container.innerHTML = `
        <p style="
          color:var(--color-muted);
        ">
          No reviews yet.
        </p>
      `;

      return;
    }

    container.innerHTML =

      feedbacks
        .sort(
          (a, b) =>

            new Date(
              b.createdAt
            ) -

            new Date(
              a.createdAt
            )

        )

        .map(f => `

          <div class="card" style="padding:14px;">

            <div style="
              display:flex;
              justify-content:space-between;
              align-items:flex-start;
              gap:12px;
            ">

              <div>

                <div style="
                  color:var(--color-warning);
                  font-size:.95rem;
                  margin-bottom:6px;
                ">

                  ${"⭐".repeat(
                    f.rating || 0
                  )}

                </div>

                <div style="
                  color:var(--color-heading);
                  font-size:.9rem;
                  margin-bottom:4px;
                ">

                  ${f.content}

                </div>

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

        `)

        .join("");

  }

  catch (e) {

    console.error(
      "Feedback load failed:",
      e
    );

  }

}

  /**
   * Render user welcome info.
   */
  function loadHomeUserInfo() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const title = document.querySelector("#page-home h2");
    const subtitle = document.querySelector("#page-home p");

    if (title) title.innerText = `Welcome back, ${user.fullName} 👋`;
    if (subtitle) {
      const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      subtitle.innerText = `${date} — Your health, simplified.`;
    }
  }

  /**
   * Populate doctor dropdowns for booking.
   */
  function renderDoctorDropdown() {
    const select = document.getElementById("book-doctor");
    if (!select) return;

    const doctors = AppState.doctors || [];
    if (doctors.length === 0) {
      select.innerHTML = '<option value="">No doctors available</option>';
      return;
    }
    select.innerHTML = doctors.map(d =>
      `<option value="${d.userId}">${d.fullName} – ${d.specialization}</option>`
    ).join("");
  }

  /**
   * Populate doctor list for feedback.
   */
  function renderFeedbackDoctorList() {
    const select = document.getElementById("feedback-target");
    if (!select) return;

    const doctors = AppState.doctors || [];
    select.innerHTML = `
      <option value="">Select Doctor / Service</option>
      ${doctors.map(d => `<option value="${d.id}">${d.fullName} – ${d.specialization}</option>`).join("")}
      <option value="General">General Experience</option>
    `;
  }

  /**
   * Render stats on home page.
   */
  async function renderHomeStats() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  if (!user) return;

  try {

    // =========================
    // Fetch real data
    // =========================

    const appts =
      await AppointmentService
        .getPatientAppointments(
          user.id
        );

    const records =
      await api.getPatientRecords(
        user.id
      );

    const balance =
      await BillingService
        .getBalance();

    const notifications =
      await NotificationService
        .getNotifications();

    // =========================
    // Counters
    // =========================

    const upcomingAppointments =
      appts.filter(a =>

        a.status === "PENDING" ||
        a.status === "APPROVED"

      );

    document.getElementById(
      "stat-upcoming"
    ).textContent =
      upcomingAppointments.length;

    document.getElementById(
      "stat-records"
    ).textContent =
      records.length;

    document.getElementById(
      "stat-prescriptions"
    ).textContent =
      0;

    document.getElementById(
      "home-wallet-val"
    ).textContent =
      `EGP ${balance.balance || 0}`;

    // =========================
    // Upcoming appointments UI
    // =========================

    const upcomingHtml =

      upcomingAppointments
        .slice(0, 3)
        .map(appt => `

          <div class="card" style="padding:16px;">

            <div style="display:flex;align-items:center;gap:14px;">

              <div class="avatar">

                ${

                  (
                    appt.doctorName ||
                    "DR"
                  )

                  .substring(0, 2)
                  .toUpperCase()

                }

              </div>

              <div style="flex:1;">

                <div style="
                  color:var(--color-heading);
                  font-weight:600;
                  font-size:.93rem;
                ">

                  Dr. ${appt.doctorName || "Doctor"}

                </div>

                <div style="
                  color:var(--color-muted);
                  font-size:.8rem;
                ">

                  ${appt.appointmentDate}
                  ·
                  ${appt.appointmentTime}

                </div>

              </div>

              <span class="badge ${

                appt.status === "APPROVED"

                  ? "badge-teal"

                  : "badge-amber"

              }">

                ${appt.status}

              </span>

            </div>

          </div>

        `)

        .join("");

    document.getElementById(
      "patient-upcoming-list"
    ).innerHTML =

      upcomingHtml ||

      `<p style="color:var(--color-muted)">
        No appointments yet
      </p>`;

    // =========================
    // Notifications UI
    // =========================

    const notificationsHtml =

      notifications
        .slice(0, 3)
        .map(n => `

          <div class="notif-item ${

            !n.isRead
              ? "unread"
              : ""

          }">

            <div class="notif-content">

              <h4>
                ${n.title}
              </h4>

              <p>
                ${n.message}
              </p>

            </div>

          </div>

        `)

        .join("");

    document.getElementById(
      "patient-notifications-list"
    ).innerHTML =

      notificationsHtml ||

      `<p style="color:var(--color-muted)">
        No notifications yet
      </p>`;

  }

  catch (e) {

    console.error(
      "Patient dashboard error:",
      e
    );

  }
}

  return {
    renderDoctors,
    renderAppointmentsTable,
    renderMedicalHistory,
    renderHomeServices,
    renderWallet,
    loadHomeUserInfo,
    renderDoctorDropdown,
    renderFeedbackDoctorList,
    renderHomeStats,
    renderPatientFeedback
  };
})();

export default PatientView;
window.PatientView = PatientView;
