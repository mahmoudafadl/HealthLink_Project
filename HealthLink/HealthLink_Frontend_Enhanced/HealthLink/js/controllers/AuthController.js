/* ============================================================
HEALTHLINK — AUTH CONTROLLER (FIXED CLEAN VERSION)
============================================================ */

import AuthService from '../services/AuthService.js';
import DoctorService from '../services/doctorService.js';
import ToastService from '../services/ToastService.js';
import { AppState } from '../app.js';

const API_URL = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + "/api/auth";

const AuthController = (() => {

  let selectedRole = "patient";

  function restoreSession() {
  
    const user =
      JSON.parse(
        localStorage.getItem("user")
      );
  
    if (!user) return;
  
    AppState.currentUser = user;
    AppState.currentRole = user.role;
  
    doLoginUI(user);
  }

  // =========================
  // ROLE SELECT
  // =========================
  function selectRole(el, role) {

    el.closest('.login-roles')
      .querySelectorAll('.role-btn')
      .forEach(b => b.classList.remove('selected'));

    el.classList.add('selected');
    selectedRole = role;

    const doctorFields = document.getElementById('doctor-fields');
    if (doctorFields) {
      doctorFields.style.display = role === 'doctor' ? 'flex' : 'none';
    }
  }

  // =========================
  // REGISTER
  // =========================
  async function register() {

    const data = {
      fullName: document.getElementById("reg-name").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-pass").value,
      role: selectedRole.toUpperCase(),

      specialization: selectedRole === 'doctor'
        ? document.getElementById("reg-spec").value
        : null,

      experienceYears: selectedRole === 'doctor'
        ? document.getElementById("reg-exp").value
        : null
    };

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errors = await res.json();

        if (typeof errors === 'object' && !errors.message) {
          const messages = Object.values(errors).join('\n');
          ToastService.show(messages, "error");
        } else {
          ToastService.show(errors.message || "Registration failed", "error");
        }
        return;
      }

      if (selectedRole === "patient") {

        ToastService.show(
          "Account created successfully 🎉",
          "success"
        );

      } else {

        ToastService.show(
          "Account created! Wait for admin approval 👨‍💼",
          "success"
        );
      }

      // refresh doctors if doctor registered
      if (selectedRole === "doctor") {
        await DoctorService.getDoctors(true);
      }

      showLogin();

    } catch (err) {
      ToastService.show("Server error", "error");
    }
  }

  // =========================
  // LOGIN
  // =========================
  async function doLogin() {

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        ToastService.show(err.message || "Login failed", "error");
        return;
      }

      const authResponse = await res.json();

      let user = authResponse.user;

      // 🔥 merge doctor data
      if (user.role === "DOCTOR") {

  const doctors =
    await DoctorService.getDoctors();

  const fullDoctor =
    doctors.find(
      d => d.email === user.email
    );

  if (fullDoctor) {

    const {
      id: profileId,
      userId,
      ...doctorData
    } = fullDoctor;

    user = {

      ...user,

      ...doctorData,

      profileId,

      userId

    };

    // Always preserve users.id
    user.id =
      userId || user.id;

    console.log(
      "Doctor session:",
      user
    );
  }
}
      login({ ...authResponse, user });

      doLoginUI(user);

    } catch (err) {
      ToastService.show("Server error", "error");
    }
  }

  // =========================
  // SAVE USER
  // =========================
  function login(authResponse) {
    const user = authResponse.user;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", authResponse.token);
  }

  // =========================
  // AFTER LOGIN UI
  // =========================
  async function doLoginUI(user) {

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = 'block';

    document.getElementById('nav-role-label').textContent =
      AuthService.getRoleLabel();

    window.NavigationController.buildSidebar();

    // pending users
    if (user.status === "PENDING") {
      ToastService.show("Waiting for admin approval", "warning");
      window.NavigationController.navigate("home");
      return;
    }

    // 🔥 load doctors once globally
    window.DoctorController.fetchDoctors().then(doctors => {
      AppState.doctors = doctors;

      window.PatientView?.renderDoctors(doctors);
      window.PatientView?.renderDoctorDropdown(doctors);
      window.PatientView?.renderFeedbackDoctorList();
    });

    // doctor header
    if (user.role === "DOCTOR") {
      const el = document.querySelector("#page-doctor-dashboard p");
      if (el) {
        el.textContent = `${user.fullName} · ${user.specialization || "No specialization"}`;
      }
    }

    // routing
    const routes = {
      DOCTOR: "doctor-dashboard",
      PATIENT: "home",
      NURSE: "nurse-dashboard",
      ADMIN: "admin-dashboard",
      SUPER_ADMIN: "superadmin-dashboard"
    };

    const targetPage = routes[user.role];

    if (!targetPage) {
      ToastService.show("Unknown role", "error");
      return;
    }

    window.NavigationController.navigate(targetPage);

    window.SharedView?.updateWelcomeHeader();

    if (user.role === "PATIENT") {
      window.PatientView?.loadHomeUserInfo();
    }

    ToastService.show("Welcome " + user.fullName, "success");
  }

  // =========================
  // NAVIGATION UI
  // =========================
  function showRegister() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'flex';
  }

  function showLogin() {
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  }

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    AuthService.logout();

    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  }

  function goEmergencyDirect() {

    document.getElementById(
      'login-screen'
    ).style.display = 'none';

    const registerScreen =
      document.getElementById(
        'register-screen'
      );

    if (registerScreen) {
      registerScreen.style.display =
        'none';
    }

    document.getElementById(
      'app-shell'
    ).style.display = 'block';

    document
      .querySelectorAll('.page')
      .forEach(
        p => p.classList.remove('active')
      );

    const emergencyPage =
      document.getElementById(
        'page-emergency'
      );

    if (emergencyPage) {

      emergencyPage.classList.add(
        'active'
      );
    }
  }

  return {
    selectRole,
    register,
    doLogin,
    logout,
    showRegister,
    showLogin,
    goEmergencyDirect,
    restoreSession
  };

})();

export default AuthController;
window.AuthController = AuthController;