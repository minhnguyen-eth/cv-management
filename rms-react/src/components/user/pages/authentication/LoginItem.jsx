import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import github from "../../../../assets/images/github.svg";
import google from "../../../../assets/images/google.svg";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const LoginItem = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/login",
        { email, password }
      );

      // Lấy token từ nhiều format khác nhau cho chắc
      const token =
        res.data?.access_token ||
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.data?.access_token;

      if (!token) {
        console.error("Login response:", res.data);
        alert("Login trả về không có token. Kiểm tra API.");
        return;
      }

      // Lưu token + set default header cho axios
      localStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Lấy thông tin user để biết is_admin
      let user = res.data?.user || res.data?.data?.user || null;
      if (!user) {
        try {
          const me = await axios.get("http://127.0.0.1:8000/auth/me");
          user = me?.data?.user || me?.data || null;
        } catch (e) {
          console.error("Không lấy được /auth/me", e);
          alert("Không lấy được thông tin người dùng. Kiểm tra API /auth/me.");
          return;
        }
      }

      // Lưu user
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Điều hướng theo role
      const role = Number(user?.is_admin ?? 0);
      if (role === 2) navigate("/dashboard/sysadmin");
      else if (role === 1) navigate("/dashboard/employer");
      else navigate("/dashboard/candidate");

    } catch (err) {
      console.error(err);
      alert("Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu!");
    }
  };

  return (
    <section className="login">
      <div className="container">
        <div className="auth_div">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <div>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="user email"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="user password"
                  required
                />
              </div>
              <button type="submit" className="button">
                <span>Đăng nhập</span>
              </button>
              <div className="forgot">
                <Link to="/sign-up">Don't have any account?</Link>
                <Link to="/forgot-password">Forgot your password?</Link>
              </div>
              <div className="social">
                <img src={github} alt="github logo" />
                <img src={google} alt="google logo" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginItem;
