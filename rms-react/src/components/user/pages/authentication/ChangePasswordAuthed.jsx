import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../config"; // axios instance có gắn Authorization

export default function ChangePasswordAuthed() {
  const navigate = useNavigate();
  const [old_password, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const validLen = password.length >= 6;
  const match = password && password === password_confirmation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!validLen) return setErr("Mật khẩu mới tối thiểu 6 ký tự.");
    if (!match)   return setErr("Xác nhận mật khẩu không khớp.");

    try {
      setSubmitting(true);
      // Backend của bạn đã có AuthController::changePassword (yêu cầu JWT)
      const res = await api.post("/auth/change-password", {
        old_password,
        password,
        password_confirmation,
      });
      setMsg(res?.data?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      // (Tuỳ chọn) Xoá token & điều hướng về login
      // localStorage.removeItem("token");
      // setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const r = error?.response;
      const first =
        r?.data?.errors?.old_password?.[0] ||
        r?.data?.errors?.password?.[0] ||
        r?.data?.message ||
        "Đổi mật khẩu thất bại.";
      setErr(first);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login" style={{ padding: "32px 0" }}>
      <div className="container">
        <div className="auth_div">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <h3 style={{ textAlign: "center", marginBottom: 12 }}>Đổi mật khẩu</h3>

              {msg && <small className="text-success" style={{ display: "block", marginBottom: 8 }}>{msg}</small>}
              {err && <small className="text-danger" style={{ display: "block", marginBottom: 8 }}>{err}</small>}

              {/* Mật khẩu cũ */}
              <div>
                <label className="mb-1">Mật khẩu hiện tại</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showOld ? "text" : "password"}
                    className="form-control"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={old_password}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="btn-eye"
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer" }}
                    aria-label={showOld ? "Ẩn" : "Hiện"}
                  >
                    {showOld ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className="mt-2">
                <label className="mb-1">Mật khẩu mới (≥ 6 ký tự)</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    className="form-control"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="btn-eye"
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer" }}
                    aria-label={showNew ? "Ẩn" : "Hiện"}
                  >
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {!validLen && password.length > 0 && (
                  <small className="text-danger">Tối thiểu 6 ký tự</small>
                )}
              </div>

              {/* Xác nhận */}
              <div className="mt-2">
                <label className="mb-1">Xác nhận mật khẩu mới</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew2 ? "text" : "password"}
                    className="form-control"
                    placeholder="Nhập lại mật khẩu mới"
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew2((v) => !v)}
                    className="btn-eye"
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer" }}
                    aria-label={showNew2 ? "Ẩn" : "Hiện"}
                  >
                    {showNew2 ? "🙈" : "👁️"}
                  </button>
                </div>
                {password_confirmation.length > 0 && !match && (
                  <small className="text-danger">Không khớp với mật khẩu mới</small>
                )}
              </div>

              <button
                className="button mt-3"
                type="submit"
                disabled={submitting || !validLen || !match}
                style={{ opacity: submitting || !validLen || !match ? 0.6 : 1 }}
              >
                <div><span>{submitting ? "Đang đổi..." : "ĐỔI MẬT KHẨU"}</span></div>
              </button>

              <div className="forgot mt-3">
                <button
                  type="button"
                  className="link"
                  onClick={() => navigate("/forgot-password")}
                  style={{ background: "transparent", border: 0, color: "#3b82f6", cursor: "pointer" }}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
