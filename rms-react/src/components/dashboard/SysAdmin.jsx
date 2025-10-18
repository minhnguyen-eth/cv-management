import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config";

/* Helpers */
const Card = ({ title, value, sub }) => (
  <div className="dash-card">
    <div className="dash-card-title">{title}</div>
    <div className="dash-card-value">{value}</div>
    {sub ? <div className="dash-card-sub">{sub}</div> : null}
  </div>
);

function normalizeList(res) {
  let d = res?.data;
  if (typeof d === "string") { try { d = JSON.parse(d); } catch { return []; } }
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

function roleFromAny(v) {
  if (v === 2 || v === "2") return 2;
  if (v === 1 || v === "1" || v === true) return 1;
  return 0;
}
function roleLabel(v) {
  const r = roleFromAny(v);
  return r === 2 ? "System Admin" : r === 1 ? "Employer" : "Candidate";
}

/* ————————————————————————————————————— */
/* Main SysAdmin Dashboard               */
/* ————————————————————————————————————— */
export default function SysAdmin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // avatar hiển thị (không dropdown)
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch {}
  const displayName = user?.full_name || user?.name || "User";
  const avatarUrl  = user?.avatar || "";

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    setSidebarOpen(!isMobile);
  }, []);

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) setSidebarOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-wrap">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="brand">
          <button className="hamburger" onClick={() => setSidebarOpen((s) => !s)} aria-label="Toggle sidebar">
            <span className="bar" /><span className="bar" /><span className="bar" />
          </button>
          <span className="brand-text">Recruitment — System Admin</span>
        </div>

        <div className="actions">
          <div className="avatar-btn" aria-label="Avatar">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : (
              <span className="avatar-fallback">{(displayName || "U").slice(0,1).toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      {/* Overlay mobile */}
      <div className={`sb-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Body */}
      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="sb-section">Quản trị hệ thống</div>
          <SidebarItem label="Tổng quan"  active={activeTab === "overview"}  onClick={() => handleNav("overview")} />
          <SidebarItem label="Người dùng" active={activeTab === "users"}     onClick={() => handleNav("users")} />
          <SidebarItem label="Thống kê"   active={activeTab === "stats"}     onClick={() => handleNav("stats")} />
          <SidebarItem label="Cấu hình"   active={activeTab === "settings"}  onClick={() => handleNav("settings")} />
          <div style={{ height: 8 }} />
          <SidebarItem label="Đăng xuất"  active={false} onClick={logout} />
        </aside>

        <main className={`admin-content ${sidebarOpen ? "with-sidebar" : "full"}`}>
          {activeTab === "overview" && <Overview />}
          {activeTab === "users"     && <UsersModule />}
          {activeTab === "stats"     && <StatsModule />}
          {activeTab === "settings"  && <Placeholder label="Cấu hình" />}
        </main>
      </div>

      {/* Styles — giống các dashboard khác */}
      <style>{`
        .admin-wrap{min-height:100vh;background:#f9fafb;color:#111827;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
        .admin-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e5e7eb;background:#fff;position:sticky;top:0;z-index:50;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .brand{display:flex;align-items:center;gap:10px}
        .brand-text{font-weight:700;font-size:20px;color:#047857}
        .hamburger{display:inline-flex;flex-direction:column;gap:3px;background:none;border:none;padding:6px;cursor:pointer}
        .hamburger .bar{width:20px;height:2px;background:#111827;border-radius:2px;display:block}

        .actions{display:flex;align-items:center;gap:12px}
        .avatar-btn{width:36px;height:36px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;overflow:hidden}
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
      `}</style>
    </div>
  );
}

/* Sidebar item */
function SidebarItem({ label, active, onClick }) {
  return (
    <div className={`sb-item ${active ? "active" : ""}`} onClick={onClick}>
      <span>{label}</span>
    </div>
  );
}

/* ————————————————————————————————————— */
/* OVERVIEW                              */
/* ————————————————————————————————————— */
function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState({ users: 0, jobs: 0, applications: 0 });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, u] = await Promise.allSettled([
          api.get("/admin/stats"),
          api.get("/admin/users"),
        ]);
        if (s.status === "fulfilled") {
          const d = s.value?.data || {};
          alive && setStats({
            users: Number(d.users || 0),
            jobs: Number(d.jobs || 0),
            applications: Number(d.applications || 0),
          });
        }
        if (u.status === "fulfilled") {
          const list = normalizeList(u.value);
          alive && setRecentUsers(list.slice(0, 10));
        }
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      {loading ? (
        <div style={{ padding: 24 }}>Đang tải dashboard...</div>
      ) : (
        <>
          <section className="grid">
            <Card title="Tổng người dùng" value={stats.users} />
            <Card title="Vị trí tuyển dụng" value={stats.jobs} />
            <Card title="Đơn ứng tuyển" value={stats.applications} />
          </section>

          <section className="panel">
            <div className="panel-title">Người dùng mới/nearby</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Tên</th><th>Email</th><th>Quyền</th><th>Ngày tạo</th></tr>
                </thead>
                <tbody>
                  {recentUsers.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:"center" }}>Chưa có dữ liệu</td></tr>
                  )}
                  {recentUsers.map((u, idx) => (
                    <tr key={u.id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{fontWeight:600}}>{u.name || u.full_name || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>{roleLabel(u.is_admin)}</td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

/* ————————————————————————————————————— */
/* USERS                                 */
/* ————————————————————————————————————— */
function UsersModule() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return (items || []).filter(u =>
      (u?.email || "").toLowerCase().includes(t) ||
      (u?.name || u?.full_name || "").toLowerCase().includes(t)
    );
  }, [items, q]);

  async function fetchUsers() {
    setLoading(true);
    try { setItems(normalizeList(await api.get("/admin/users"))); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function updateRole(id, role) {
    try {
      await api.patch(`/admin/users/${id}/role`, { is_admin: Number(role) });
      setItems((prev) => prev.map(x => (x.id === id ? { ...x, is_admin: Number(role) } : x)));
    } catch {
      alert("Cập nhật quyền thất bại.");
    }
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="left">
          <input className="search" placeholder="Tìm theo email/tên…" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <div>
          <button className="btn-outline" onClick={fetchUsers}>Refresh</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Tên</th><th>Email</th><th>Quyền</th><th>Đổi quyền</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ textAlign:"center", padding:16 }}>Đang tải…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign:"center", padding:16 }}>Không có dữ liệu</td></tr>}
            {filtered.map((u, i) => (
              <tr key={u.id || i}>
                <td>{i + 1}</td>
                <td style={{fontWeight:600}}>{u.name || u.full_name || "—"}</td>
                <td>{u.email || "—"}</td>
                <td>{roleLabel(u.is_admin)}</td>
                <td>
                  <select
                    className="select"
                    defaultValue={roleFromAny(u.is_admin)}
                    onChange={(e)=>updateRole(u.id, e.target.value)}
                  >
                    <option value={0}>Candidate</option>
                    <option value={1}>Employer</option>
                    <option value={2}>System Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ————————————————————————————————————— */
/* STATS                                 */
/* ————————————————————————————————————— */
function StatsModule() {
  const [data, setData] = useState({ users: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/admin/stats");
        const p = res?.data || {};
        alive && setData({
          users: Number(p.users || 0),
          jobs: Number(p.jobs || 0),
          applications: Number(p.applications || 0),
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Đang tải…</div>;

  return (
    <div className="panel">
      <div className="panel-title">Thống kê tổng quan</div>
      <section className="grid" style={{ marginTop: 8 }}>
        <Card title="Tổng người dùng" value={data.users} />
        <Card title="Vị trí tuyển dụng" value={data.jobs} />
        <Card title="Đơn ứng tuyển" value={data.applications} />
      </section>
    </div>
  );
}

/* ————————————————————————————————————— */
/* PLACEHOLDER                           */
/* ————————————————————————————————————— */
function Placeholder({ label }) {
  return (
    <div className="panel" style={{ textAlign: "center", color: "#6b7280" }}>
      Mục <b>{label}</b> sẽ được bổ sung sau.
    </div>
  );
}
