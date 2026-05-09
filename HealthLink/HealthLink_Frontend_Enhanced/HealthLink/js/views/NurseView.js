/* ============================================================
   HEALTHLINK — NURSE VIEW (INTEGRATED)
   All render functions for the Nurse role pages.
============================================================ */

import NurseService from '../services/NurseService.js';
import NotificationService from '../services/NotificationService.js';
import { NurseController } from '../controllers/SharedController.js';

const NurseView = (() => {

  async function renderDashboard() {

    const list =
      document.getElementById(
        'nurse-requests-list'
      );

    if (!list) return;

    list.innerHTML =
      `<div class="card" style="padding:16px;">
        Loading requests...
      </div>`;

    try {

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
        );

      const myRequests =
        await NurseService
          .getMyRequests(
            user.id
          );

      const availableRequests =
        await NurseService
          .getAvailableRequests();

      const allRequests = [
        ...availableRequests,
        ...myRequests
      ];
      const totalRequests =
  allRequests.length;

const pendingCount =
  allRequests.filter(
    r => r.status === "PENDING"
  ).length;

const inProgressCount =
  allRequests.filter(
    r => r.status === "APPROVED"
  ).length;

const completedCount =
  allRequests.filter(
    r => r.status === "COMPLETED"
  ).length;


document.getElementById(
  "nurse-total-requests"
).textContent = totalRequests;


document.getElementById(
  "nurse-pending-count"
).textContent = pendingCount;


document.getElementById(
  "nurse-progress-count"
).textContent = inProgressCount;


document.getElementById(
  "nurse-completed-count"
).textContent = completedCount;

      if (
        allRequests.length === 0
      ) {

        list.innerHTML =
          `<div class="card"
                style="
                  padding:16px;
                  color:var(--color-muted);
                ">
              No service requests found.
           </div>`;

        return;
      }

      list.innerHTML =
        allRequests.map(
          (r) => {

            const isMyRequest =
              r.nurse &&
              r.nurse.id === user.id;

            const statusBadge =
              r.status === 'COMPLETED'
                ? 'badge-green'
                : r.status === 'APPROVED'
                  ? 'badge-teal'
                  : 'badge-amber';

            let actionBtns = '';

            if (!r.nurse) {

              actionBtns = `
                <div style="display:flex;gap:6px;">

                  <button
                    class="btn btn-success btn-sm"
                    onclick="
                      NurseController.acceptRequest(${r.id})
                    ">
                    Accept
                  </button>

                  <button
                    class="btn btn-danger btn-sm"
                    onclick="
                      NurseController.rejectRequest(${r.id})
                    ">
                    Reject
                  </button>

                </div>
              `;
            }

            else if (
              isMyRequest &&
              r.status === 'APPROVED'
            ) {

              actionBtns = `
                <div style="display:flex;gap:6px;">

                  <button
                    class="btn btn-primary btn-sm"
                    onclick="
                      NurseController.completeRequest(${r.id})
                    ">
                    Mark Complete
                  </button>

                  <button
                    class="btn btn-danger btn-sm"
                    onclick="
                      NurseController.rejectRequest(${r.id})
                    ">
                    Reject
                  </button>

                </div>
              `;
            }

            return `

              <div class="card"
                   style="
                     padding:16px;
                     border-left:4px solid
                     ${r.nurse
                        ? 'var(--color-accent)'
                        : 'var(--color-warning)'};
                   ">

                <div style="
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:14px;
                    flex-wrap:wrap;
                ">

                  <div>

                    <div style="
                      color:var(--color-heading);
                      font-weight:600;
                      font-size:.93rem;
                      margin-bottom:4px;
                    ">
                      ${r.serviceType}
                    </div>

                    <div style="
                      color:var(--color-muted);
                      font-size:.8rem;
                    ">
                      Patient:
                      ${r.patient.fullName}
                    </div>

                    <div style="
                      color:var(--color-muted);
                      font-size:.8rem;
                    ">
                      📍 ${r.address}
                    </div>

                    <div style="
                      color:var(--color-muted);
                      font-size:.8rem;
                    ">
                      📞 ${r.contactNumber}
                    </div>

                    <div style="
                      color:var(--color-muted);
                      font-size:.8rem;
                    ">
                      📅 Requested:
                      ${new Date(
                          r.requestedAt
                        ).toLocaleString()}
                    </div>

                    ${
                      r.nurse
                        ?

                        `<div style="
                          color:var(--color-accent);
                          font-size:.75rem;
                          margin-top:4px;
                          font-weight:500;
                        ">
                          Assigned to:
                          ${r.nurse.fullName}
                        </div>`

                        :

                        `<div style="
                          color:var(--color-warning);
                          font-size:.75rem;
                          margin-top:4px;
                          font-weight:500;
                        ">
                          Available for all nurses
                        </div>`
                    }

                  </div>


                  <div style="
                    display:flex;
                    flex-direction:column;
                    align-items:flex-end;
                    gap:8px;
                  ">

                    <span
                      class="badge ${statusBadge}">
                      ${r.status}
                    </span>

                    ${actionBtns}

                  </div>

                </div>

              </div>

            `;
          }

        ).join('');

    } catch (e) {

      list.innerHTML =
        `<div class="card"
              style="
                padding:16px;
                color:var(--color-danger);
              ">
            Failed to load requests.
         </div>`;
    }
  }



  async function renderAlerts() {

    const list =
      document.getElementById(
        'nurse-alerts-list'
      );

    if (!list) return;

    try {

      const notifications =
        await NotificationService
          .getNotifications();

      if (
        notifications.length === 0
      ) {

        list.innerHTML = `
          <div style="
            color:var(--color-muted);
            padding:20px;
            text-align:center;
          ">
            No notifications yet.
          </div>
        `;

        return;
      }

      list.innerHTML =
        notifications.map(
          (n) => `

            <div class="card"
                 style="
                   padding:16px;
                   margin-bottom:12px;
                   opacity:${n.read ? '0.65' : '1'};
                 ">

              <h4 style="
                margin-bottom:8px;
              ">
                ${n.title}
              </h4>

              <p style="
                margin-bottom:8px;
              ">
                ${n.message}
              </p>

              <small>
                ${new Date(
                    n.createdAt
                  ).toLocaleString()}
              </small>

            </div>

          `
        ).join('');

    } catch (e) {

      console.error(e);

      list.innerHTML = `
        <div style="
          color:var(--color-danger);
          padding:20px;
        ">
          Failed to load notifications.
        </div>
      `;
    }
  }

  return {
    renderDashboard,
    renderAlerts
  };

})();

export default NurseView;
window.NurseView = NurseView;