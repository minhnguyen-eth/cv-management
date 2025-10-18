import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000"; // thêm /api vào luôn

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // luôn đọc mới nhất
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
