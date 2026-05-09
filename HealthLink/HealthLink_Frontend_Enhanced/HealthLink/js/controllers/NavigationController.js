import AuthService from '../services/AuthService.js';
import ToastService from '../services/ToastService.js';
import AuthController from './AuthController.js';

const NavigationController = (() => {

  const SIDEBAR_CONFIG = {

    PATIENT: [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
      { id: 'book-appointment', label: 'Book Appointment', icon: '📅' },
      { id: 'my-appointments', label: 'My Appointments', icon: '📋' },
      { id: 'medical-history', label: 'Medical History', icon: '🏥' },
      { id: 'home-services', label: 'Home Services', icon: '🏡' },
      { id: 'wallet', label: 'Wallet', icon: '💳' },
      { id: 'feedback', label: 'Feedback', icon: '⭐' },
      { id: 'emergency', label: 'Emergency', icon: '🚨' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' }
    ],

    DOCTOR: [
      { id: 'doctor-dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'doctor-appointments', label: 'Appointments', icon: '📅' },
      { id: 'doctor-patients', label: 'Patients', icon: '👥' },
      { id: 'doctor-reports', label: 'Final Reports', icon: '📄' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' }
    ],

    ADMIN: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'admin-logs', label: 'Activity Logs', icon: '📋' },
      { id: 'admin-feedback', label: 'Feedback', icon: '⭐' },
      { id: 'admin-payments', label: 'Payments', icon: '💳' },
      { id: 'emergency-mgmt', label: 'Emergency', icon: '🚨' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'admin-users', label: 'Users', icon: '👥' }
    ],

    SUPER_ADMIN: [
      { id: 'superadmin-dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'admin-logs', label: 'Activity Logs', icon: '📋' },
      { id: 'admin-feedback', label: 'Feedback', icon: '⭐' },
      { id: 'admin-payments', label: 'Payments', icon: '💳' },
      { id: 'emergency-mgmt', label: 'Emergency', icon: '🚨' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'superadmin-users', label: 'All Users', icon: '👥' }
    ],

    NURSE: [
      { id: 'nurse-dashboard', label: 'Dashboard', icon: '💉' },
      { id: 'nurse-notifications', label: 'Notifications', icon: '🔔' }
    ]
  };


  const ALLOWED_PAGES = {

    PATIENT: [
      'home',
      'doctors',
      'book-appointment',
      'my-appointments',
      'medical-history',
      'home-services',
      'wallet',
      'feedback',
      'emergency',
      'notifications'
    ],

    DOCTOR: [
      'doctor-dashboard',
      'doctor-appointments',
      'doctor-patients',
      'doctor-reports',
      'doctor-alerts',
      'notifications'
    ],

    ADMIN: [
      'admin-dashboard',
      'admin-logs',
      'admin-feedback',
      'admin-payments',
      'emergency-mgmt',
      'notifications',
      'admin-users'
    ],

    SUPER_ADMIN: [
      'superadmin-dashboard',
      'admin-logs',
      'admin-feedback',
      'admin-payments',
      'emergency-mgmt',
      'notifications',
      'superadmin-users'
    ],

    NURSE: [
      'nurse-dashboard',
      'nurse-notifications',
      'notifications'
    ]
  };


  function _checkAuth() {

    if (!AuthService.isLoggedIn()) {

      ToastService.show(
        "Please login first",
        "error"
      );

      AuthController.showLogin();

      return false;
    }

    return true;
  }


  function buildSidebar() {

    if (!_checkAuth()) return;

    const role =
      AuthService.getRole();

    const sidebar =
      document.getElementById(
        'sidebar'
      );

    if (!sidebar) return;

    sidebar.innerHTML = '';

    (
      SIDEBAR_CONFIG[role] || []
    ).forEach(item => {

      const btn =
        document.createElement(
          'button'
        );

      btn.className =
        'sidebar-item';

      btn.dataset.page =
        item.id;

      btn.innerHTML = `
        <span>${item.icon}</span>
        <span>${item.label}</span>
      `;

      btn.onclick =
        () => navigate(item.id);

      sidebar.appendChild(btn);
    });
  }


  function navigate(pageId) {

    if (!_checkAuth()) return;

    const role =
      AuthService.getRole();

    if (
      !ALLOWED_PAGES[role]
        ?.includes(pageId)
    ) {

      ToastService.show(
        'Access Denied',
        'error'
      );

      return;
    }

    document
      .querySelectorAll('.page')
      .forEach(
        p => p.classList.remove('active')
      );

    const target =
      document.getElementById(
        'page-' + pageId
      );

    if (target)
      target.classList.add('active');

    _renderPage(pageId);
  }



  async function _renderPage(id) {

    const role =
      AuthService.getRole();

    const renderMap = {

      // Shared Notifications
      notifications: () =>
        window.SharedView
          ?.renderNotifications?.(role),

      'nurse-dashboard': () =>
        window.NurseView
          ?.renderDashboard?.(),    

      'nurse-notifications': () =>
        window.NurseView
          ?.renderAlerts?.(),

      // Patient
      doctors: () =>
        window.PatientView
          ?.renderDoctors?.(),

      'my-appointments': () =>
        window.PatientView
          ?.renderAppointmentsTable?.(),

      'medical-history': () =>
        window.PatientView
          ?.renderMedicalHistory?.(),

      'home-services': () =>
        window.PatientView
          ?.renderHomeServices?.(),

      wallet: () =>
        window.PatientView
          ?.renderWallet?.(),
          
      feedback: () => {

        window.PatientView
          ?.renderFeedbackDoctorList?.();

         window.PatientView
          ?.renderPatientFeedback?.();

      },
        
      // Doctor
      'doctor-dashboard': () =>
        window.DoctorView
          ?.renderDashboard?.(),

      'doctor-appointments': () =>
        window.DoctorView
          ?.renderAppointments?.(),

      'doctor-patients': () =>
        window.DoctorView
          ?.renderPatients?.(),

      'doctor-reports': () =>
        window.DoctorView
          ?.renderFinalReports?.(),

      'doctor-alerts': () =>
        window.DoctorView
          ?.renderAlerts?.(),

      // Admin
      'admin-dashboard': () =>
        window.AdminView
          ?.renderDashboard?.(),

      'admin-logs': () =>
        window.AdminView
          ?.renderActivityLogs?.(),

      'admin-feedback': () =>
        window.AdminView
          ?.renderFeedbackManagement?.(),

      'admin-payments': () =>
        window.AdminView
          ?.renderPayments?.(),

      'emergency-mgmt': () =>
        window.AdminView
          ?.renderEmergencyManagement?.(),

      'admin-users': () =>
         window.AdminView
          ?.renderUsers?.(),

      // Super Admin
      'superadmin-dashboard': () =>
        window.SuperAdminView
          ?.renderDashboard?.(),

      'superadmin-users': () =>
        window.SuperAdminView
          ?.renderUserManagement?.()
    };

    if (renderMap[id]) {

      try {

        await renderMap[id]();

      } catch (error) {

        console.error(
          "Page render error:",
          error
        );
      }
    }
  }


  return {
    buildSidebar,
    navigate
  };

})();

export default NavigationController;

window.NavigationController =
  NavigationController;