// src/components/dashboard/Employer.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../config";
import { useNavigate } from "react-router-dom";

/* --------------------------------- Helpers -------------------------------- */
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

/* ------------------------------ Main Employer ----------------------------- */
const Employer = () => {
  const navigate = useNavigate();

  // Top KPI
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);

  // Sidebar state
  const [activeTab, setActiveTab] = useState("departments");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // User (avatar)
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch {}
  const displayName = user?.full_name || user?.name || "User";
  const avatarUrl  = user?.avatar || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      setSidebarOpen(!isMobile);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // Cho KPI
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catRes, appRes] = await Promise.allSettled([
          api.get("/categories"),
          api.get("/applications"),
        ]);
        if (catRes.status === "fulfilled") {
          const list = normalizeList(catRes.value);
          alive && setCategories(list);
        } else {
          alive && setCategories([]);
          alive && setErrorMsg((s) => s || "Không tải được categories.");
        }
        if (appRes.status === "fulfilled") {
          const list = normalizeList(appRes.value);
          alive && setApplications(list);
        } else {
          alive && setApplications([]);
          alive && setErrorMsg((s) => s || "Không tải được applications.");
        }
      } catch {
        alive && setErrorMsg("Có lỗi khi tải dữ liệu.");
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Cho phép JobsModule mở thẳng tab Ứng tuyển
  useEffect(() => {
    const goApps = () => setActiveTab("applications");
    window.addEventListener("go-applications", goApps);
    return () => window.removeEventListener("go-applications", goApps);
  }, []);

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="admin-wrap">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="brand">
          <button className="hamburger" onClick={() => setSidebarOpen((s) => !s)} aria-label="Toggle sidebar">
            <span className="bar" /><span className="bar" /><span className="bar" />
          </button>
          <span className="brand-text">Recruitment Manager — Employer</span>
        </div>

        <div className="actions">
          {/* Avatar chỉ hiển thị ảnh, không dropdown */}
          <div className="user-menu">
            <button className="avatar-btn" aria-label="Avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <span className="avatar-fallback">
                  {(displayName || "U").slice(0,1).toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay mobile */}
      <div className={`sb-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Body */}
      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="sb-section">Quản trị</div>
          <SidebarItem label="Tổng quan"         active={activeTab === "overview"}      onClick={() => handleNav("overview")} />
          <SidebarItem label="Phòng ban"         active={activeTab === "departments"}   onClick={() => handleNav("departments")} />
          <SidebarItem label="Vị trí tuyển dụng" active={activeTab === "jobs"}          onClick={() => handleNav("jobs")} />
          <SidebarItem label="Bài đăng"          active={activeTab === "posts"}         onClick={() => handleNav("posts")} />
          <SidebarItem label="Ứng tuyển"         active={activeTab === "applications"}  onClick={() => handleNav("applications")} />
          <SidebarItem label="Cài đặt"           active={activeTab === "settings"}      onClick={() => handleNav("settings")} />

          <div className="sb-section" style={{marginTop:12}}>Tài khoản</div>
          <SidebarItem label="Hồ sơ"        active={false} onClick={() => navigate("/profile")} />
          <SidebarItem label="Đổi mật khẩu" active={false} onClick={() => navigate("/account/change-password")} />
          <SidebarItem label="Đăng xuất"    active={false} onClick={logout} />
        </aside>

        <main className={`admin-content ${sidebarOpen ? "with-sidebar" : "full"}`}>
          {errorMsg && <div className="alert">{errorMsg}</div>}

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {loading ? (
                <div style={{ padding: 24 }}>Đang tải dashboard...</div>
              ) : (
                <>
                  <section className="grid">
                    <Card title="Tổng Categories" value={categories.length} />
                    <Card title="Tổng đơn ứng tuyển" value={applications.length} />
                    <Card
                      title="API health"
                      value={errorMsg ? "Lỗi" : "OK"}
                      sub={errorMsg ? "Xem Console để biết chi tiết" : "Kết nối thành công"}
                    />
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

          {/* MODULES */}
          {activeTab === "departments"   && <DepartmentsModule />}
          {activeTab === "jobs"          && <JobsModule />}
          {activeTab === "posts"         && <PostsModule />}
          {activeTab === "applications"  && <ApplicationsModule />}
          {activeTab === "settings"      && <SettingsEmployerModule />}
        </main>
      </div>

      {/* Styles */}
      <style>{`
        .admin-wrap{min-height:100vh;background:#f9fafb;color:#111827;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
        .admin-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e5e7eb;background:#fff;position:sticky;top:0;z-index:50;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .brand{display:flex;align-items:center;gap:10px}
        .brand-text{font-weight:700;font-size:20px;color:#047857}
        .hamburger{display:inline-flex;flex-direction:column;gap:3px;background:none;border:none;padding:6px;cursor:pointer}
        .hamburger .bar{width:20px;height:2px;background:#111827;border-radius:2px;display:block}
        .actions{display:flex;align-items:center;gap:12px}
        .user-menu{position:relative}
        .avatar-btn{width:36px;height:36px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;overflow:hidden;}
        .avatar-btn img{width:100%;height:100%;object-fit:cover}
        .avatar-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#111827;font-weight:600}
        .admin-body{display:flex;gap:0}
        .admin-sidebar{width:240px;min-height:calc(100vh - 64px);background:#fff;border-right:1px solid #e5e7eb;padding:12px;position:sticky;top:64px;transition:transform .25s ease, opacity .2s ease}
        .admin-sidebar.collapsed{display:none}
        .sb-section{font-size:12px;color:#6b7280;margin:8px 8px 6px}
        .sb-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;cursor:pointer;color:#374151;border:1px solid transparent}
        .sb-item:hover{background:#f3f4f6}
        .sb-item.active{background:#0478570d;color:#065f46;border-color:#04785733}
        .sb-overlay{display:none}
        .sb-overlay.show{display:none}
        @media(max-width:768px){
          .admin-body{position:relative}
          .admin-sidebar{position:fixed;top:64px;left:0;height:calc(100vh - 64px);z-index:40;transform:translateX(-100%)}
          .admin-sidebar.open{transform:translateX(0)}
          .admin-sidebar.collapsed{transform:translateX(-100%);display:block}
          .sb-overlay{display:block;position:fixed;inset:0;top:64px;background:rgba(0,0,0,.35);backdrop-filter:saturate(100%) blur(2px);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s ease}
          .sb-overlay.show{opacity:1;pointer-events:auto}
        }
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
        .toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:12px}
        .left{display:flex;gap:8px;align-items:center}
        .search{padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;min-width:240px}
        .btn-primary{background:#047857;color:#fff;border:1px solid #047857;padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:600}
        .btn-primary:hover{background:#065f46;border-color:#065f46}
        .btn-outline{background:#fff;color:#374151;border:1px solid #e5e7eb;padding:8px 12px;border-radius:10px;cursor:pointer}
        .btn-outline:hover{background:#f3f4f6}
        .btn-danger{background:#fff;color:#dc2626;border:1px solid #fecaca;padding:8px 12px;border-radius:10px;cursor:pointer}
        .btn-danger:hover{background:#fee2e2}

        /* Modal: body cuộn, footer cố định để luôn thấy nút Đăng/Cập nhật */
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:50}
        .modal{width:100%;max-width:720px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;max-height:90vh}
        .modal-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb}
        .modal-ct{padding:16px;overflow:auto;flex:1}
        .modal-ft{padding:12px 16px;border-top:1px solid #e5e7eb;background:#fff;display:flex;justify-content:flex-end;gap:8px}

        .field{margin-bottom:12px}
        .label{font-size:13px;color:#374151;margin-bottom:6px}
        .input,.select,.textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px}
        .textarea{min-height:100px}
      `}</style>
    </div>
  );
};

/* ------------------------------- Small parts ------------------------------ */
function SidebarItem({ label, active, onClick }) {
  return (
    <div className={`sb-item ${active ? "active" : ""}`} onClick={onClick}>
      <span>{label}</span>
    </div>
  );
}

/* -------------------------- Departments (CRUD) --------------------------- */
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
      const res = await api.get("/departments");
      setItems(normalizeList(res));
    } catch (e) {
      setError("Không tải được danh sách phòng ban.");
      setItems([]);
    } finally { setLoading(false); }
  }

  async function upsert(payload) {
    try {
      if (payload?.id) await api.put(`/departments/${payload.id}`, payload);
      else await api.post(`/departments`, payload);
      await fetchList();
    } catch { alert("Lưu thất bại. Kiểm tra API."); }
  }

  async function remove(id) {
    if (!window.confirm("Xoá phòng ban này?")) return;
    try { await api.delete(`/departments/${id}`); await fetchList(); }
    catch { alert("Xoá thất bại. Kiểm tra API."); }
  }

  useEffect(() => { fetchList(); }, []);
  useEffect(() => setPage(1), [query]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="left">
            <input className="search" placeholder="Tìm phòng ban..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>+ Thêm phòng ban</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Tên phòng ban</th><th>Mô tả</th><th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ textAlign:"center", padding:16 }}>Đang tải...</td></tr>}
              {!loading && error && <tr><td colSpan={4} style={{ color:"#b91c1c", textAlign:"center", padding:16 }}>{error}</td></tr>}
              {!loading && !error && paginated.length === 0 && <tr><td colSpan={4} style={{ textAlign:"center", padding:16 }}>Không có dữ liệu</td></tr>}
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
            <div className="modal-ft">
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Huỷ</button>
              <button className="btn-primary" form="dept-form" type="submit">
                {editing ? "Cập nhật" : "Lưu"}
              </button>
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
    try { await onSubmit({ id: initial?.id, name: name.trim(), description: description.trim() }); }
    finally { setSubmitting(false); }
  }

  return (
    <form id="dept-form" onSubmit={handleSubmit}>
      <div className="field">
        <div className="label">Tên phòng ban <span style={{ color: "#dc2626" }}>*</span></div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Kỹ thuật" />
      </div>
      <div className="field">
        <div className="label">Mô tả</div>
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về chức năng phòng ban" />
      </div>
      {submitting && <div style={{color:"#6b7280"}}>Đang lưu…</div>}
    </form>
  );
}

/* ----------------------------- Jobs (CRUD) ------------------------------ */
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
    try { setDepartments(normalizeList(await api.get("/departments"))); }
    catch {}
  }
  async function fetchJobs() {
    setLoading(true); setError("");
    try { setItems(normalizeList(await api.get("/jobs"))); }
    catch { setItems([]); setError("Không tải được danh sách vị trí tuyển dụng."); }
    finally { setLoading(false); }
  }

  async function upsert(payload) {
    try {
      if (payload?.id) await api.put(`/jobs/${payload.id}`, payload);
      else await api.post(`/jobs`, payload);
      await fetchJobs();
    } catch { alert("Lưu thất bại. Kiểm tra API."); }
  }

  async function remove(id) {
    if (!window.confirm("Xoá vị trí này?")) return;
    try { await api.delete(`/jobs/${id}`); await fetchJobs(); }
    catch { alert("Xoá thất bại. Kiểm tra API."); }
  }

  function openApplicants(jobId) {
    window.dispatchEvent(new CustomEvent("open-applications-for-job", { detail: { jobId } }));
    window.dispatchEvent(new Event("go-applications"));
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
                <th>#</th><th>Tên vị trí</th><th>Phòng ban</th><th>Địa điểm</th><th>Loại hình</th><th>Trạng thái</th><th>Lương</th><th style={{ textAlign: "right" }}>Hành động</th>
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
                  <td>{j.type || j.employment_type || "—"}</td>
                  <td>{j.status || "Open"}</td>
                  <td>
                    {(j.salary_min || j.salary_max)
                      ? `${j.salary_min ? Number(j.salary_min).toLocaleString() : "?"} - ${j.salary_max ? Number(j.salary_max).toLocaleString() : "?"}`
                      : "—"}
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <button className="btn-outline" onClick={() => { setEditing(j); setModalOpen(true); }}>Sửa</button>
                    <span style={{ display:"inline-block", width:8 }} />
                    <button className="btn-outline" onClick={() => openApplicants(j.id)}>Ứng viên</button>
                    <span style={{ display:"inline-block", width:8 }} />
                    <button className="btn-danger" onClick={() => remove(j.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            <div className="modal-ft">
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Huỷ</button>
              <button className="btn-primary" form="job-form" type="submit">
                {editing ? "Cập nhật" : "Lưu"}
              </button>
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
    } finally { setSubmitting(false); }
  }

  return (
    <form id="job-form" onSubmit={handleSubmit}>
      <div className="field">
        <div className="label">Tên vị trí <span style={{ color:"#dc2626" }}>*</span></div>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Frontend Engineer" />
      </div>

      <div className="field" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div className="label">Phòng ban <span style={{ color:"#dc2626" }}>*</span></div>
          <select className="select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">— Chọn phòng ban —</option>
            {(departments || []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">Địa điểm</div>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Hà Nội / HCM / Remote" />
        </div>
      </div>

      <div className="field" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div className="label">Loại hình</div>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Intern</option>
            <option>Contract</option>
          </select>
        </div>
        <div>
          <div className="label">Trạng thái</div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="field" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div className="label">Lương tối thiểu</div>
          <input className="input" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min" />
        </div>
        <div>
          <div className="label">Lương tối đa</div>
          <input className="input" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max" />
        </div>
      </div>

      <div className="field">
        <div className="label">Mô tả</div>
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả công việc, yêu cầu, quyền lợi..." />
      </div>

      {submitting && <div style={{color:"#6b7280"}}>Đang lưu…</div>}
    </form>
  );
}

/* ----------------------------- POSTS (Job posts) ---------------------------- */
function PostsModule() {
  const pageSize = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [items, setItems]     = useState([]);
  const [q, setQ]             = useState("");
  const [page, setPage]       = useState(1);

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  const filtered = useMemo(()=>{
    const t = q.toLowerCase();
    return (items||[]).filter(p =>
      (p.title||"").toLowerCase().includes(t) ||
      (p.location||"").toLowerCase().includes(t) ||
      (p.job?.title || "").toLowerCase().includes(t) ||
      (p.department?.name || p.job?.department?.name || "").toLowerCase().includes(t)
    );
  },[items,q]);
  const paginated = useMemo(()=>{
    const start=(page-1)*pageSize; return filtered.slice(start, start+pageSize);
  },[filtered,page]);

  async function fetchCats() {
    try { setCategories(normalizeList(await api.get("/categories"))); }
    catch { setCategories([]); }
  }
  async function fetchDeps() {
    try { setDepartments(normalizeList(await api.get("/departments"))); }
    catch { setDepartments([]); }
  }
  async function fetchJobs() {
    try { setJobs(normalizeList(await api.get("/jobs"))); }
    catch { setJobs([]); }
  }
  async function fetchList(){
    setLoading(true); setError("");
    try { setItems(normalizeList(await api.get("/my/job-posts"))); }
    catch { setItems([]); setError("Không tải được danh sách bài đăng."); }
    finally { setLoading(false); }
  }

  function toFormData(payload) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k,v])=>{
      if (v === undefined || v === null || v === "") return;
      fd.append(k, v);
    });
    return fd;
  }

  async function upsert(payload){
    try {
      if (payload?.id) {
        const fd = toFormData(payload);
        await api.post(`/job-posts/${payload.id}?_method=PUT`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const fd = toFormData(payload);
        await api.post(`/job-posts`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchList();
    } catch (e) { console.error(e); alert("Lưu thất bại."); }
  }

  async function remove(id){
    if(!window.confirm("Xoá bài đăng này?")) return;
    try { await api.delete(`/job-posts/${id}`); await fetchList(); }
    catch { alert("Xoá thất bại."); }
  }

  useEffect(()=>{ fetchCats(); fetchDeps(); fetchJobs(); fetchList(); },[]);
  useEffect(()=>setPage(1),[q]);

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="left">
          <input className="search" placeholder="Tìm theo tiêu đề/địa điểm…" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <div>
          <button className="btn-primary" onClick={()=>{ setEditing(null); setModalOpen(true); }}>+ Đăng bài</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tiêu đề</th>
              <th>Phòng ban</th>
              <th>Vị trí</th>
              <th>Loại hình</th>
              <th>Lương</th>
              <th>Địa điểm</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th style={{textAlign:"right"}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} align="center" style={{padding:16}}>Đang tải…</td></tr>}
            {!loading && error && <tr><td colSpan={10} align="center" style={{padding:16,color:"#b91c1c"}}>{error}</td></tr>}
            {!loading && !error && paginated.length===0 && <tr><td colSpan={10} align="center" style={{padding:16}}>Không có dữ liệu</td></tr>}
            {paginated.map((p,idx)=>(
              <tr key={p.id||idx}>
                <td>{(page-1)*pageSize + idx + 1}</td>
                <td style={{fontWeight:600}}>{p.title}</td>
                <td>{p.department?.name || p.job?.department?.name || "—"}</td>
                <td>{p.job?.title || "—"}</td>
                <td>{p.employment_type || "—"}</td>
                <td>
                  {(p.salary_min||p.salary_max)
                    ? `${p.salary_min ? Number(p.salary_min).toLocaleString() : "?"} - ${p.salary_max ? Number(p.salary_max).toLocaleString() : "?"}`
                    : "—"}
                </td>
                <td>{p.location ?? "—"}</td>
                <td>{p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                <td>{p.status ?? "open"}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn-outline" onClick={()=>{ setEditing(p); setModalOpen(true); }}>Sửa</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-danger" onClick={()=>remove(p.id)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length>pageSize && (
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <div style={{color:"#6b7280"}}>Hiển thị {(page-1)*pageSize+1}–{Math.min(page*pageSize,filtered.length)} / {filtered.length}</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-outline" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Trước</button>
            <button className="btn-outline" disabled={page*pageSize>=filtered.length} onClick={()=>setPage(p=>p+1)}>Sau</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={()=>setModalOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-hd">
              <div style={{fontWeight:600}}>{editing?"Cập nhật bài đăng":"Đăng bài mới"}</div>
              <button className="btn-outline" onClick={()=>setModalOpen(false)}>Đóng</button>
            </div>

            <div className="modal-ct">
              <PostForm
                initial={editing}
                categories={categories}
                departments={departments}
                jobs={jobs}
                onSubmit={async (payload)=>{ await upsert(payload); setModalOpen(false); }}
              />
            </div>

            <div className="modal-ft">
              <button className="btn-outline" onClick={()=>setModalOpen(false)}>Huỷ</button>
              <button className="btn-primary" form="post-form" type="submit">
                {editing ? "Cập nhật" : "Đăng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function PostForm({ initial, categories, departments, jobs, onSubmit }) {
  const [title, setTitle]               = useState(initial?.title || "");
  const [category_id, setCategory]      = useState(initial?.category_id || "");
  const [department_id, setDepartment]  = useState(initial?.department_id || initial?.department?.id || initial?.job?.department_id || "");
  const [job_id, setJob]                = useState(initial?.job_id || initial?.job?.id || "");
  const [location, setLocation]         = useState(initial?.location || "");
  const [salaryMin, setSalaryMin]       = useState(initial?.salary_min ?? "");
  const [salaryMax, setSalaryMax]       = useState(initial?.salary_max ?? "");
  const [employment, setEmployment]     = useState(initial?.employment_type || "full_time");
  const [deadline, setDeadline]         = useState(initial?.deadline ? String(initial.deadline).slice(0,10) : "");
  const [status, setStatus]             = useState(initial?.status || "open");
  const [description, setDescription]   = useState(initial?.description || "");
  const [requirements, setRequirements] = useState(initial?.requirements || "");
  const [benefits, setBenefits]         = useState(initial?.benefits || "");
  const [imageFile, setImageFile]       = useState(null);
  const [saving, setSaving]             = useState(false);

  const jobOptions = useMemo(()=>{
    if (!department_id) return jobs || [];
    return (jobs||[]).filter(j => String(j.department_id) === String(department_id));
  }, [jobs, department_id]);

  useEffect(()=>{
    // Khi đổi phòng ban, nếu job hiện tại không thuộc phòng ban này thì reset
    if (job_id && department_id) {
      const ok = jobOptions.some(j => String(j.id) === String(job_id));
      if (!ok) setJob("");
    }
  }, [department_id]); // eslint-disable-line

  async function submit(e){
    e.preventDefault();
    if(!title.trim()) return alert("Tiêu đề không được trống");
    if(!department_id) return alert("Vui lòng chọn phòng ban");
    if(!job_id) return alert("Vui lòng chọn vị trí tuyển dụng");
    if (salaryMin !== "" && salaryMax !== "" && Number(salaryMin) > Number(salaryMax)) {
      return alert("Lương tối thiểu không được lớn hơn lương tối đa");
    }
    setSaving(true);
    try {
      await onSubmit({
        id: initial?.id,
        title: title.trim(),
        category_id: category_id || null,
        department_id: Number(department_id),
        job_id: Number(job_id),
        location: location.trim(),
        salary_min: salaryMin === "" ? null : Number(salaryMin),
        salary_max: salaryMax === "" ? null : Number(salaryMax),
        employment_type: employment, // 'full_time' | 'part_time' | 'contract' | 'intern'
        deadline: deadline || null,
        status,                      // 'open' | 'closed' | 'draft'
        description: description.trim(),
        requirements: requirements.trim(),
        benefits: benefits.trim(),
        image: imageFile || undefined, // multipart
      });
    } finally { setSaving(false); }
  }

  return (
    <form id="post-form" onSubmit={submit}>
      <div className="field">
        <div className="label">Tiêu đề *</div>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>

      <div className="field" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div className="label">Danh mục</div>
          <select className="select" value={category_id} onChange={e=>setCategory(e.target.value)}>
            <option value="">— Không chọn —</option>
            {(categories||[]).map(c => <option key={c.id} value={c.id}>{c.name || c.title}</option>)}
          </select>
        </div>
        <div>
          <div className="label">Địa điểm</div>
          <input className="input" value={location} onChange={e=>setLocation(e.target.value)} />
        </div>
      </div>

      {/* NEW: Phòng ban & Vị trí (Job) */}
      <div className="field" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div className="label">Phòng ban *</div>
          <select className="select" value={department_id} onChange={e=>setDepartment(e.target.value)}>
            <option value="">— Chọn phòng ban —</option>
            {(departments||[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <div className="label">Vị trí tuyển dụng *</div>
          <select className="select" value={job_id} onChange={e=>setJob(e.target.value)}>
            <option value="">— Chọn vị trí —</option>
            {(jobOptions||[]).map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          {/* Gợi ý nhanh tạo job mới */}
          <div style={{marginTop:6,fontSize:12,color:"#6b7280"}}>
            Không thấy vị trí? <span
              style={{color:"#047857",cursor:"pointer",textDecoration:"underline"}}
              onClick={()=>window.dispatchEvent(new Event("go-applications")) || window.dispatchEvent(new Event("go-applications"))}
              onMouseDown={(e)=>{ e.preventDefault(); }}
              >Qua mục “Vị trí tuyển dụng” để tạo mới.</span>
          </div>
        </div>
      </div>

      <div className="field" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div className="label">Lương tối thiểu</div>
          <input className="input" type="number" value={salaryMin} onChange={e=>setSalaryMin(e.target.value)} />
        </div>
        <div>
          <div className="label">Lương tối đa</div>
          <input className="input" type="number" value={salaryMax} onChange={e=>setSalaryMax(e.target.value)} />
        </div>
      </div>

      <div className="field" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div className="label">Loại hình</div>
          <select className="select" value={employment} onChange={e=>setEmployment(e.target.value)}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <div className="label">Hạn nộp</div>
          <input className="input" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} />
        </div>
      </div>

      <div className="field" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div className="label">Trạng thái</div>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="draft">draft</option>
          </select>
        </div>
        <div>
          <div className="label">Ảnh minh hoạ</div>
          <input className="input" type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="field">
        <div className="label">Mô tả công việc</div>
        <textarea className="textarea" value={description} onChange={e=>setDescription(e.target.value)} />
      </div>

      <div className="field">
        <div className="label">Yêu cầu</div>
        <textarea className="textarea" value={requirements} onChange={e=>setRequirements(e.target.value)} />
      </div>

      <div className="field">
        <div className="label">Quyền lợi</div>
        <textarea className="textarea" value={benefits} onChange={e=>setBenefits(e.target.value)} />
      </div>

      {saving && <div style={{color:"#6b7280"}}>Đang lưu…</div>}
    </form>
  );
}

/* -------------------------- Applications module -------------------------- */
function ApplicationsModule() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [jobs, setJobs]   = useState([]);
  const [filters, setFilters] = useState({ jobId: "", status: "", q: "" });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [offerOpen, setOfferOpen]   = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);

  useEffect(() => {
    const fn = (e) => {
      const id = e?.detail?.jobId;
      if (id) setFilters((f) => ({ ...f, jobId: String(id) }));
    };
    window.addEventListener("open-applications-for-job", fn);
    return () => window.removeEventListener("open-applications-for-job", fn);
  }, []);

  async function fetchJobs() {
    try { setJobs(normalizeList(await api.get("/jobs"))); }
    catch { setJobs([]); }
  }
  async function fetchApps() {
    setLoading(true);
    try { setItems(normalizeList(await api.get("/applications"))); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchJobs(); fetchApps(); }, []);

  const filtered = useMemo(() => {
    let data = items || [];
    if (filters.jobId) data = data.filter(a => String(a?.job_id || a?.job?.id) === String(filters.jobId));
    if (filters.status) data = data.filter(a => ((a?.status || "").toLowerCase()) === filters.status.toLowerCase());
    if (filters.q) {
      const t = filters.q.toLowerCase();
      data = data.filter(a =>
        (a?.job?.title || a?.job_title || "").toLowerCase().includes(t) ||
        (a?.user?.name || a?.candidate_name || a?.email || "").toLowerCase().includes(t)
      );
    }
    return data;
  }, [items, filters]);

  function openCV(a) {
    const url = a?.cv_url || (a?.id ? `/applications/${a.id}/cv` : "");
    if (!url) return alert("Không tìm thấy CV.");
    window.open(url, "_blank");
  }
  async function markInterviewed(a) {
    try { await api.post(`/applications/${a.id}/mark-interviewed`); fetchApps(); }
    catch { alert("Cập nhật thất bại."); }
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="left" style={{ gap: 12 }}>
          <select className="select" value={filters.jobId} onChange={(e)=>setFilters(f=>({ ...f, jobId: e.target.value }))}>
            <option value="">— Tất cả job —</option>
            {(jobs || []).map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <select className="select" value={filters.status} onChange={(e)=>setFilters(f=>({ ...f, status: e.target.value }))}>
            <option value="">— Tất cả trạng thái —</option>
            <option value="Đã nộp CV">Đã nộp CV</option>
            <option value="Hẹn phỏng vấn">Hẹn phỏng vấn</option>
            <option value="Đã phỏng vấn">Đã phỏng vấn</option>
            <option value="Đậu phỏng vấn">Đậu phỏng vấn</option>
            <option value="Trượt phỏng vấn">Trượt phỏng vấn</option>
            <option value="Đã xác nhận làm việc">Đã xác nhận làm việc</option>
          </select>
          <input className="search" placeholder="Tìm theo vị trí / ứng viên…" value={filters.q} onChange={(e)=>setFilters(f=>({ ...f, q: e.target.value }))} />
        </div>
        <div>
          <button className="btn-outline" onClick={fetchApps}>Refresh</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Ứng viên</th><th>Vị trí</th><th>Trạng thái</th><th>Ngày nộp</th><th style={{textAlign:"right"}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign:"center", padding:16 }}>Đang tải…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign:"center", padding:16 }}>Không có dữ liệu</td></tr>}
            {filtered.map((a, i) => (
              <tr key={a.id || i}>
                <td>{i + 1}</td>
                <td style={{fontWeight:600}}>{a.user?.name || a.candidate_name || a.email || "—"}</td>
                <td>{a.job?.title || a.job_title || "—"}</td>
                <td>{a.status || "—"}</td>
                <td>{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
                <td style={{ textAlign:"right" }}>
                  <button className="btn-outline" onClick={()=>openCV(a)}>Xem CV</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-outline" onClick={()=>{ setCurrentApp(a); setInviteOpen(true); }}>Hẹn PV</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-outline" onClick={()=>markInterviewed(a)}>Đã PV</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-primary" onClick={()=>{ setCurrentApp(a); setOfferOpen(true); }}>Đậu PV</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-danger" onClick={()=>{ setCurrentApp(a); setRejectOpen(true); }}>Trượt PV</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviteOpen && <InviteModal  app={currentApp} onClose={()=>setInviteOpen(false)} onSaved={()=>{ setInviteOpen(false); fetchApps(); }} />}
      {offerOpen  && <OfferModal   app={currentApp} onClose={()=>setOfferOpen(false)}  onSaved={()=>{ setOfferOpen(false); fetchApps(); }} />}
      {rejectOpen && <RejectModal  app={currentApp} onClose={()=>setRejectOpen(false)} onSaved={()=>{ setRejectOpen(false); fetchApps(); }} />}
    </div>
  );
}
function InviteModal({ app, onClose, onSaved }) {
  const [date, setDate] = useState("");
  const [content, setContent] = useState(localStorage.getItem("tpl_invite") || "Kính mời {name} tham dự buổi phỏng vấn vào lúc {date} tại {address}...");
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (!date) return alert("Chọn ngày phỏng vấn");
    setSaving(true);
    try {
      await api.post(`/applications/${app.id}/schedule-interview`, { interview_date: date, content });
      localStorage.setItem("tpl_invite", content);
      onSaved();
    } catch { alert("Gửi lịch phỏng vấn thất bại."); }
    finally { setSaving(false); }
  }
  return (
    <Modal title="Hẹn phỏng vấn" onClose={onClose}>
      <div className="field"><div className="label">Ứng viên</div><div>{app?.user?.name || app?.candidate_name || app?.email}</div></div>
      <div className="field"><div className="label">Ngày phỏng vấn</div><input className="input" type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} /></div>
      <div className="field"><div className="label">Nội dung</div><textarea className="textarea" value={content} onChange={e=>setContent(e.target.value)} /></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn-outline" onClick={onClose}>Huỷ</button>
        <button className="btn-primary" disabled={saving} onClick={submit}>{saving ? "Đang gửi..." : "Xác nhận"}</button>
      </div>
    </Modal>
  );
}
function OfferModal({ app, onClose, onSaved }) {
  const [startDate, setStartDate] = useState("");
  const [content, setContent] = useState(localStorage.getItem("tpl_offer") || "Kính mời {name} nhận việc vào ngày {date} tại {address}...");
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (!startDate) return alert("Chọn ngày bắt đầu làm việc");
    setSaving(true);
    try {
      await api.post(`/applications/${app.id}/offer`, { start_date: startDate, content });
      localStorage.setItem("tpl_offer", content);
      onSaved();
    } catch { alert("Gửi thư mời làm việc thất bại."); }
    finally { setSaving(false); }
  }
  return (
    <Modal title="Thư mời làm việc" onClose={onClose}>
      <div className="field"><div className="label">Ứng viên</div><div>{app?.user?.name || app?.candidate_name || app?.email}</div></div>
      <div className="field"><div className="label">Ngày bắt đầu</div><input className="input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
      <div className="field"><div className="label">Nội dung</div><textarea className="textarea" value={content} onChange={e=>setContent(e.target.value)} /></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn-outline" onClick={onClose}>Huỷ</button>
        <button className="btn-primary" disabled={saving} onClick={submit}>{saving ? "Đang gửi..." : "Xác nhận"}</button>
      </div>
    </Modal>
  );
}
function RejectModal({ app, onClose, onSaved }) {
  const [content, setContent] = useState(localStorage.getItem("tpl_reject") || "Kính gửi {name}, chúng tôi rất tiếc khi thông báo kết quả phỏng vấn không đạt...");
  const [saving, setSaving] = useState(false);
  async function submit() {
    setSaving(true);
    try {
      await api.post(`/applications/${app.id}/reject`, { content });
      localStorage.setItem("tpl_reject", content);
      onSaved();
    } catch { alert("Gửi email trượt phỏng vấn thất bại."); }
    finally { setSaving(false); }
  }
  return (
    <Modal title="Thông báo trượt phỏng vấn" onClose={onClose}>
      <div className="field"><div className="label">Ứng viên</div><div>{app?.user?.name || app?.candidate_name || app?.email}</div></div>
      <div className="field"><div className="label">Nội dung</div><textarea className="textarea" value={content} onChange={e=>setContent(e.target.value)} /></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn-outline" onClick={onClose}>Huỷ</button>
        <button className="btn-danger" disabled={saving} onClick={submit}>{saving ? "Đang gửi..." : "Gửi"}</button>
      </div>
    </Modal>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-hd">
          <div style={{ fontWeight:600 }}>{title}</div>
          <button className="btn-outline" onClick={onClose}>Đóng</button>
        </div>
        <div className="modal-ct">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------- Employer Settings --------------------------- */
function SettingsEmployerModule() {
  const [invite, setInvite] = useState(localStorage.getItem("tpl_invite") || "Kính mời {name} tham dự buổi phỏng vấn vào lúc {date} tại {address}...");
  const [offer,  setOffer]  = useState(localStorage.getItem("tpl_offer")  || "Kính mời {name} nhận việc vào ngày {date} tại {address}...");
  const [reject, setReject] = useState(localStorage.getItem("tpl_reject") || "Kính gửi {name}, chúng tôi rất tiếc khi thông báo kết quả phỏng vấn không đạt...");

  async function save() {
    try {
      // Có thể thay bằng API employer settings nếu backend hỗ trợ
      localStorage.setItem("tpl_invite", invite);
      localStorage.setItem("tpl_offer",  offer);
      localStorage.setItem("tpl_reject", reject);
      alert("Đã lưu template.");
    } catch {
      alert("Lưu thất bại.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Cài đặt nhà tuyển dụng</div>
      <div className="field">
        <div className="label">Mẫu email hẹn phỏng vấn</div>
        <textarea className="textarea" value={invite} onChange={(e)=>setInvite(e.target.value)} />
      </div>
      <div className="field">
        <div className="label">Mẫu email thư mời làm việc</div>
        <textarea className="textarea" value={offer} onChange={(e)=>setOffer(e.target.value)} />
      </div>
      <div className="field">
        <div className="label">Mẫu email trượt phỏng vấn</div>
        <textarea className="textarea" value={reject} onChange={(e)=>setReject(e.target.value)} />
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn-primary" onClick={save}>Lưu</button>
      </div>
      <div style={{marginTop:8,color:"#6b7280"}}>
        Hỗ trợ placeholder: <code>{`{name}`}</code>, <code>{`{date}`}</code>, <code>{`{address}`}</code>.
      </div>
    </div>
  );
}

export default Employer;
