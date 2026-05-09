const BillingService = (() => {

  const BASE_URL = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + '/api/billing';

  function getHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async function handleResponse(response) {
    if (response.status === 401) {
      // Potentially logout here, but let's just throw for the controller to handle
      throw new Error("Unauthorized or Session Expired");
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || data?.message || "An error occurred");
    }
    return data;
  }

  async function topUp(amount, method) {
    const response = await fetch(`${BASE_URL}/topup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, method })
    });
    return handleResponse(response);
  }

  async function deduct(amount, appointmentId = null) {
    const response = await fetch(`${BASE_URL}/deduct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, appointmentId })
    });
    return handleResponse(response);
  }

  async function getBalance() {
    const response = await fetch(`${BASE_URL}/balance`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }

  async function getTransactions() {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }

  async function getAllTransactions() {
    const response = await fetch(`${BASE_URL}/admin/transactions`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }

  return {
    topUp,
    deduct,
    getBalance,
    getTransactions,
    getAllTransactions
  };

})();

export default BillingService;
window.BillingService = BillingService;
