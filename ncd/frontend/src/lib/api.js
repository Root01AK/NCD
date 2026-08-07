// API Configuration
const API_BASE = "";  

export const api = {
  // Generic fetch wrapper
  request: async (endpoint, options = {}) => {
    // Retrieve the JWT token from localStorage
    const token = localStorage.getItem('ncd_token') || localStorage.getItem('icc_token') || "";

    const headers = {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('ncd_token');
        localStorage.removeItem('ncd_user');
        localStorage.removeItem('icc_token');
        localStorage.removeItem('icc_user');
        window.location.reload();
        throw new Error("Unauthorized");
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        if (!response.ok) throw new Error("An API error occurred");
        data = {};
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status} ${response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  get: (endpoint) => api.request(endpoint, { method: "GET" }),
  post: (endpoint, body) => api.request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) => api.request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => api.request(endpoint, { method: "DELETE" }),
};
