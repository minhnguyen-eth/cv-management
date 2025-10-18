// src/profiles/CandidateProfileLite.jsx
import React, { useEffect, useState } from "react";
import api from "../config";

const init = {
  id: null,
  user_id: null,
  full_name: "",
  phone: "",
  location: "",
  headline: "",
  summary: "",
  cv_path: null,
  created_at: null,
  updated_at: null,
};

export default function CandidateProfileLite() {
  const [data, setData] = useState(init);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/candidate/profile");
        const payload = r?.data?.data || r?.data || {};
        setData((d) => ({ ...d, ...payload }));
      } catch (e) {
        console.error(e);
        alert("Không tải được hồ sơ. Hãy đăng nhập rồi thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!data.full_name?.trim()) return alert("Vui lòng nhập Họ tên.");
    try {
      setSaving(true);
      const r = await api.post("/candidate/profile", {
        full_name: data.full_name,
        phone: data.phone,
        location: data.location,
        headline: data.headline,
        summary: data.summary,
      });
      const payload = r?.data?.data || {};
      setData((d) => ({ ...d, ...payload }));
      alert("Đã lưu hồ sơ.");
    } catch (e) {
      console.error(e);
      alert("Lưu hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!cvFile) return alert("Chọn file CV trước.");
    const okType =
      /application\/pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/i.test(
        cvFile.type || ""
      ) || /\.(pdf|doc|docx)$/i.test(cvFile.name || "");
    if (!okType) return alert("Chỉ chấp nhận PDF/DOC/DOCX.");
    if (cvFile.size > 5 * 1024 * 1024) return alert("File vượt quá 5MB.");

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("cv", cvFile);
      const r = await api.post("/candidate/upload-cv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const cvPath = r?.data?.cv_path || r?.data?.cv_url || null;
      if (cvPath) setData((d) => ({ ...d, cv_path: cvPath }));
      setCvFile(null);
      alert("Đã upload CV thành công.");
    } catch (e) {
      console.error(e);
      alert("Upload CV thất bại.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Đang tải hồ sơ…</div>;
  }

  return (
    <div className="profile-wrap">
      <div className="profile-card">
        <div className="card-hd">
          <div className="title">Cập nhật thông tin cá nhân</div>
          <div className="subtitle">Thông tin trong hồ sơ sẽ được dùng khi bạn ứng tuyển</div>
        </div>

        <form onSubmit={onSave} className="card-bd">
          <div className="grid">
            <div className="col">
              <div className="section-ttl">Thông tin cá nhân</div>

              <div className="field">
                <label className="label">Họ tên *</label>
                <input
                  className="input"
                  name="full_name"
                  value={data.full_name || ""}
                  onChange={onChange}
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="row-2">
                <div className="field">
                  <label className="label">Số điện thoại</label>
                  <input
                    className="input"
                    name="phone"
                    value={data.phone || ""}
                    onChange={onChange}
                    placeholder="0987xxx..."
                  />
                </div>
                <div className="field">
                  <label className="label">Địa điểm</label>
                  <input
                    className="input"
                    name="location"
                    value={data.location || ""}
                    onChange={onChange}
                    placeholder="TP.HCM, Hà Nội…"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Tiêu đề hồ sơ</label>
                <input
                  className="input"
                  name="headline"
                  value={data.headline || ""}
                  onChange={onChange}
                  placeholder="VD: Frontend React 3 năm kinh nghiệm"
                />
              </div>

              <div className="field">
                <label className="label">Giới thiệu</label>
                <textarea
                  className="textarea"
                  name="summary"
                  value={data.summary || ""}
                  onChange={onChange}
                  placeholder="Tóm tắt kỹ năng, kinh nghiệm nổi bật…"
                />
              </div>

              <div className="actions">
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>

            <div className="col">
              <div className="section-ttl">CV</div>

              <div className="field">
                <label className="label">Tải lên CV (PDF/DOC/DOCX, ≤ 5MB)</label>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
              </div>

              {data.cv_path ? (
                <div className="field">
                  <label className="label">CV hiện tại</label>
                  <div className="cv-box">
                    <span className="cv-name">{(data.cv_path || "").split("/").pop()}</span>
                    <a href={data.cv_path} target="_blank" rel="noreferrer" className="btn-outline">
                      Xem CV
                    </a>
                  </div>
                </div>
              ) : (
                <div className="field">
                  <div className="muted">Chưa có CV.</div>
                </div>
              )}

              <div className="actions">
                <button className="btn-outline" onClick={onUpload} disabled={uploading || !cvFile}>
                  {uploading ? "Đang upload…" : "Upload CV"}
                </button>
              </div>

              {/* Thông tin hệ thống (read-only) */}
              <div className="meta">
                <div><b>ID:</b> {data.id ?? "—"}</div>
                <div><b>User ID:</b> {data.user_id ?? "—"}</div>
                <div><b>Created:</b> {data.created_at ? new Date(data.created_at).toLocaleString() : "—"}</div>
                <div><b>Updated:</b> {data.updated_at ? new Date(data.updated_at).toLocaleString() : "—"}</div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Styles xanh lá theo project */}
      <style>{`
        .profile-wrap{padding:16px}
        .profile-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 1px 2px rgba(0,0,0,.05);max-width:1100px;margin:0 auto}
        .card-hd{padding:16px 20px;border-bottom:1px solid #e5e7eb;background:#f8faf9}
        .title{font-weight:700;color:#065f46}
        .subtitle{font-size:13px;color:#6b7280;margin-top:4px}
        .card-bd{padding:20px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        @media(max-width:900px){.grid{grid-template-columns:1fr}}
        .col{}
        .section-ttl{font-weight:600;margin-bottom:12px;color:#047857}
        .field{margin-bottom:12px}
        .label{font-size:13px;margin-bottom:6px;color:#374151}
        .input,.textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
        .textarea{min-height:120px}
        .row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:600px){.row-2{grid-template-columns:1fr}}
        .actions{display:flex;gap:8px;margin-top:8px}
        .btn-primary{background:#047857;color:#fff;border:1px solid #047857;padding:10px 14px;border-radius:10px;font-weight:600;cursor:pointer}
        .btn-primary:hover{background:#065f46;border-color:#065f46}
        .btn-outline{background:#fff;color:#374151;border:1px solid #e5e7eb;padding:10px 14px;border-radius:10px;cursor:pointer}
        .btn-outline:hover{background:#f3f4f6}
        .muted{color:#6b7280}
        .cv-box{display:flex;align-items:center;justify-content:space-between;border:1px dashed #d1d5db;border-radius:10px;padding:10px 12px}
        .cv-name{font-family:ui-monospace, SFMono-Regular, Menlo, monospace;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px}
        .meta{margin-top:18px;padding:12px;border:1px solid #eef2f7;border-radius:10px;background:#fafafa;color:#6b7280;font-size:13px}
      `}</style>
    </div>
  );
}
