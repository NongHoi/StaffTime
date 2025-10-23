import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MaterialIssuance.css';

const MaterialIssuance = () => {
  const [forms, setForms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState({}); // {materialId: quantity}
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchForms();
    fetchMaterials();
    fetchWorkSchedules();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axios.get('/api/material-issuance-forms', { withCredentials: true });
      setForms(res.data);
    } catch (err) {
      console.error('fetchForms', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/materials', { withCredentials: true });
      setMaterials(res.data);
    } catch (err) {
      console.error('fetchMaterials', err);
    }
  };

  const fetchWorkSchedules = async () => {
    try {
      const res = await axios.get('/api/work-schedule', { withCredentials: true });
      setWorkSchedules(res.data);
    } catch (err) {
      console.error('fetchWorkSchedules', err);
    }
  };

  const toggleSelect = (materialId) => {
    setSelectedMaterials(prev => {
      const copy = { ...prev };
      if (copy[materialId]) delete copy[materialId];
      else copy[materialId] = 1;
      return copy;
    });
  };

  const setQty = (materialId, qty) => {
    setSelectedMaterials(prev => ({ ...prev, [materialId]: parseInt(qty) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || Object.keys(selectedMaterials).length === 0) {
      alert('Chọn lịch và ít nhất một vật tư');
      return;
    }

    const items = Object.entries(selectedMaterials).map(([material_id, quantity]) => ({ material_id, quantity }));

    try {
      const res = await axios.post('/api/material-issuance-forms', { work_schedule_id: selectedSchedule, items, notes }, { withCredentials: true });
      console.log('submit result', res.data);
      // refresh
      fetchForms();
      fetchMaterials();
      setShowForm(false);
      setSelectedMaterials({});
      setSelectedSchedule('');
      setNotes('');
      alert('Xuất vật tư thành công');
    } catch (err) {
      console.error('submit error', err);
      alert(err.response?.data?.message || err.message);
    }
  };

  const exportToExcel = async (formId) => {
    try {
      const res = await axios.get(`/api/material-issuance-forms/${formId}/export/excel`, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `phieu-xuat-${formId}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('exportToExcel', err);
      alert('Lỗi khi xuất Excel: ' + (err.response?.data?.message || err.message));
    }
  };

  // Group materials by category
  const getCategories = () => {
    const categories = ['all'];
    materials.forEach(m => {
      if (m.category && !categories.includes(m.category)) {
        categories.push(m.category);
      }
    });
    return categories;
  };

  const getFilteredMaterials = () => {
    if (activeTab === 'all') return materials;
    return materials.filter(m => m.category === activeTab);
  };

  const categories = getCategories();
  const filteredMaterials = getFilteredMaterials();

  return (
    <div className="material-issuance">
      <h2>Phiếu Xuất Vật tư (Grouped)</h2>
      <button className="add-btn" onClick={() => setShowForm(true)}>Tạo phiếu xuất</button>

      {showForm && (
        <form className="issuance-form" onSubmit={handleSubmit}>
          <h3>Tạo phiếu xuất cho 1 show</h3>

          <div className="form-group">
            <label>Chọn show (lịch làm):</label>
            <select value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)} required>
              <option value="">Chọn</option>
              {workSchedules.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.job_name || 'Lịch'} - {new Date(ws.date).toLocaleDateString()}</option>
              ))}
            </select>
          </div>

          <div className="materials-selection">
            <h4>Danh sách vật tư trong kho</h4>
            
            {/* Category Tabs */}
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>

            {/* Material List */}
            <div className="material-list-container">
              {filteredMaterials.map(m => (
                <div key={m._id} className="material-checkbox-item">
                  <div className="material-info">
                    <div className="material-name">{m.name}</div>
                    <div className="material-details">
                      <span className="material-quantity">Còn: {m.quantity} {m.unit}</span>
                      {m.category && <span className="material-category">{m.category}</span>}
                    </div>
                  </div>
                  <div className="material-actions">
                    <input 
                      type="checkbox" 
                      checked={!!selectedMaterials[m._id]} 
                      onChange={() => toggleSelect(m._id)}
                      className="material-checkbox"
                    />
                  </div>
                  {selectedMaterials[m._id] && (
                    <div className="quantity-input-wrapper">
                      <label>Số lượng xuất:</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={m.quantity} 
                        value={selectedMaterials[m._id]} 
                        onChange={e => setQty(m._id, e.target.value)}
                        className="quantity-input"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Ghi chú:</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="submit">Xuất</button>
            <button type="button" onClick={() => { setShowForm(false); setSelectedMaterials({}); setSelectedSchedule(''); setNotes(''); }}>Hủy</button>
          </div>
        </form>
      )}

      <h3>Danh sách phiếu xuất (forms)</h3>
      <table className="issuance-table">
        <thead>
          <tr>
            <th>Show</th>
            <th>Người xuất</th>
            <th>Vật tư</th>
            <th>Ngày</th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {forms.map(f => (
            <tr key={f._id}>
              <td>{f.work_schedule_id?.job_name || 'Lịch'} - {new Date(f.work_schedule_id?.date).toLocaleDateString()}</td>
              <td>{f.issued_by?.full_name}</td>
              <td>
                {f.items.map(it => `${it.material_id?.name} x ${it.quantity}`).join(', ')}
              </td>
              <td>{new Date(f.created_at).toLocaleDateString()}</td>
              <td>{f.notes}</td>
              <td>
                <button className="btn btn-sm btn-success" onClick={() => exportToExcel(f._id)}>Xuất Excel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialIssuance;