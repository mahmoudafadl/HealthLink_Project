/* ============================================================
   HEALTHLINK — DOCTOR VIEW
   All render functions for the Doctor role pages.
 ============================================================ */

import Database from '../repositories/Database.js';
import DoctorController from '../controllers/DoctorController.js';
import ToastService from '../services/ToastService.js';
import * as api from '../repositories/apiRepository.js';
import { AppState } from '../app.js';

const DoctorView = (() => {

  async function renderDashboard() {
    const list = document.getElementById('doctor-appt-list');
    if (!list) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const appointments = await api.getDoctorAppointments(user.id);

      const today = new Date().toISOString().split('T')[0];

      const todayAppts = appointments.filter(a => {

        const apptDate = Array.isArray(a.appointmentDate)
          ? `${a.appointmentDate[0]}-${String(a.appointmentDate[1]).padStart(2, '0')}-${String(a.appointmentDate[2]).padStart(2, '0')}`
          : a.appointmentDate;

        return apptDate === today;

      });

      if (todayAppts.length === 0) {

        list.innerHTML =
          `<div class="card" style="padding:16px; color:var(--color-muted);">
            No appointments for today.
          </div>`;

      } else {

        list.innerHTML =
          todayAppts.map((a) => {

            const statusBadge =
              a.status === 'COMPLETED'
                ? 'badge-green'
                : a.status === 'APPROVED'
                  ? 'badge-teal'
                  : 'badge-amber';

            return `
              <div class="card" style="padding:14px;">

                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">

                  <div class="avatar">
                    ${a.patientName.split(' ').map(w => w[0]).join('')}
                  </div>

                  <div style="flex:1; min-width:150px;">

                    <div style="
                      color:var(--color-heading);
                      font-weight:600;
                      font-size:1rem;
                    ">
                      ${a.patientName}
                    </div>

                    <div style="
                      color:var(--color-muted);
                      font-size:.85rem;
                    ">
                      ${a.visitType} · ${a.appointmentTime}
                    </div>

                  </div>

                  <div style="display:flex; align-items:center; gap:10px;">

                    <span class="badge ${statusBadge}">
                      ${a.status}
                    </span>

                    ${a.status === 'PENDING' ? `
                      <div style="display:flex; gap:6px;">

                        <button
                          class="btn btn-success btn-sm"
                          onclick="DoctorController.approveAppointment(${a.id})">
                          ✓
                        </button>

                        <button
                          class="btn btn-danger btn-sm"
                          onclick="DoctorController.rejectAppointment(${a.id})">
                          ✗
                        </button>

                      </div>
                    ` : ''}

                  </div>

                </div>

              </div>
            `;

          }).join('');
      }

      const alerts = await api.getDoctorAlerts();

      const unreadAlerts =
        alerts.filter(a => !a.read).length;

      document.getElementById(
        "today-appointments"
      ).innerText =
        todayAppts.length;

      document.getElementById(
        "completed-today"
      ).innerText =
        appointments.filter(
          a => a.status === 'COMPLETED'
        ).length;

      document.getElementById(
        "doctor-alert-count"
      ).innerText =
        unreadAlerts;

      const patients =
        await DoctorController.fetchDoctorPatients();

      document.getElementById(
        "total-patients"
      ).innerText =
        patients.length;

      // dropdown
      const patientSelect =
        document.getElementById(
          'upload-patient-id'
        );

      if (patientSelect) {

        patientSelect.innerHTML =
          '<option value="">Select Patient</option>' +

          patients.map(p => `

            <option value="${p.id}">
              ${p.fullName || p.name || "Patient"}
            </option>

          `).join('');
      }

    } catch (e) {

      console.error(e);

    }
  }


  function renderStats() {}


  async function renderAppointments() {

    try {

      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      if (!user) return;

      const appointments =
        await api.getDoctorAppointments(
          user.id
        );

      const body =
        document.getElementById(
          "doctor-appointments-body"
        );

      if (!body) return;

      if (!appointments?.length) {

        body.innerHTML =
          `<tr>
            <td colspan="6"
                style="text-align:center;padding:20px;">
              No appointments found
            </td>
          </tr>`;

        return;
      }

      body.innerHTML =
        appointments.map(appt => {

          const apptDate =
            Array.isArray(
              appt.appointmentDate
            )
              ? `${appt.appointmentDate[0]}-${String(appt.appointmentDate[1]).padStart(2,'0')}-${String(appt.appointmentDate[2]).padStart(2,'0')}`
              : appt.appointmentDate;

          return `
            <tr>

              <td>${appt.patientName}</td>
              <td>${apptDate}</td>
              <td>${appt.appointmentTime}</td>
              <td>${appt.visitType}</td>

              <td>

  <span class="badge ${

    appt.status === "COMPLETED"

      ? "badge-green"

      : appt.status === "APPROVED"

        ? "badge-teal"

        : appt.status === "CANCELLED" ||
          appt.status === "REJECTED"

          ? "badge-danger"

          : "badge-amber"

  }">

    ${appt.status}

  </span>

</td>

              <td>

                ${appt.status === "PENDING" ? `

                  <button
                    class="btn btn-success btn-sm"
                    onclick="DoctorController.approveAppointment(${appt.id})">
                    Approve
                  </button>

                  <button
                    class="btn btn-danger btn-sm"
                    onclick="DoctorController.rejectAppointment(${appt.id})">
                    Reject
                  </button>

                ` : ""}

                ${appt.status === "APPROVED" ? `

                  <button
                    class="btn btn-primary btn-sm"
                    onclick="DoctorController.completeAppointment(${appt.id})">
                    Complete
                  </button>

                ` : ""}

              </td>

            </tr>
          `;

        }).join('');

    } catch (error) {

      console.error(error);

      ToastService.show(
        "Failed to load appointments",
        "error"
      );
    }
  }


  // FIXED
  async function renderPatients(
    searchTerm = ''
  ) {

    const tbody =
      document.getElementById(
        'doctor-patients-body'
      );

    if (!tbody) return;

    try {

      const patients =
        (window.AppState &&
          window.AppState.docPatients)

        ||

        await DoctorController
          .fetchDoctorPatients();

      const search =
        searchTerm.toLowerCase();

      const filtered =
        (patients || []).filter(p => {

          const patientName =
            (p.fullName || p.name || "")
              .toLowerCase();

          return (
            !search ||
            patientName.includes(search) ||
            String(p.id).includes(search)
          );

        });

      if (filtered.length === 0) {

        tbody.innerHTML =
          `<tr>
            <td colspan="6"
                style="text-align:center;padding:20px;">
              No patients found
            </td>
          </tr>`;

        return;
      }

      tbody.innerHTML =
        filtered.map(p => {

          const patientName =
            p.fullName ||
            p.name ||
            "Patient";

          return `

            <tr>

              <td>

                <div style="
                  display:flex;
                  align-items:center;
                  gap:10px;
                ">

                  <div class="avatar"
                       style="
                        width:30px;
                        height:30px;
                        font-size:.7rem;
                       ">

                    ${patientName
                      .split(' ')
                      .map(w => w[0])
                      .join('')}

                  </div>

                  ${patientName}

                </div>

              </td>

              <td>${p.age || "N/A"}</td>

              <td>
                <span class="badge badge-amber">
                  ${p.condition || "N/A"}
                </span>
              </td>

              <td style="color:var(--color-muted);">
                ${p.lastVisit || 'N/A'}
              </td>

              <td>
                ${p.nextAppointment || 'N/A'}
              </td>

              <td>

                <button
                  class="btn btn-ghost btn-sm"
                  onclick="DoctorController.showPatientDetails('${patientName}')">

                  View

                </button>

              </td>

            </tr>

          `;

        }).join('');

    } catch (e) {

      console.error(e);

    }
  }


  // FIXED
  async function renderFinalReports() {

    const list =
      document.getElementById(
        'final-reports-list'
      );

    if (!list) return;

    try {

      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      const doctorId = user.id;

      const reports =
        await api.getClinicalRecordsByDoctor(
          doctorId
        );

      if (!reports.length) {

        list.innerHTML =
          `<div style="
            color:var(--color-muted);
            padding:20px;
            text-align:center;
          ">
            No reports uploaded yet.
          </div>`;

        return;
      }

      list.innerHTML =
  reports.map(r => `

    <div class="card"
         style="
          padding:18px;
          margin-bottom:12px;
         ">

      <div style="
        font-weight:600;
        color:var(--color-heading);
        margin-bottom:8px;
      ">
        ${r.documentType}
      </div>

      <div style="
        color:var(--color-muted);
        font-size:.85rem;
        margin-bottom:10px;
      ">
        Patient:
        ${r.patient?.fullName || "Patient"}
      </div>

      <div style="
        color:var(--color-text);
        line-height:1.5;
      ">
        ${r.medicalNotes || r.diagnosis || "No notes"}
      </div>

    </div>

  `).join('');

    } catch (e) {

      console.error(e);

      list.innerHTML =
        `<div style="
          color:var(--color-danger);
          padding:20px;
        ">
          Failed to load reports.
        </div>`;
    }
  }

  async function renderAlerts() {
    const list = document.getElementById('doctor-alerts-list');
    if (!list) return;

    try {
      const alerts = await api.getDoctorAlerts();

      if (!alerts.length) {
        list.innerHTML = `<div>No alerts from admin yet.</div>`;
        return;
      }

      list.innerHTML = alerts.map(a => `
        <div class="card" style="padding:16px;">
          <div>${a.message}</div>
        </div>
      `).join('');

    } catch (e) {
      console.error(e);
    }
  }

  function loadDoctorInfo() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const specEl =
      document.getElementById(
        "doctor-specialization"
      );

    if (specEl) {

      specEl.textContent =
        `${user.fullName} · ${user.specialization || "No specialization"}`;
    }
  }

  function loadDoctorHeader() {
    loadDoctorInfo();
  }

  function renderDoctorStats() {}

  return {
    renderDashboard,
    renderAppointments,
    renderPatients,
    renderFinalReports,
    renderAlerts,
    loadDoctorInfo,
    loadDoctorHeader,
    renderStats: renderDoctorStats
  };

})();

export default DoctorView;
window.DoctorView = DoctorView;