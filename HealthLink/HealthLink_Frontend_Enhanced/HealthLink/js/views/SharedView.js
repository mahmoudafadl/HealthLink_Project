/* ============================================================
   HEALTHLINK — SHARED VIEW
============================================================ */

import PatientView from './PatientView.js';
import NotificationService from '../services/NotificationService.js';

const SharedView = (() => {

  async function renderNotifications(role) {

    const container =
      document.getElementById(
        'notif-list'
      );

    if (!container) return;

    try {

      const notifications =
        await NotificationService
          .getNotifications();

      if (
        !notifications.length
      ) {

        container.innerHTML = `
          <div class="card"
               style="
                 padding:20px;
                 text-align:center;
               ">
            No notifications yet.
          </div>
        `;

        return;
      }

      container.innerHTML =
        notifications.map(
          n => `

          <div class="card"
               onclick="
                 SharedView.markAsRead(${n.id})
               "

               style="
                 padding:16px;
                 margin-bottom:12px;
                 cursor:pointer;
                 opacity:${n.isRead ? '0.65' : '1'};
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

    } catch (error) {

      console.error(
        "Notifications render error:",
        error
      );

      container.innerHTML = `
        <div class="card"
             style="
               padding:20px;
               text-align:center;
             ">
          Failed to load notifications.
        </div>
      `;
    }
  }


  async function markAsRead(id) {

    await NotificationService
      .markAsRead(id);

    await renderNotifications();

    if (
      window.loadNotificationBadge
    ) {

      await window
        .loadNotificationBadge();
    }
  }


 async function updateWelcomeHeader() {

    const user =
      JSON.parse(
        localStorage.getItem(
          "user"
        )
      );

    if (!user) return;

    const role =
      user.role;

    if (
      role === "PATIENT"
    ) {

      const h2 =
        document.querySelector(
          "#page-home h2"
        );

      const p =
        document.querySelector(
          "#page-home p"
        );

      if (h2)
        h2.innerText =
          `Welcome back, ${user.fullName} 👋`;

      if (p)
        p.innerText =
          `${new Date().toDateString()} — Your health, simplified.`;
    }

    if (role === "DOCTOR") {

      const h2 =
        document.querySelector(
          "#page-doctor-dashboard h2"
        );

      const p =
        document.querySelector(
          "#page-doctor-dashboard p"
      );

      if (h2) {
         h2.innerText =
          `Welcome back Dr. ${user.fullName} 👨‍⚕️`;
      }

  try {

    const doctors =
      await api.getDoctors();

    const myDoctor =
      doctors.find(
        d =>
          d.email === user.email ||
          d.user?.email === user.email
    );

    const specialization =
      myDoctor?.specialization ||
      "Doctor";

    if (p) {
      p.innerText =
        `${specialization} Dashboard — ${new Date().toDateString()}`;
    }

  } catch {

    if (p) {
      p.innerText =
        `Doctor Dashboard — ${new Date().toDateString()}`;
    }
  }
}

    if (
      role === "ADMIN"
    ) {

      const h2 =
        document.querySelector(
          "#page-admin-dashboard h2"
        );

      const p =
        document.querySelector(
          "#page-admin-dashboard p"
        );

      if (h2)
        h2.innerText =
          `Welcome Admin ${user.fullName}`;

      if (p)
        p.innerText =
          `System Overview — ${new Date().toDateString()}`;
    }
  }

  return {
    renderNotifications,
    markAsRead,
    updateWelcomeHeader
  };

})();

export default SharedView;

window.SharedView =
  SharedView;