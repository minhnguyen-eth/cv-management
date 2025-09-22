// src/config.js
import axios from "axios";

const token = localStorage.getItem("token");

axios.defaults.baseURL = "http://127.0.0.1:8000"; // <-- thêm /api
axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
axios.defaults.headers.post["content-type"] = "application/x-www-form-urlencoded";

// Nếu backend chạy ở host/port khác, đổi dòng trên cho đúng
export default axios;
