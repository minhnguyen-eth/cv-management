import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// CRA: .env -> REACT_APP_API_BASE=http://127.0.0.1:8000 (hoặc /rms-api/public)
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

const SignUpItem = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    role: "0", // "0" = Ứng viên, "1" = Nhà tuyển dụng

    // Trường của Ứng viên
    full_name: "",
    dob: "",
    address: "",
    phone: "",

    // Trường của Nhà tuyển dụng
    company_name: "",
    company_address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Khi đổi tư cách, dọn field của tư cách kia cho sạch
  useEffect(() => {
    setFieldErrors({});
    if (form.role === "1") {
      // chọn Nhà tuyển dụng
      setForm((f) => ({
        ...f,
        full_name: "",
        dob: "",
        address: "",
      }));
    } else {
      // chọn Ứng viên
      setForm((f) => ({
        ...f,
        company_name: "",
        company_address: "",
      }));
    }
  }, [form.role]);

  const validateClient = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Vui lòng nhập email";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    if (form.password && form.password.length < 6)
      errs.password = "Mật khẩu phải từ 6 ký tự";
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = "Xác nhận mật khẩu không khớp";

    if (form.role !== "0" && form.role !== "1")
      errs.role = "Vui lòng chọn tư cách hợp lệ";

    if (form.role === "1") {
      // Nhà tuyển dụng
      if (!form.company_name.trim())
        errs.company_name = "Vui lòng nhập tên công ty";
    } else {
      // Ứng viên
      if (!form.full_name.trim())
        errs.full_name = "Vui lòng nhập họ tên ứng viên";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!validateClient()) return;

    setLoading(true);
    try {
      const body =
        form.role === "1"
          ? {
              // Employer
              email: form.email.trim(),
              password: form.password,
              password_confirmation: form.password_confirmation,
              role: 1,
              company_name: form.company_name.trim(),
              company_address: form.company_address.trim() || null,
              phone: form.phone.trim() || null,
            }
          : {
              // Candidate
              email: form.email.trim(),
              password: form.password,
              password_confirmation: form.password_confirmation,
              role: 0,
              full_name: form.full_name.trim(),
              dob: form.dob || null,
              address: form.address.trim() || null,
              phone: form.phone.trim() || null,
            };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await res.json();

      if (!res.ok || payload?.status === false) {
        // Laravel có thể trả errors dạng object { field: [msg] }
        const errs = payload?.errors || payload;
        if (errs && typeof errs === "object") {
          // chuẩn hoá message nếu là mảng
          const flat = {};
          Object.keys(errs).forEach((k) => {
            const v = errs[k];
            flat[k] = Array.isArray(v) ? v.join(", ") : String(v);
          });
          setFieldErrors(flat);
        } else {
          setError(payload?.message || "Đăng ký thất bại");
        }
        return;
      }

      // (tuỳ chọn) lưu token/user nếu BE trả về
      if (payload?.data?.token) localStorage.setItem("token", payload.data.token);
      if (payload?.data?.user)
        localStorage.setItem("user", JSON.stringify(payload.data.user));

      setSuccess("Đăng ký tài khoản thành công");
      // reset form
      setForm({
        email: "",
        password: "",
        password_confirmation: "",
        role: "0",
        full_name: "",
        dob: "",
        address: "",
        phone: "",
        company_name: "",
        company_address: "",
      });
    } catch (err) {
      setError("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div className="container">
        <div className="auth_div">
          {/* <h2 style={{ textAlign: "center", marginBottom: 12 }}>Đăng ký</h2> */}

          <form onSubmit={onSubmit}>
            <div className="form">
              {success && (
                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                  Đăng ký tài khoản thành công — <Link to="/login">Đăng nhập ngay</Link>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}

              {/* Tư cách */}
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 6 }}>
                  Đăng ký với tư cách
                </label>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="radio"
                      name="role"
                      value="0"
                      checked={form.role === "0"}
                      onChange={onChange}
                    />
                    Ứng viên
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="radio"
                      name="role"
                      value="1"
                      checked={form.role === "1"}
                      onChange={onChange}
                    />
                    Nhà tuyển dụng
                  </label>
                </div>
                {fieldErrors.role && (
                  <small className="text-danger">{fieldErrors.role}</small>
                )}
              </div>

              {/* Email + Mật khẩu */}
              <div>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                />
                {fieldErrors.email && (
                  <small className="text-danger">{fieldErrors.email}</small>
                )}
              </div>

              <div>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={onChange}
                />
                {fieldErrors.password && (
                  <small className="text-danger">{fieldErrors.password}</small>
                )}
              </div>

              <div>
                <input
                  type="password"
                  className="form-control"
                  name="password_confirmation"
                  placeholder="Xác nhận mật khẩu"
                  value={form.password_confirmation}
                  onChange={onChange}
                />
                {fieldErrors.password_confirmation && (
                  <small className="text-danger">
                    {fieldErrors.password_confirmation}
                  </small>
                )}
              </div>

              {/* Khối field theo tư cách */}
              {form.role === "1" ? (
                <>
                  {/* Nhà tuyển dụng */}
                  <div>
                    <input
                      className="form-control"
                      name="company_name"
                      placeholder="Tên công ty"
                      value={form.company_name}
                      onChange={onChange}
                    />
                    {fieldErrors.company_name && (
                      <small className="text-danger">{fieldErrors.company_name}</small>
                    )}
                  </div>
                  <div>
                    <input
                      className="form-control"
                      name="company_address"
                      placeholder="Địa chỉ công ty"
                      value={form.company_address}
                      onChange={onChange}
                    />
                    {fieldErrors.company_address && (
                      <small className="text-danger">{fieldErrors.company_address}</small>
                    )}
                  </div>
                  <div>
                    <input
                      className="form-control"
                      name="phone"
                      placeholder="Số điện thoại"
                      value={form.phone}
                      onChange={onChange}
                    />
                    {fieldErrors.phone && (
                      <small className="text-danger">{fieldErrors.phone}</small>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Ứng viên */}
                  <div>
                    <input
                      className="form-control"
                      name="full_name"
                      placeholder="Họ tên ứng viên"
                      value={form.full_name}
                      onChange={onChange}
                    />
                    {fieldErrors.full_name && (
                      <small className="text-danger">{fieldErrors.full_name}</small>
                    )}
                  </div>
                  <div>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      placeholder="Ngày sinh"
                      value={form.dob}
                      onChange={onChange}
                    />
                    {fieldErrors.dob && (
                      <small className="text-danger">{fieldErrors.dob}</small>
                    )}
                  </div>
                  <div>
                    <input
                      className="form-control"
                      name="address"
                      placeholder="Địa chỉ"
                      value={form.address}
                      onChange={onChange}
                    />
                    {fieldErrors.address && (
                      <small className="text-danger">{fieldErrors.address}</small>
                    )}
                  </div>
                  <div>
                    <input
                      className="form-control"
                      name="phone"
                      placeholder="Số điện thoại"
                      value={form.phone}
                      onChange={onChange}
                    />
                    {fieldErrors.phone && (
                      <small className="text-danger">{fieldErrors.phone}</small>
                    )}
                  </div>
                </>
              )}

              <button
                className="button"
                type="submit"
                disabled={loading}
                style={{ marginTop: 12 }}
              >
                <div>
                  <span>{loading ? "Đang đăng ký..." : "Đăng ký"}</span>
                </div>
              </button>

              <div className="forgot" style={{ marginTop: 8 }}>
                <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpItem;
