const AdminService = (() => {

  const API_URL = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + "/api";

  function getAuthHeaders() {

    const token =
      localStorage.getItem(
        "token"
      );

    return {
      "Content-Type":
        "application/json",

      "Authorization":
        `Bearer ${token}`
    };

  }


  async function getAllUsers() {

    const res =
      await fetch(
        `${API_URL}/admin/users`,
        {
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to load users"
      );
    }

    return await res.json();

  }


  async function getPendingRegistrations() {

    const res =
      await fetch(
        `${API_URL}/registrations/pending`,
        {
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to load pending registrations"
      );
    }

    return await res.json();

  }


  async function approveUser(
    requestId
  ) {

    const res =
      await fetch(
        `${API_URL}/registrations/${requestId}/approve`,
        {
          method: "PUT",
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to approve user"
      );
    }

    return await res.json();

  }


  async function rejectUser(
    requestId,
    reason
  ) {

    const res =
      await fetch(
        `${API_URL}/registrations/${requestId}/reject`,
        {
          method: "PUT",

          headers:
            getAuthHeaders(),

          body:
            JSON.stringify({
              reason
            })
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to reject user"
      );
    }

    return await res.json();

  }


  async function getAllFeedback() {

    const res =
      await fetch(
        `${API_URL}/feedback`,
        {
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to load feedback"
      );
    }

    return await res.json();

  }


  async function getAllAppointments() {

    const res =
      await fetch(
        `${API_URL}/appointments/all`,
        {
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to load appointments"
      );
    }

    return await res.json();

  }


  async function getAllHomeRequests() {

    const res =
      await fetch(
        `${API_URL}/home-service-requests/all`,
        {
          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to load home requests"
      );
    }

    return await res.json();

  }


  async function deleteUser(
    userId
  ) {

    const res =
      await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",

          headers:
            getAuthHeaders()
        }
      );

    if (!res.ok) {
      throw new Error(
        "Failed to delete user"
      );
    }

    return true;

  }


  return {

    getAllUsers,
    getPendingRegistrations,

    approveUser,
    rejectUser,

    getAllFeedback,

    getAllAppointments,
    getAllHomeRequests,

    deleteUser

  };

})();

export default AdminService;

window.AdminService =
  AdminService;