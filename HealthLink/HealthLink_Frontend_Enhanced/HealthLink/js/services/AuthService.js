/* ============================================================
HEALTHLINK — AUTH SERVICE (FINAL)
============================================================ */

const AuthService = (() => {

  const ROLE_LABELS = {
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    ADMIN: 'Admin',
    NURSE: 'Nurse',
    SUPER_ADMIN: 'SuperAdmin'
  };

  const DEFAULT_PAGES = {
    PATIENT: 'home',
    DOCTOR: 'doctor-dashboard',
    ADMIN: 'admin-dashboard',
    NURSE: 'nurse-dashboard',
    SUPER_ADMIN: 'superadmin-dashboard'
  };

  // =========================
  // STORAGE
  // =========================
  function getUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function getRole() {
    return getUser()?.role?.toUpperCase();
  }

  function getRoleLabel() {
    return ROLE_LABELS[getRole()] || 'User';
  }

  function getDefaultPage() {
    return DEFAULT_PAGES[getRole()] || 'home';
  }

  // =========================
  // LOGIN (FROM BACKEND)
  // =========================
  function login(authResponse) {

    // ⚠️ الباك لازم يرجع { user, token }
    const user = authResponse.user;

    user.role = user.role?.toUpperCase();

    localStorage.setItem("user", JSON.stringify(user));

    if (authResponse.token) {
      localStorage.setItem("token", authResponse.token);
    }
  }

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  return {
    getUser,
    getToken,
    isLoggedIn,
    getRole,
    getRoleLabel,
    getDefaultPage,
    login,
    logout
  };

})();

export default AuthService;
window.AuthService = AuthService;