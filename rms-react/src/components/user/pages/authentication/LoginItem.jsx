import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import github from "../../../../assets/images/github.svg";
import google from "../../../../assets/images/google.svg";

const LoginItem = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Save token
      localStorage.setItem("token", res.data.access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;

      navigate("/dashboard");
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
