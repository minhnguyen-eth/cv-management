import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // dùng axios trực tiếp, không động đến file config của bạn
import Loader from "../../../../services/Loader";
import Footer from "../../footer/Footer";
import NavBar from "../navigation/NavBar";

const ForgotPassword = () => {
  const [loader, setLoader] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");  // thông báo thành công
  const [error, setError] = useState("");      // thông báo lỗi

  useEffect(() => {
    const t = setTimeout(() => setLoader(false), 300);
    return () => clearTimeout(t);
  }, []);

  const isEmailValid = useMemo(() => {
    // check đơn giản
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isEmailValid) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setSubmitting(true);
      // GỌI API ĐÚNG ROUTE (baseURL của bạn giữ nguyên là http://127.0.0.1:8000)
      const url = "http://127.0.0.1:8000/auth/forgot-password";
      await axios.post(
        url,
        { email },
        { headers: { "Content-Type": "application/json" } } // override để gửi JSON
      );
      setMessage("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
      setEmail("");
    } catch (err) {
      // bắt lỗi hợp lệ từ backend
      const res = err?.response;
      const firstError =
        res?.data?.errors?.email?.[0] ||
        res?.data?.message ||
        "Gửi email thất bại. Vui lòng thử lại.";
      setError(firstError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <NavBar hero="Forgot Password" cmp="auth" />
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {!isEmailValid && email.length > 0 && (
                        <small className="text-danger">Email không hợp lệ</small>
                      )}
                    </div>

                    <button
                      className="button"
                      type="submit"
                      disabled={submitting || !isEmailValid}
                      style={{ opacity: submitting || !isEmailValid ? 0.6 : 1 }}
                    >
                      <div>
                        <span>{submitting ? "Đang gửi..." : "Submit"}</span>
                      </div>
                    </button>

                    {message && (
                      <div className="mt-2">
                        <small className="text-success">{message}</small>
                      </div>
                    )}
                    {error && (
                      <div className="mt-2">
                        <small className="text-danger">{error}</small>
                      </div>
                    )}

                    <div className="forgot">
                      <Link to="/login">Login from here</Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
};

export default ForgotPassword;
