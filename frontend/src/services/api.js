import axios from "axios";

const api = axios.create({
  //   baseURL: "https://supportapi.riclbd.com/api",
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login") &&
      !error.config.url.includes("/brandbar")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  logout: () => api.post("/auth/logout"),
};

export const userService = {
  create: (data) => api.post("/users", data),
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, data) => api.patch(`/users/${id}/status`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.post(`/users/${id}/password`, data),
  uploadProfileImage: (id, formData) =>
    api.post(`/users/${id}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getBranches: (id) => api.get(`/users/${id}/branches`),
  updateBranches: (id, data) => api.put(`/users/${id}/branches`, data),
};

export const ticketService = {
  create: (data) => api.post("/tickets", data),
  getAll: (params) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  addReply: (id, data) => api.post(`/tickets/${id}/reply`, data),
  approve: (id, data) => api.post(`/tickets/${id}/approve`, data),
  reject: (id, data) => api.post(`/tickets/${id}/reject`, data),
  upload: (id, formData) =>
    api.post(`/tickets/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/tickets/${id}`),
};

export const dashboardService = {
  getBranchStats: () => api.get("/dashboard/branch-stats"),
  getStats: (params) => api.get("/dashboard/stats", { params }),
};

export const messageService = {
  getContacts: () => api.get("/messages/contacts"),
  getThread: (userId) => api.get(`/messages/thread/${userId}`),
  send: (data) =>
    api.post(
      "/messages",
      data,
      data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    ),
  markRead: (ids) => api.patch("/messages/read", { ids }),
  sendTyping: (data) => api.post("/messages/typing", data),
  getTypingStatus: (userId) => api.get(`/messages/typing/${userId}`),
  getUnreadCount: () => api.get("/messages/unread-count"),
};

export const lookupService = {
  getDepartments: () => api.get("/lookups/departments"),
  getBranches: () => api.get("/lookups/branches"),
  createBranch: (data) => api.post("/lookups/branches", data),
  updateBranch: (id, data) => api.put(`/lookups/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/lookups/branches/${id}`),
};

export const noticeService = {
  getAll: (page = 1, limit = 9) => {
    console.log("API call /notices with page:", page, "limit:", limit);
    return api.get("/notices", { params: { page, limit } });
  },
  getById: (id) => api.get(`/notices/${id}`),
  getLatest: () => api.get("/notices/latest"),
  create: (formData) =>
    api.post("/notices", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/notices/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/notices/${id}`),
  getPopupSetting: () => api.get("/notices/popup-setting"),
  setPopupSetting: (enabled) => api.post("/notices/popup-setting", { enabled }),
};

export const brandbarService = {
  getSettings: () => publicApi.get("/brandbar"),
  updateSettings: (formData) =>
    api.post("/brandbar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getWeather: (params) => publicApi.get("/brandbar/weather", params),
};

export const contactService = {
  getAll: () => api.get("/contacts"),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post("/contacts", data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export default api;
