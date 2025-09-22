// src/components/user/pages/Dashboard.jsx (Admin view with desktop+mobile toggleable sidebar + Jobs CRUD)
import React, { useEffect, useMemo, useState } from "react";
import api from "../../../config";
import { useNavigate } from "react-router-dom";

// ———————————————————————————————————————————
// Helpers
// ———————————————————————————————————————————
const Card = ({ title, value, sub }) => (
  <div className="dash-card">
    <div className="dash-card-title">{title}</div>
    <div className="dash-card-value">{value}</div>
    {sub ? <div className="dash-card-sub">{sub}</div> : null}
  </div>
);

// Chuẩn hoá {data:[...]} | [...] | {items:[...]} | {result:[...]} | string(JSON)
function normalizeList(res) {
  let d = res?.data;
  if (typeof d === "string") {
    try { d = JSON.parse(d); } catch { return []; }
  }
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

// ———————————————————————————————————————————
// Main Admin Dashboard with left sidebar + hamburger
// ———————————————————————————————————————————
const Dashboard = () => {
  const navigate = useNavigate();

  // Top KPI (dùng tạm từ APIs cũ của bạn)
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);

  // Sidebar state
  const [activeTab, setActiveTab] = useState("departments"); // mặc định mở Phòng ban
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop mặc định mở, mobile sẽ ẩn bằng CSS

  // Khởi tạo theo kích thước màn hình: mobile -> đóng, desktop -> mở
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      setSidebarOpen(!isMobile);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catRes, appRes] = await Promise.allSettled([
          api.get("/categories"),
          api.get("/applications"),
        ]);

        // CATEGORIES
        if (catRes.status === "fulfilled") {
          const list = normalizeList(catRes.value);
          alive && setCategories(list);
        } else {
          alive && setCategories([]);
          alive && setErrorMsg((s) => s || "Không tải được categories.");
        }

        // APPLICATIONS
        if (appRes.status === "fulfilled") {
          const list = normalizeList(appRes.value);
          alive && setApplications(list);
        } else {
          alive && setApplications([]);
          alive && setErrorMsg((s) => s || "Không tải được applications.");
        }
      } catch (e) {
        alive && setErrorMsg("Có lỗi khi tải dữ liệu.");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // Đóng sidebar khi chọn menu ở mobile
  const handleNav = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="admin-wrap">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="brand">
          {/* Nút 3 gạch để ẩn/hiện sidebar trên desktop + mobile */}
          <button className="hamburger" onClick={() => setSidebarOpen((s) => !s)} aria-label="Toggle sidebar">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
          <span className="brand-text">Recruitment Manager — Admin</span>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate("/profile")}>Profile</button>
          <button className="btn danger" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      {/* Overlay chỉ hiện trên mobile khi sidebar mở */}
      <div className={`sb-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Body: sidebar + content */}
      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="sb-section">Quản trị</div>
          <SidebarItem label="Tổng quan" active={activeTab === "overview"} onClick={() => handleNav("overview")} />
          <SidebarItem label="Phòng ban" active={activeTab === "departments"} onClick={() => handleNav("departments")} />
          {/* NEW: Vị trí tuyển dụng */}
          <SidebarItem label="Vị trí tuyển dụng" active={activeTab === "jobs"} onClick={() => handleNav("jobs")} />
          <SidebarItem label="Bài đăng" active={activeTab === "posts"} onClick={() => handleNav("posts")} />
          <SidebarItem label="Ứng tuyển" active={activeTab === "applications"} onClick={() => handleNav("applications")} />
          <SidebarItem label="Cài đặt" active={activeTab === "settings"} onClick={() => handleNav("settings")} />
        </aside>

        <main className={`admin-content ${sidebarOpen ? "with-sidebar" : "full"}`}>
          {errorMsg && <div className="alert">{errorMsg}</div>}

          {/* Overview giữ nguyên từ dashboard cũ để có KPI */}
          {activeTab === "overview" && (
            <>
              {loading ? (
                <div style={{ padding: 24 }}>Đang tải dashboard...</div>
              ) : (
                <>
                  <section className="grid">
                    <Card title="Tổng Categories" value={categories.length} />
                    <Card title="Tổng đơn ứng tuyển" value={applications.length} />
                    <Card title="API health" value={errorMsg ? "Lỗi" : "OK"} sub={errorMsg ? "Xem Console để biết chi tiết" : "Kết nối thành công"} />
                  </section>

                  <section className="panel">
                    <div className="panel-title">Đơn ứng tuyển gần đây</div>
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Ứng viên</th>
                            <th>Vị trí / Job</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(applications || []).slice(0, 10).map((item, idx) => (
                            <tr key={item?.id ?? idx}>
                              <td>{idx + 1}</td>
                              <td>{item?.name ?? item?.email ?? "-"}</td>
                              <td>{item?.job?.title ?? item?.job_title ?? item?.title ?? "-"}</td>
                              <td>{item?.status ?? "-"}</td>
                              <td>{item?.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
                            </tr>
                          ))}
                          {applications.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: "center" }}>Chưa có dữ liệu</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          {/* ———————————— MODULE: DEPARTMENTS ———————————— */}
          {activeTab === "departments" && <DepartmentsModule />}

          {/* ———————————— MODULE: JOBS ———————————— */}
          {activeTab === "jobs" && <JobsModule />}

          {/* Placeholders cho các mục khác */}
          {activeTab === "posts" && <Placeholder label="Bài đăng" />}
          {activeTab === "applications" && <Placeholder label="Ứng tuyển" />}
          {activeTab === "settings" && <Placeholder label="Cài đặt" />}
        </main>
      </div>

      {/* Styles */}
      <style>{`
        .admin-wrap{min-height:100vh;background:#f9fafb;color:#111827;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
        .admin-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e5e7eb;background:#fff;position:sticky;top:0;z-index:50;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .brand{display:flex;align-items:center;gap:10px}
        .brand-text{font-weight:700;font-size:20px;color:#047857}

        /* Hamburger */
        .hamburger{display:inline-flex;flex-direction:column;gap:3px;background:none;border:none;padding:6px;cursor:pointer}
        .hamburger .bar{width:20px;height:2px;background:#111827;border-radius:2px;display:block}

        .actions .btn{margin-left:8px;padding:8px 14px;border:1px solid #047857;background:#fff;color:#047857;border-radius:8px;cursor:pointer;font-weight:500}
        .actions .btn:hover{background:#047857;color:#fff}
        .actions .btn.danger{border-color:#dc2626;color:#dc2626}
        .actions .btn.danger:hover{background:#dc2626;color:#fff}

        .admin-body{display:flex;gap:0}

        /* Sidebar (desktop) */
        .admin-sidebar{width:240px;min-height:calc(100vh - 64px);background:#fff;border-right:1px solid #e5e7eb;padding:12px;position:sticky;top:64px;transition:transform .25s ease, opacity .2s ease}
        .admin-sidebar.collapsed{display:none}
        .sb-section{font-size:12px;color:#6b7280;margin:8px 8px 6px}
        .sb-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;cursor:pointer;color:#374151;border:1px solid transparent}
        .sb-item:hover{background:#f3f4f6}
        .sb-item.active{background:#0478570d;color:#065f46;border-color:#04785733}

        /* Overlay for mobile */
        .sb-overlay{display:none}
        .sb-overlay.show{display:none}

        /* Mobile behavior: sidebar ẩn mặc định, trượt từ trái vào */
        @media(max-width:768px){
          .admin-body{position:relative}
          .admin-sidebar{position:fixed;top:64px;left:0;height:calc(100vh - 64px);z-index:40;transform:translateX(-100%)}
          .admin-sidebar.open{transform:translateX(0)}
          .admin-sidebar.collapsed{transform:translateX(-100%);display:block}
          .sb-overlay{display:block;position:fixed;inset:0;top:64px;background:rgba(0,0,0,.35);backdrop-filter:saturate(100%) blur(2px);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s ease}
          .sb-overlay.show{opacity:1;pointer-events:auto}
        }

        /* Content */
        .admin-content{flex:1;padding:24px;max-width:1100px}
        .admin-content.full{max-width:unset}
        .alert{background:#fee2e2;border:1px solid #ef4444;color:#b91c1c;padding:12px;border-radius:8px;margin-bottom:16px}

        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
        .dash-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .dash-card-title{color:#6b7280;font-size:13px;margin-bottom:6px}
        .dash-card-value{font-size:26px;font-weight:700;color:#047857}
        .dash-card-sub{color:#6b7280;margin-top:6px}

        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .panel-title{font-weight:600;margin-bottom:12px;font-size:16px}
        .table-wrap{overflow:auto}
        .table{width:100%;border-collapse:collapse;background:#fff}
        .table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left;font-size:14px}
        .table th{color:#374151;font-weight:600;background:#f3f4f6}

        /* Shared UI (toolbar, modal, etc.) */
        .toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:12px}
        .left{display:flex;gap:8px;align-items:center}
        .search{padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;min-width:240px}
        .btn-primary{background:#047857;color:#fff;border:1px solid #047857;padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:600}
        .btn-primary:hover{background:#065f46;border-color:#065f46}
        .btn-outline{background:#fff;color:#374151;border:1px solid #e5e7eb;padding:8px 12px;border-radius:10px;cursor:pointer}
        .btn-outline:hover{background:#f3f4f6}
        .btn-danger{background:#fff;color:#dc2626;border:1px solid #fecaca;padding:8px 12px;border-radius:10px;cursor:pointer}
        .btn-danger:hover{background:#fee2e2}

        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:50}
        .modal{width:100%;max-width:640px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.15)}
        .modal-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb}
        .modal-ct{padding:16px}
        .field{margin-bottom:12px}
        .label{font-size:13px;color:#374151;margin-bottom:6px}
        .input,.select,.textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px}
        .textarea{min-height:100px}
      `}</style>
    </div>
  );
};

// ———————————————————————————————————————————
// Sidebar item
// ———————————————————————————————————————————
function SidebarItem({ label, active, onClick }) {
  return (
    <div className={`sb-item ${active ? "active" : ""}`} onClick={onClick}>
      <span>{label}</span>
    </div>
  );
}

// ———————————————————————————————————————————
// Departments Module (CRUD cơ bản)
// ———————————————————————————————————————————
function DepartmentsModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(
    () => items.filter((d) => (d?.name || "").toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  async function fetchList() {
    setLoading(true); setError("");
    try {
      const res = await api.get("/departments"); // đổi path nếu backend bạn dùng /api/departments
      const list = normalizeList(res);
      setItems(list);
    } catch (e) {
      setError("Không tải được danh sách phòng ban.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function upsert(payload) {
    try {
      if (payload?.id) await api.put(`/departments/${payload.id}`, payload);
      else await api.post(`/departments`, payload);
      await fetchList();
    } catch (e) {
      alert("Lưu thất bại. Kiểm tra API.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Xoá phòng ban này?")) return;
    try {
      await api.delete(`/departments/${id}`);
      await fetchList();
    } catch (e) {
      alert("Xoá thất bại. Kiểm tra API.");
    }
  }

  useEffect(() => { fetchList(); }, []);
  useEffect(() => setPage(1), [query]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="left">
            <input
              className="search"
              placeholder="Tìm phòng ban..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <button
              className="btn-primary"
              onClick={() => { setEditing(null); setModalOpen(true); }}
            >
              + Thêm phòng ban
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên phòng ban</th>
                <th>Mô tả</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign:"center", padding:16 }}>Đang tải...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} style={{ color:"#b91c1c", textAlign:"center", padding:16 }}>{error}</td>
                </tr>
              )}
              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign:"center", padding:16 }}>Không có dữ liệu</td>
                </tr>
              )}
              {paginated.map((d, idx) => (
                <tr key={d.id || idx}>
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td style={{ fontWeight:600 }}>{d.name}</td>
                  <td>{d.description || "—"}</td>
                  <td style={{ textAlign:"right" }}>
                    <button className="btn-outline" onClick={() => { setEditing(d); setModalOpen(true); }}>Sửa</button>
                    <span style={{ display:"inline-block", width:8 }} />
                    <button className="btn-danger" onClick={() => remove(d.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12 }}>
            <div style={{ color:"#6b7280", fontSize:14 }}>
              Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button>
              <button className="btn-outline" disabled={page * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Update */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <div style={{ fontWeight: 600 }}>{editing ? "Cập nhật phòng ban" : "Thêm phòng ban"}</div>
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Đóng</button>
            </div>
            <div className="modal-ct">
              <DeptForm
                initial={editing}
                onCancel={() => setModalOpen(false)}
                onSubmit={async (payload) => { await upsert(payload); setModalOpen(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeptForm({ initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Tên phòng ban không được để trống");
    setSubmitting(true);
    try {
      await onSubmit({ id: initial?.id, name: name.trim(), description: description.trim() });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <div className="label">Tên phòng ban <span style={{ color: "#dc2626" }}>*</span></div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Kỹ thuật" />
      </div>

      <div className="field">
        <div className="label">Mô tả</div>
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về chức năng phòng ban" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn-outline" onClick={onCancel}>Hủy</button>
        <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Đang lưu..." : (initial?.id ? "Cập nhật" : "Lưu")}</button>
      </div>
    </form>
  );
}

// ———————————————————————————————————————————
// Jobs Module (CRUD)
// ———————————————————————————————————————————
function JobsModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((j) =>
      (j?.title || "").toLowerCase().includes(q) ||
      (j?.location || "").toLowerCase().includes(q) ||
      (j?.department?.name || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  async function fetchDeps() {
    try {
      const res = await api.get("/departments");
      setDepartments(normalizeList(res));
    } catch {
      // bỏ qua, form sẽ hiển thị "— Chọn phòng ban —"
    }
  }

  async function fetchJobs() {
    setLoading(true); setError("");
    try {
      const res = await api.get("/jobs"); // đổi path nếu backend bạn dùng /api/jobs
      setItems(normalizeList(res));
    } catch (e) {
      setItems([]);
      setError("Không tải được danh sách vị trí tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }

  async function upsert(payload) {
    try {
      if (payload?.id) await api.put(`/jobs/${payload.id}`, payload);
      else await api.post(`/jobs`, payload);
      await fetchJobs();
    } catch (e) {
      alert("Lưu thất bại. Kiểm tra API.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Xoá vị trí này?")) return;
    try { await api.delete(`/jobs/${id}`); await fetchJobs(); }
    catch (e) { alert("Xoá thất bại. Kiểm tra API."); }
  }

  useEffect(() => { fetchDeps(); fetchJobs(); }, []);
  useEffect(() => setPage(1), [query]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="left">
            <input className="search" placeholder="Tìm theo tên vị trí, địa điểm, phòng ban..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>+ Thêm vị trí</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên vị trí</th>
                <th>Phòng ban</th>
                <th>Địa điểm</th>
                <th>Loại hình</th>
                <th>Trạng thái</th>
                <th>Lương</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign:"center", padding:16 }}>Đang tải...</td></tr>}
              {!loading && error && <tr><td colSpan={8} style={{ color:"#b91c1c", textAlign:"center", padding:16 }}>{error}</td></tr>}
              {!loading && !error && paginated.length === 0 && <tr><td colSpan={8} style={{ textAlign:"center", padding:16 }}>Không có dữ liệu</td></tr>}
              {paginated.map((j, idx) => (
                <tr key={j.id || idx}>
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td style={{ fontWeight:600 }}>{j.title}</td>
                  <td>{j.department?.name || "—"}</td>
                  <td>{j.location || "—"}</td>
                  <td>{j.type || "—"}</td>
                  <td>{j.status || "Open"}</td>
                  <td>
                    {(j.salary_min || j.salary_max)
                      ? `${j.salary_min ? Number(j.salary_min).toLocaleString() : "?"} - ${j.salary_max ? Number(j.salary_max).toLocaleString() : "?"}`
                      : "—"}
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <button className="btn-outline" onClick={() => { setEditing(j); setModalOpen(true); }}>Sửa</button>
                    <span style={{ display:"inline-block", width:8 }} />
                    <button className="btn-danger" onClick={() => remove(j.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12 }}>
            <div style={{ color:"#6b7280", fontSize:14 }}>
              Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button>
              <button className="btn-outline" disabled={page * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Update */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <div style={{ fontWeight: 600 }}>{editing ? "Cập nhật vị trí" : "Thêm vị trí"}</div>
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Đóng</button>
            </div>
            <div className="modal-ct">
              <JobForm
                initial={editing}
                departments={departments}
                onCancel={() => setModalOpen(false)}
                onSubmit={async (payload) => { await upsert(payload); setModalOpen(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobForm({ initial, departments, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [departmentId, setDepartmentId] = useState(initial?.department_id || initial?.department?.id || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [type, setType] = useState(initial?.type || "Full-time");
  const [status, setStatus] = useState(initial?.status || "Open");
  const [salaryMin, setSalaryMin] = useState(initial?.salary_min ?? "");
  const [salaryMax, setSalaryMax] = useState(initial?.salary_max ?? "");
  const [description, setDescription] = useState(initial?.description || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Tên vị trí không được để trống");
    if (!departmentId) return alert("Vui lòng chọn phòng ban");
    if (salaryMin !== "" && salaryMax !== "" && Number(salaryMin) > Number(salaryMax)) {
      return alert("Lương tối thiểu không được lớn hơn lương tối đa");
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: initial?.id,
        title: title.trim(),
        department_id: Number(departmentId),
        location: location.trim(),
        type,
        status,
        salary_min: salaryMin === "" ? null : Number(salaryMin),
        salary_max: salaryMax === "" ? null : Number(salaryMax),
        description: description.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <div className="label">Tên vị trí <span style={{ color:"#dc2626" }}>*</span></div>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Frontend Engineer" />
      </div>

      <div className="field">
        <div className="label">Phòng ban <span style={{ color:"#dc2626" }}>*</span></div>
        <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">— Chọn phòng ban —</option>
          {(departments || []).map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="field" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div className="label">Địa điểm</div>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Hà Nội / HCM / Remote" />
        </div>
        <div>
          <div className="label">Loại hình</div>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Intern</option>
            <option>Contract</option>
          </select>
        </div>
      </div>

      <div className="field" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div className="label">Trạng thái</div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>
        <div>
          <div className="label">Lương (Min - Max)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <input className="input" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min" />
            <input className="input" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max" />
          </div>
        </div>
      </div>

      <div className="field">
        <div className="label">Mô tả</div>
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả công việc, yêu cầu, quyền lợi..." />
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <button type="button" className="btn-outline" onClick={onCancel}>Hủy</button>
        <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Đang lưu..." : (initial?.id ? "Cập nhật" : "Lưu")}</button>
      </div>
    </form>
  );
}

function Placeholder({ label }) {
  return (
    <div className="panel" style={{ textAlign: "center", color: "#6b7280" }}>
      Mục <b>{label}</b> sẽ được bổ sung sau.
    </div>
  );
}

export default Dashboard;
