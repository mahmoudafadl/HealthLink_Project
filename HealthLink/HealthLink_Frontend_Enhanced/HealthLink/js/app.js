/**
 * AppState — shared UI state only (NOT business data)
 */
export const AppState = {
  specFilter: 'All',
  currentRating: 0,
  currentUser: null,
  currentRole: null,
  doctors: []
};

window.AppState = AppState;

import NotificationService from './services/NotificationService.js';
import ThemeController from './controllers/ThemeController.js';
import UIHelpers from './controllers/UIHelpers.js';
import AuthService from './services/AuthService.js';
import PatientController from './controllers/PatientController.js';
import DoctorView from './views/DoctorView.js';
import AdminView from './views/AdminView.js';
import SuperAdminView from './views/SuperAdminView.js';
import NurseView from './views/NurseView.js';


document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // UI Initialization
  // =========================
  ThemeController.init();
  UIHelpers.initDateInputs();

  // =========================
  // Load Current User
  // =========================
  window.AuthController?.restoreSession();

AppState.currentUser =
  AuthService.getUser();

if (AppState.currentUser) {

  AppState.currentRole =
    AppState.currentUser.role;

  // مهم جدًا
  initApp(
    AppState.currentRole
  );

  loadNotificationBadge();

  startLiveRefresh();

} else {

  document.getElementById(
    'login-screen'
  ).style.display = 'flex';

  document.getElementById(
    'app-shell'
  ).style.display = 'none';
}
});


/**
 * Main App Initialization
 */
function initApp(role) {

  // =========================
  // PATIENT
  // =========================
  if (
    role === 'PATIENT' ||
    role === 'patient'
  ) {

    PatientController
      .loadDashboard();
  }

  // =========================
  // DOCTOR
  // =========================
  else if (
    role === 'DOCTOR' ||
    role === 'doctor'
  ) {

    DoctorView?.renderDashboard?.();

    DoctorView?.renderAppointments?.();

    DoctorView?.renderPatients?.();
  }

  // =========================
  // ADMIN
  // =========================
  else if (
    role === 'ADMIN' ||
    role === 'admin'
  ) {

    AdminView
      .renderDashboard();
      
    AdminView
      .renderUsers();  

    AdminView
      .renderActivityLogs();

    AdminView
      .renderFeedbackManagement();

    AdminView
      .renderPayments();

    AdminView
      .renderEmergencyManagement();
  }

  // =========================
  // SUPER ADMIN
  // =========================
  else if (
    role === 'SUPER_ADMIN'
  ) {

    SuperAdminView
      .renderDashboard();
  }

  // =========================
  // NURSE
  // =========================
  else if (
    role === 'NURSE' ||
    role === 'nurse'
  ) {

    NurseView?.renderDashboard?.();
  }
}


/**
 * Reinitialize after login
 */
function reinitializeApp(role) {

  AppState.currentRole =
    role;

  initApp(role);

  loadNotificationBadge();
}

window.reinitializeApp =
  reinitializeApp;


/**
 * Update notification bell
 */
async function loadNotificationBadge() {

  try {

    const badge =
      document.getElementById(
        'notif-dot'
      );

    if (!badge) return;

    const count =
      await NotificationService
        .getUnreadCount();

    if (count > 0) {

      badge.style.display =
        'block';

    } else {

      badge.style.display =
        'none';
    }

  } catch (error) {

    console.error(
      'Badge loading error:',
      error
    );
  }
}

window.loadNotificationBadge =
  loadNotificationBadge;


/**
 * Live refresh every 5 seconds
 * Only refresh notifications
 * if notifications page is open
 */
function startLiveRefresh() {

  setInterval(async () => {

    try {

      // refresh bell
      await loadNotificationBadge();

      // refresh list only if page open
      const notifPage =
        document.getElementById(
          'page-notifications'
        );

      if (
        notifPage &&
        notifPage.classList.contains(
          'active'
        ) &&
        window.SharedView &&
        typeof window.SharedView
          .renderNotifications === 'function'
      ) {

        window.SharedView
          .renderNotifications(
            AppState.currentRole
          );
      }

    } catch (error) {

      console.error(
        'Live refresh error:',
        error
      );
    }

  }, 5000);
}