// JobSearchLite.jsx
import React, {useEffect, useState} from 'react';
import api from '../config';

export default function JobSearchLite(){
  const [q,setQ]=useState(''); const [items,setItems]=useState([]);
  const [location,setLocation]=useState(''); const [industry,setIndustry]=useState(''); const [minSalary,setMinSalary]=useState('');

  const search = async ()=>{
    const r = await api.get('/api/jobs/search', {params:{q, location, industry, min_salary:minSalary}});
    setItems(r.data.data || r.data);
  };
  useEffect(()=>{search()},[]);

  const save = async id => { await api.post('/api/jobs/bookmarks',{job_id:id}); alert('Đã lưu'); };
  const apply = async id => { await api.post('/api/applications/apply',{job_id:id}); alert('Đã nộp đơn'); };

  return (
    <div>
      <div>
        <input placeholder="Từ khoá" value={q} onChange={e=>setQ(e.target.value)}/>
        <input placeholder="Địa điểm" value={location} onChange={e=>setLocation(e.target.value)}/>
        <input placeholder="Ngành nghề" value={industry} onChange={e=>setIndustry(e.target.value)}/>
        <input placeholder="Lương tối thiểu" value={minSalary} onChange={e=>setMinSalary(e.target.value)}/>
        <button onClick={search}>Tìm</button>
      </div>
      <ul>
        {items.map(j=>(
          <li key={j.id}>
            <b>{j.title}</b>
            <div>
              <button onClick={()=>save(j.id)}>Lưu</button>
              <button onClick={()=>apply(j.id)}>Ứng tuyển</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
