import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Map role -> trang mặc định (khi bị chặn sẽ redirect về đây)
const DEFAULT_BY_ROLE = {
  0: "/dashboard/candidate",
  1: "/dashboard/employer",
  2: "/dashboard/sysadmin",
};

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  const user = rawUser ? JSON.parse(rawUser) : null;

  // Chưa đăng nhập → đẩy về /login, giữ lại where-to-go sau login
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = Number(user.is_admin ?? 0);

  // Không đúng quyền → đẩy về trang mặc định theo role hiện tại
  if (allowRoles.length && !allowRoles.includes(role)) {
    return <Navigate to={DEFAULT_BY_ROLE[role] || "/"} replace />;
  }

  return children;
}
