/* ============================================================
   HEALTHLINK — DATABASE REPOSITORY (UPDATED)
============================================================ */

const Database = {

  // ✅ NEW: USERS (for Admin Approval)
  users: [
    { id: 1, name: 'Ahmed Ali',    email: 'ahmed@test.com',  role: 'patient', status: 'pending' },
    { id: 2, name: 'Mona Hassan',  email: 'mona@test.com',   role: 'patient', status: 'approved' },
    { id: 3, name: 'Youssef Samir',email: 'youssef@test.com',role: 'patient', status: 'rejected' }
  ],

  // ================= DOCTORS =================
  doctors: [
    { id: 1, name: 'Dr. Mohamed Ahmed', spec: 'Cardiology', exp: '12 years', rating: 4.9, patients: 310, fee: 'EGP 450', avatar: 'MA', available: true },
    { id: 2, name: 'Dr. Lina Khalil', spec: 'Dermatology', exp: '8 years', rating: 4.7, patients: 245, fee: 'EGP 380', avatar: 'LK', available: true }
  ],

  // ================= OTHER DATA (زي ما هو) =================
  appointments: [],
  history: [],
  prescriptions: [],
  homeServices: [],
  notifications: [],
  doctorAlerts: [],
  doctorAppts: [],
  docPatients: [],
  finalReports: [],
  payments: [],
  emergencies: [],
  nurseRequests: [],
  activityLogs: [],
  feedbackList: [],
  wallet: { balance: 1200 },
  walletTransactions: [],
  myReviews: [],
  ratings: []
};


/* ============================================================
   ✅ FUNCTIONS FOR USERS (Admin Control)
============================================================ */

const UserRepository = {

  // 📥 get all users
  getAllUsers() {
    return Database.users;
  },

  // ⏳ get pending users only
  getPendingUsers() {
    return Database.users.filter(u => u.status === 'pending');
  },

  // ✅ approve user
  approveUser(id) {
    const user = Database.users.find(u => u.id == id);
    if (user) user.status = 'approved';
  },

  // ❌ reject user
  rejectUser(id) {
    const user = Database.users.find(u => u.id == id);
    if (user) user.status = 'rejected';
  },

  // ➕ add new user (called in register)
  addUser(user) {
    user.id = Date.now();
    user.status = 'pending'; // مهم جدا
    Database.users.push(user);
  }
};

export default Database;
export { UserRepository };
window.Database = Database;