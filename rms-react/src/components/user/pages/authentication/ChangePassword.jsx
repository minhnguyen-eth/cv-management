import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../../../services/Loader";
import Footer from "../../footer/Footer";
import NavBar from "../navigation/NavBar";

// Trang đổi mật khẩu KHÔNG cần đăng nhập.
// Lấy email (đÃ MÃ HÓA) và token từ query string rồi gọi API reset-password.
const ChangePassword = () => {
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // Lưu ý: backend gửi email ĐÃ MÃ HÓA (Crypt::encryptString) + token thường
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(""); // success
  const [error, setError] = useState("");     // error

  useEffect(() => {
    const t = setTimeout(() => setLoader(false), 300);
    return () => clearTimeout(t);
  }, []);

  const isLinkValid = useMemo(() => Boolean(email && token), [email, token]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const isMatch = useMemo(() => password && password === passwordConfirmation, [password, passwordConfirmation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isLinkValid) {
      setError("Liên kết không hợp lệ hoặc thiếu tham số.");
      return;
    }
    if (!isPasswordValid) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (!isMatch) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      // GỌI API reset-password (public)
      const url = "http://127.0.0.1:8000/auth/reset-password";
      const res = await axios.post(
        url,
        {
          email,     // email đã mã hóa
          token,     // token plain
          password,
          password_confirmation: passwordConfirmation,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const msg = res?.data?.message || "Đổi mật khẩu thành công.";
      setMessage(msg);
      setPassword("");
      setPasswordConfirmation("");

      // Tuỳ chọn: điều hướng về login sau vài giây
      // setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const res = err?.response;
      const firstError =
        res?.data?.errors?.password?.[0] ||
        res?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";
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
          <NavBar hero="Change Password" cmp="auth" />
          <section className="login">
            <div className="container">
              <div className="auth_div">
                <form onSubmit={handleSubmit}>
                  <div className="form">

                    {!isLinkValid && (
                      <div className="mt-2">
                        <small className="text-danger">
                          Liên kết không hợp lệ. Hãy mở lại link từ email "Quên mật khẩu".
                        </small>
                      </div>
                    )}

                    <div>
                      <label className="mb-1">Mật khẩu mới</label>
                      <div className="password-field" style={{ position: "relative" }}>
                        <input
                          type={showPw ? "text" : "password"}
                          className="form-control"
                          name="password"
                          placeholder="Mật khẩu mới (≥ 6 ký tự)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="btn-eye"
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {!isPasswordValid && password.length > 0 && (
                        <small className="text-danger">Tối thiểu 6 ký tự</small>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className="mb-1">Xác nhận mật khẩu</label>
                      <div className="password-field" style={{ position: "relative" }}>
                        <input
                          type={showPw2 ? "text" : "password"}
                          className="form-control"
                          name="password_confirmation"
                          placeholder="Nhập lại mật khẩu"
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw2((v) => !v)}
                          className="btn-eye"
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPw2 ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {passwordConfirmation.length > 0 && !isMatch && (
                        <small className="text-danger">Không khớp với mật khẩu mới</small>
                      )}
                    </div>

                    <button
                      className="button mt-3"
                      type="submit"
                      disabled={submitting || !isLinkValid || !isPasswordValid || !isMatch}
                      style={{ opacity: submitting || !isLinkValid || !isPasswordValid || !isMatch ? 0.6 : 1 }}
                    >
                      <div>
                        <span>{submitting ? "Đang đổi..." : "Đổi mật khẩu"}</span>
                      </div>
                    </button>

                    {message && (
                      <div className="mt-2">
                        <small className="text-success">{message}</small>{" "}
                        <Link to="/login">Đăng nhập</Link>
                      </div>
                    )}
                    {error && (
                      <div className="mt-2">
                        <small className="text-danger">{error}</small>
                      </div>
                    )}

                    <div className="forgot mt-3">
                      <Link to="/forgot-password">Quên mật khẩu?</Link>
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

export default ChangePassword;
