// MyApplicationsLite.jsx
import React, {useEffect, useState} from 'react';
import api from '../config';

const label = {
  submitted:'Đã nộp CV', rejected:'Từ chối', interview_scheduled:'Hẹn phỏng vấn',
  interviewed:'Đã phỏng vấn', passed:'Đậu phỏng vấn', failed:'Trượt phỏng vấn', confirmed:'Đã xác nhận làm việc'
};

export default function MyApplicationsLite(){
  const [items,setItems]=useState([]);
  const load = async()=>{ const r=await api.get('/api/applications/my'); setItems(r.data.data||[]); };
  useEffect(()=>{load()},[]);
  const confirm = async id => { await api.post(`/api/applications/${id}/confirm`); await load(); };

  return (
    <table>
      <thead><tr><th>Job</th><th>Trạng thái</th><th>Hẹn PV</th><th>Offer</th><th>Hành động</th></tr></thead>
      <tbody>
        {items.map(a=>(
          <tr key={a.id}>
            <td>{a.job?.title}</td>
            <td>{label[a.status]||a.status}</td>
            <td>{a.interview_at?new Date(a.interview_at).toLocaleString():'-'}</td>
            <td>{a.offer_start_at?new Date(a.offer_start_at).toLocaleDateString():'-'}</td>
            <td>{a.status==='passed' && <button onClick={()=>confirm(a.id)}>Xác nhận làm việc</button>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
