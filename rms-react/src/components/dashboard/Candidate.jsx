import React, { useEffect, useMemo, useState } from "react";
import api from "../../config";
import { useNavigate } from "react-router-dom";

/* ───────────────────────── Helpers ───────────────────────── */
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
  if (typeof d === "string") { try { d = JSON.parse(d); } catch { return []; } }
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

// localStorage utils
const SAVED_JOBS_KEY = "cand_saved_jobs"; // [id,...]
const MY_CV_KEY      = "cand_default_cv"; // {name,type,dataUrl}

function getSavedJobIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || "[]"); } catch { return []; }
}
function setSavedJobIds(ids) {
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...new Set(ids)]));
}
function getDefaultCV() {
  try { return JSON.parse(localStorage.getItem(MY_CV_KEY) || "null"); } catch { return null; }
}
function saveDefaultCV(meta) {
  localStorage.setItem(MY_CV_KEY, JSON.stringify(meta));
}
async function dataURLtoFile(dataUrl, filename) {
  // chuyển dataURL -> File để nhét vào FormData
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "application/pdf" });
}

/* ───────────────────────── Candidate ───────────────────────── */
const Candidate = () => {
  const navigate = useNavigate();

  // sidebar
  const [activeTab, setActiveTab] = useState("jobs");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // user
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch {}
  const email = user?.email || "";
  const displayName = user?.full_name || user?.name || (email || "User");
  const avatarUrl  = user?.avatar || "";

  useEffect(() => {
    if (typeof window !== "undefined") setSidebarOpen(window.innerWidth > 768);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="admin-wrap">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="brand">
          <button className="hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar">
            <span className="bar" /><span className="bar" /><span className="bar" />
          </button>
          <span className="brand-text">CareerAI — Candidate</span>
        </div>
        <div className="actions">
          <div className="user-menu">
            <button className="avatar-btn" aria-label="Avatar">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : (
                <span className="avatar-fallback">{(displayName || "U").slice(0,1).toUpperCase()}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay mobile */}
      <div className={`sb-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="sb-section">Bảng điều khiển</div>
          <SidebarItem label="Tổng quan"      active={activeTab === "overview"}     onClick={() => handleNav("overview")} />
          <SidebarItem label="Việc làm"        active={activeTab === "jobs"}         onClick={() => handleNav("jobs")} />
          <SidebarItem label="Ứng tuyển của tôi" active={activeTab === "myapps"}    onClick={() => handleNav("myapps")} />
          <SidebarItem label="Bài đã lưu"      active={activeTab === "saved"}        onClick={() => handleNav("saved")} />
          <SidebarItem label="CV của tôi"      active={activeTab === "mycv"}         onClick={() => handleNav("mycv")} />
          <SidebarItem label="Cài đặt"         active={activeTab === "settings"}     onClick={() => handleNav("settings")} />

          <div className="sb-section" style={{marginTop:12}}>Tài khoản</div>
          <SidebarItem label="Hồ sơ"        active={false} onClick={() => navigate("/profile")} />
          <SidebarItem label="Đổi mật khẩu" active={false} onClick={() => navigate("/account/change-password")} />
          <SidebarItem label="Đăng xuất"    active={false} onClick={logout} />
        </aside>

        <main className={`admin-content ${sidebarOpen ? "with-sidebar" : "full"}`}>
          {activeTab === "overview" && <CandidateOverview />}
          {activeTab === "jobs"      && <JobsBrowser />}
          {activeTab === "myapps"    && <MyApplications email={email} />}
          {activeTab === "saved"     && <SavedJobs />}
          {activeTab === "mycv"      && <MyCV />}
          {activeTab === "settings"  && <CandidateSettings />}
        </main>
      </div>

      {/* shared styles (giống Employer) */}
      <style>{`
        .admin-wrap{min-height:100vh;background:#f9fafb;color:#111827;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
        .admin-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e5e7eb;background:#fff;position:sticky;top:0;z-index:50;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .brand{display:flex;align-items:center;gap:10px}
        .brand-text{font-weight:700;font-size:20px;color:#047857}
        .hamburger{display:inline-flex;flex-direction:column;gap:3px;background:none;border:none;padding:6px;cursor:pointer}
        .hamburger .bar{width:20px;height:2px;background:#111827;border-radius:2px;display:block}
        .actions{display:flex;align-items:center;gap:12px}
        .avatar-btn{width:36px;height:36px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;overflow:hidden}
        .avatar-btn img{width:100%;height:100%;object-fit:cover}
        .avatar-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#111827;font-weight:600}
        .admin-body{display:flex}
        .admin-sidebar{width:240px;min-height:calc(100vh - 64px);background:#fff;border-right:1px solid #e5e7eb;padding:12px;position:sticky;top:64px;transition:transform .25s ease}
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
        .pill{padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;color:#374151;font-size:12px}
        /* modal fixed footer */
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

/* ────────────────────── Sidebar item ────────────────────── */
function SidebarItem({ label, active, onClick }) {
  return <div className={`sb-item ${active ? "active" : ""}`} onClick={onClick}><span>{label}</span></div>;
}

/* ────────────────────── Overview ────────────────────── */
function CandidateOverview() {
  const [posts, setPosts] = useState([]);
  const [apps,  setApps]  = useState([]);

  let user = null; try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch {}
  const email = user?.email || "";

  useEffect(() => {
    (async () => {
      try { setPosts(normalizeList(await api.get("/job-posts"))); } catch {}
      try { setApps(normalizeList(await api.get("/applications"))); } catch {}
    })();
  }, []);

  const savedCount = getSavedJobIds().length;
  const myApps = apps.filter(a => (a?.email || "").toLowerCase() === (email || "").toLowerCase());

  return (
    <>
      <section className="grid">
        <Card title="Tổng bài đăng" value={posts.length} />
        <Card title="Bài đã lưu" value={savedCount} />
        <Card title="Đơn đã nộp" value={myApps.length} />
      </section>

      <section className="panel">
        <div className="panel-title">Bài đăng mới</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Tiêu đề</th><th>Loại hình</th><th>Địa điểm</th><th>Hạn</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(posts || []).slice(0,10).map((p,i)=>(
                <tr key={p.id || i}>
                  <td>{i+1}</td>
                  <td style={{fontWeight:600}}>{p.title}</td>
                  <td>{p.employment_type || "—"}</td>
                  <td>{p.location || "—"}</td>
                  <td>{p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                  <td><span className="pill">{p.status || "open"}</span></td>
                </tr>
              ))}
              {posts.length===0 && <tr><td colSpan={6} style={{textAlign:"center",padding:16}}>Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ────────────────────── Jobs Browser ────────────────────── */
function JobsBrowser() {
  const [loading, setLoading] = useState(true);
  const [items, setItems]     = useState([]);
  const [q, setQ]             = useState("");
  const [type, setType]       = useState("");
  const [location, setLoc]    = useState("");

  const [detail, setDetail]   = useState(null);     // job chi tiết
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyJob, setApplyJob]   = useState(null);

  const savedIds = getSavedJobIds();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setItems(normalizeList(await api.get("/job-posts"))); }
      catch { setItems([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(()=>{
    const t = q.toLowerCase();
    return (items||[]).filter(p => {
      const okQ = (p.title||"").toLowerCase().includes(t) || (p.description||"").toLowerCase().includes(t);
      const okT = !type || (p.employment_type||"").toLowerCase() === type.toLowerCase();
      const okL = !location || (p.location||"").toLowerCase().includes(location.toLowerCase());
      return okQ && okT && okL;
    });
  },[items,q,type,location]);

  function toggleSave(id){
    const ids = getSavedJobIds();
    if (ids.includes(id)) setSavedJobIds(ids.filter(x=>x!==id));
    else setSavedJobIds([...ids, id]);
    // force state refresh
    setLoc(l => l+"");
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="left" style={{gap:12}}>
          <input className="search" placeholder="Tìm theo tiêu đề, mô tả…" value={q} onChange={e=>setQ(e.target.value)} />
          <input className="search" style={{minWidth:160}} placeholder="Địa điểm" value={location} onChange={e=>setLoc(e.target.value)} />
          <select className="select" style={{minWidth:160}} value={type} onChange={e=>setType(e.target.value)}>
            <option value="">Tất cả loại hình</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <button className="btn-outline" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Lên đầu trang</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Tiêu đề</th><th>Loại hình</th><th>Lương</th><th>Địa điểm</th><th>Hạn</th><th>Trạng thái</th><th style={{textAlign:"right"}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} align="center" style={{padding:16}}>Đang tải…</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan={8} align="center" style={{padding:16}}>Không có kết quả</td></tr>}
            {filtered.map((p,i)=>(
              <tr key={p.id||i}>
                <td>{i+1}</td>
                <td style={{fontWeight:600}}>{p.title}</td>
                <td>{p.employment_type || "—"}</td>
                <td>{(p.salary_min||p.salary_max)?`${p.salary_min?Number(p.salary_min).toLocaleString():"?"} - ${p.salary_max?Number(p.salary_max).toLocaleString():"?"}`:"—"}</td>
                <td>{p.location || "—"}</td>
                <td>{p.deadline? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                <td><span className="pill">{p.status || "open"}</span></td>
                <td style={{textAlign:"right"}}>
                  <button className="btn-outline" onClick={()=>setDetail(p)}>Chi tiết</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-primary" onClick={()=>{ setApplyJob(p); setApplyOpen(true); }}>Ứng tuyển</button>
                  <span style={{display:"inline-block",width:6}}/>
                  <button className="btn-outline" onClick={()=>toggleSave(p.id)}>
                    {savedIds.includes(p.id) ? "Bỏ lưu" : "Lưu"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <Modal title={detail.title} onClose={()=>setDetail(null)}>
          <div className="field"><div className="label">Địa điểm</div><div>{detail.location || "—"}</div></div>
          <div className="field"><div className="label">Loại hình</div><div>{detail.employment_type || "—"}</div></div>
          <div className="field"><div className="label">Mức lương</div><div>{(detail.salary_min||detail.salary_max)?`${detail.salary_min?Number(detail.salary_min).toLocaleString():"?"} - ${detail.salary_max?Number(detail.salary_max).toLocaleString():"?"}`:"—"}</div></div>
          <div className="field"><div className="label">Hạn nộp</div><div>{detail.deadline? new Date(detail.deadline).toLocaleDateString() : "—"}</div></div>
          <div className="field"><div className="label">Mô tả công việc</div><div style={{whiteSpace:"pre-wrap"}}>{detail.description || "—"}</div></div>
          {detail.requirements && <div className="field"><div className="label">Yêu cầu</div><div style={{whiteSpace:"pre-wrap"}}>{detail.requirements}</div></div>}
          {detail.benefits && <div className="field"><div className="label">Quyền lợi</div><div style={{whiteSpace:"pre-wrap"}}>{detail.benefits}</div></div>}
          <div className="modal-ft">
            <button className="btn-outline" onClick={()=>setDetail(null)}>Đóng</button>
            <button className="btn-primary" onClick={()=>{ setApplyJob(detail); setDetail(null); setApplyOpen(true); }}>Ứng tuyển</button>
          </div>
        </Modal>
      )}

      {applyOpen && <ApplyModal job={applyJob} onClose={()=>setApplyOpen(false)} />}
    </div>
  );
}

function ApplyModal({ job, onClose }) {
  let user=null; try { user = JSON.parse(localStorage.getItem("user")||"null"); } catch {}
  const [email, setEmail] = useState(user?.email || "");
  const [file, setFile]   = useState(null);
  const [usingDefault, setUsingDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    // auto fill bằng CV mặc định nếu có
    const cv = getDefaultCV();
    if (cv) setUsingDefault(true);
  },[]);

  async function handleSubmit(e){
    e.preventDefault();
    if (!email) return alert("Vui lòng nhập email");
    if (!file && !usingDefault) return alert("Chọn CV để nộp");

    const fd = new FormData();
    fd.append("email", email);
    fd.append("job_id", job.id);

    if (usingDefault) {
      const cv = getDefaultCV();
      if (!cv) return alert("Chưa có CV mặc định.");
      const f = await dataURLtoFile(cv.dataUrl, cv.name || "cv.pdf");
      fd.append("cv", f);
    } else {
      fd.append("cv", file);
    }

    setSaving(true);
    try {
   await api.post("/applications/apply", fd, { headers: { "Content-Type": "multipart/form-data" } });


      alert("Đã nộp đơn thành công!");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Nộp đơn thất bại. Kiểm tra lại file (PDF/DOCX, <=5MB) và kết nối.");
    } finally { setSaving(false); }
  }

  const hasDefaultCV = !!getDefaultCV();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd">
          <div style={{fontWeight:600}}>Nộp đơn — {job?.title}</div>
          <button className="btn-outline" onClick={onClose}>Đóng</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-ct" id="apply-form">
          <div className="field">
            <div className="label">Email liên hệ *</div>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div className="field">
            <div className="label">Chọn CV *</div>
            {hasDefaultCV && (
              <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <input type="checkbox" checked={usingDefault} onChange={e=>setUsingDefault(e.target.checked)} />
                Dùng CV mặc định đã lưu
              </label>
            )}
            {!usingDefault && (
              <input className="input" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                     onChange={e=>setFile(e.target.files?.[0] || null)} />
            )}
          </div>

          <div style={{color:"#6b7280",fontSize:13}}>
            Chỉ hỗ trợ PDF/DOCX, tối đa 5MB.
          </div>
        </form>
        <div className="modal-ft">
          <button className="btn-outline" onClick={onClose}>Huỷ</button>
          <button className="btn-primary" type="submit" form="apply-form" disabled={saving}>{saving?"Đang nộp…":"Nộp đơn"}</button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── Saved Jobs ────────────────────── */
function SavedJobs() {
  const [all, setAll] = useState([]);
  const savedIds = getSavedJobIds();

  useEffect(()=>{ (async()=>{ try { setAll(normalizeList(await api.get("/job-posts"))); } catch{} })(); },[]);
  const items = all.filter(p => savedIds.includes(p.id));

  function unsave(id) {
    const ids = getSavedJobIds().filter(x => x !== id);
    setSavedJobIds(ids);
    // force re-render
    setAll(a => [...a]);
  }

  return (
    <div className="panel">
      <div className="panel-title">Bài đã lưu</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Tiêu đề</th><th>Địa điểm</th><th>Loại hình</th><th>Hạn</th><th style={{textAlign:"right"}}>Hành động</th></tr>
          </thead>
          <tbody>
            {items.length===0 && <tr><td colSpan={6} align="center" style={{padding:16}}>Chưa lưu bài nào</td></tr>}
            {items.map((p,i)=>(
              <tr key={p.id||i}>
                <td>{i+1}</td>
                <td style={{fontWeight:600}}>{p.title}</td>
                <td>{p.location || "—"}</td>
                <td>{p.employment_type || "—"}</td>
                <td>{p.deadline? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                <td style={{textAlign:"right"}}>
                  <button className="btn-danger" onClick={()=>unsave(p.id)}>Bỏ lưu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────── My Applications ────────────────────── */
function MyApplications({ email }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems]     = useState([]);

  useEffect(()=>{ (async()=>{
    setLoading(true);
    try { setItems(normalizeList(await api.get("/applications"))); }
    catch { setItems([]); }
    finally { setLoading(false); }
  })(); },[]);

  const mine = useMemo(()=>{
    const t = (email||"").toLowerCase();
    return (items||[]).filter(a => (a?.email||"").toLowerCase() === t);
  },[items,email]);

  async function confirmWork(a) {
    try {
      // Nếu backend có endpoint riêng:
      // await api.post(`/applications/${a.id}/confirm-employment`);
      alert("Đã xác nhận làm việc (demo). Hãy thêm endpoint /applications/{id}/confirm-employment ở backend để lưu trạng thái.");
    } catch {
      alert("Thao tác thất bại.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Đơn ứng tuyển của tôi</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Vị trí</th><th>Trạng thái</th><th>Ngày nộp</th><th style={{textAlign:"right"}}>Hành động</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} align="center" style={{padding:16}}>Đang tải…</td></tr>}
            {!loading && mine.length===0 && <tr><td colSpan={5} align="center" style={{padding:16}}>Chưa có đơn ứng tuyển</td></tr>}
            {mine.map((a,i)=>(
              <tr key={a.id||i}>
                <td>{i+1}</td>
                <td style={{fontWeight:600}}>{a.job?.title || a.job_title || "—"}</td>
                <td>{a.status || "Đã nộp CV"}</td>
                <td>{a.created_at? new Date(a.created_at).toLocaleString() : "—"}</td>
                <td style={{textAlign:"right"}}>
                  {(a.status==="Đậu phỏng vấn") && (
                    <button className="btn-primary" onClick={()=>confirmWork(a)}>Xác nhận làm việc</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────── My CV ────────────────────── */
function MyCV() {
  const [meta, setMeta] = useState(getDefaultCV());
  const [preview, setPreview] = useState(meta?.name ? `${meta.name} (${(meta.dataUrl?.length/1024/1024).toFixed(2)}MB*)` : "");

  async function onPick(e){
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5*1024*1024) return alert("File vượt quá 5MB");
    if (!/pdf|doc|docx/i.test(f.type) && !/\.(pdf|doc|docx)$/i.test(f.name)) {
      return alert("Chỉ nhận PDF/DOC/DOCX");
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const m = { name: f.name, type: f.type, dataUrl };
      saveDefaultCV(m);
      setMeta(m);
      setPreview(`${f.name} (${(f.size/1024/1024).toFixed(2)}MB)`);
      alert("Đã lưu CV mặc định trên máy này. Khi ấn Ứng tuyển bạn có thể dùng ngay.");
    };
    reader.readAsDataURL(f);
  }

  function clearCV(){
    localStorage.removeItem(MY_CV_KEY);
    setMeta(null); setPreview("");
  }

  return (
    <div className="panel">
      <div className="panel-title">CV mặc định</div>
      <div className="field">
        <div className="label">Tải lên CV (PDF/DOCX, ≤5MB)</div>
        <input className="input" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
               onChange={onPick} />
      </div>
      {meta && (
        <div className="field">
          <div className="label">Đang lưu</div>
          <div>{preview}</div>
          <div style={{marginTop:8}}><button className="btn-danger" onClick={clearCV}>Xoá CV mặc định</button></div>
        </div>
      )}
      {!meta && <div style={{color:"#6b7280"}}>Chưa có CV mặc định.</div>}
    </div>
  );
}

/* ────────────────────── Settings ────────────────────── */
function CandidateSettings() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyZalo,  setNotifyZalo]  = useState(false);

  return (
    <div className="panel">
      <div className="panel-title">Cài đặt thông báo</div>
      <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <input type="checkbox" checked={notifyEmail} onChange={e=>setNotifyEmail(e.target.checked)} />
        Nhận email khi có cập nhật trạng thái đơn
      </label>
      <label style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="checkbox" checked={notifyZalo} onChange={e=>setNotifyZalo(e.target.checked)} />
        (Demo) Nhận thông báo Zalo
      </label>
      <div style={{marginTop:12,color:"#6b7280",fontSize:13}}>
        Tuỳ chọn này hiện lưu cục bộ trên trình duyệt.
      </div>
    </div>
  );
}

/* ────────────────────── Shared Modal ────────────────────── */
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

export default Candidate;
