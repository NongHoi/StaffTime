import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MaterialReturn.css';

const MaterialReturn = () => {
  const [issuedForms, setIssuedForms] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [returnedItems, setReturnedItems] = useState({});
  const [lostItems, setLostItems] = useState({});
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('issued');

  useEffect(() => {
    fetchIssuedForms();
    fetchReturnHistory();
  }, []);

  const fetchIssuedForms = async () => {
    try {
      const res = await axios.get('/api/material-return/forms', { withCredentials: true });
      setIssuedForms(res.data.filter(f => f.status !== 'returned'));
    } catch (err) {
      console.error('fetchIssuedForms', err);
    }
  };

  const fetchReturnHistory = async () => {
    try {
      const res = await axios.get('/api/material-return/history', { withCredentials: true });
      setReturnHistory(res.data);
    } catch (err) {
      console.error('fetchReturnHistory', err);
    }
  };

  const handleStartReturn = (form) => {
    setSelectedForm(form);
    const initialReturned = {};
    form.items.forEach(item => {
      initialReturned[item.material_id._id] = item.quantity;
    });
    setReturnedItems(initialReturned);
    setLostItems({});
    setNotes('');
    setShowReturnForm(true);
  };

  const handleReturnedQtyChange = (materialId, qty) => {
    const newQty = parseInt(qty) || 0;
    setReturnedItems(prev => ({ ...prev, [materialId]: newQty }));
  };

  const handleLostQtyChange = (materialId, qty) => {
    const newQty = parseInt(qty) || 0;
    if (newQty > 0) {
      setLostItems(prev => ({ ...prev, [materialId]: { quantity: newQty, reason: prev[materialId]?.reason || '' } }));
    } else {
      setLostItems(prev => {
        const copy = { ...prev };
        delete copy[materialId];
        return copy;
      });
    }
  };

  const handleLostReasonChange = (materialId, reason) => {
    setLostItems(prev => ({
      ...prev,
      [materialId]: { ...prev[materialId], reason }
    }));
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    const returned_items = Object.entries(returnedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([material_id, quantity_returned]) => ({ material_id, quantity_returned }));

    const lost_items = Object.entries(lostItems)
      .filter(([_, data]) => data.quantity > 0)
      .map(([material_id, data]) => ({
        material_id,
        quantity_lost: data.quantity,
        reason: data.reason
      }));

    try {
      await axios.post(`/api/material-return/${selectedForm._id}/return`, {
        returned_items,
        lost_items,
        notes
      }, { withCredentials: true });

      alert('Nhập kho thành công');
      setShowReturnForm(false);
      setSelectedForm(null);
      setReturnedItems({});
      setLostItems({});
      setNotes('');
      fetchIssuedForms();
      fetchReturnHistory();
    } catch (err) {
      console.error('handleSubmitReturn', err);
      alert('Lỗi khi nhập kho: ' + (err.response?.data?.message || err.message));
    }
  };

  const getIssuedQuantity = (materialId) => {
    const item = selectedForm?.items.find(i => i.material_id._id === materialId);
    return item?.quantity || 0;
  };

  const getTotalReturned = (materialId) => {
    const returned = returnedItems[materialId] || 0;
    const lost = lostItems[materialId]?.quantity || 0;
    return returned + lost;
  };

  return (
    <div className="material-return">
      <h2>Nhập Kho Vật Tư</h2>

      {/* Tabs */}
      <div className="return-tabs">
        <button
          className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          Cần nhập kho ({issuedForms.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử nhập kho
        </button>
      </div>

      {/* Return Form */}
      {showReturnForm && selectedForm && (
        <form className="return-form" onSubmit={handleSubmitReturn}>
          <div className="form-header">
            <h3>Nhập kho cho: {selectedForm.work_schedule_id?.job_name} - {new Date(selectedForm.work_schedule_id?.date).toLocaleDateString()}</h3>
            <p className="form-meta">Người xuất: {selectedForm.issued_by?.full_name} | Ngày xuất: {new Date(selectedForm.created_at).toLocaleDateString()}</p>
          </div>

          <div className="return-items-container">
            {selectedForm.items.map(item => {
              const materialId = item.material_id._id;
              const issuedQty = item.quantity;
              const returnedQty = returnedItems[materialId] || 0;
              const lostQty = lostItems[materialId]?.quantity || 0;
              const totalReturned = returnedQty + lostQty;
              const isValid = totalReturned === issuedQty;

              return (
                <div key={materialId} className={`return-item ${!isValid ? 'invalid' : ''}`}>
                  <div className="item-header">
                    <h4>{item.material_id.name}</h4>
                    <span className="issued-badge">Đã xuất: {issuedQty} {item.material_id.unit}</span>
                  </div>

                  <div className="item-inputs">
                    <div className="input-group">
                      <label>Số lượng nhập lại:</label>
                      <input
                        type="number"
                        min={0}
                        max={issuedQty}
                        value={returnedQty}
                        onChange={(e) => handleReturnedQtyChange(materialId, e.target.value)}
                        className="qty-input"
                      />
                      <span className="unit">{item.material_id.unit}</span>
                    </div>

                    <div className="input-group">
                      <label>Số lượng mất:</label>
                      <input
                        type="number"
                        min={0}
                        max={issuedQty}
                        value={lostQty}
                        onChange={(e) => handleLostQtyChange(materialId, e.target.value)}
                        className="qty-input lost"
                      />
                      <span className="unit">{item.material_id.unit}</span>
                    </div>
                  </div>

                  {lostQty > 0 && (
                    <div className="lost-reason">
                      <label>Lý do mất:</label>
                      <input
                        type="text"
                        placeholder="Nhập lý do..."
                        value={lostItems[materialId]?.reason || ''}
                        onChange={(e) => handleLostReasonChange(materialId, e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="item-summary">
                    <span>Tổng: {totalReturned}/{issuedQty}</span>
                    {!isValid && <span className="error">⚠ Chưa đủ số lượng</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-group">
            <label>Ghi chú:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về tình trạng vật tư..."
            />
          </div>

          <div className="form-actions">
            <button type="submit">Xác nhận nhập kho</button>
            <button type="button" onClick={() => {
              setShowReturnForm(false);
              setSelectedForm(null);
              setReturnedItems({});
              setLostItems({});
              setNotes('');
            }}>Hủy</button>
          </div>
        </form>
      )}

      {/* Issued Forms Tab */}
      {activeTab === 'issued' && !showReturnForm && (
        <div className="forms-list">
          <h3>Danh sách show cần nhập kho</h3>
          {issuedForms.length === 0 ? (
            <div className="empty-state">
              <h4>Không có show nào cần nhập kho</h4>
              <p>Tất cả vật tư đã được nhập kho</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="return-table">
                <thead>
                  <tr>
                    <th>Show</th>
                    <th>Người xuất</th>
                    <th>Vật tư đã xuất</th>
                    <th>Ngày xuất</th>
                    <th>Ghi chú</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedForms.map(form => (
                    <tr key={form._id}>
                      <td>
                        <div className="show-info">
                          <strong>{form.work_schedule_id?.job_name || 'N/A'}</strong>
                          <span className="date">{new Date(form.work_schedule_id?.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>{form.issued_by?.full_name}</td>
                      <td>
                        <div className="materials-list">
                          {form.items.map((item, idx) => (
                            <span key={idx} className="material-chip">
                              {item.material_id.name} x {item.quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{new Date(form.created_at).toLocaleDateString()}</td>
                      <td>{form.notes || '-'}</td>
                      <td>
                        <button
                          className="btn-return"
                          onClick={() => handleStartReturn(form)}
                        >
                          Nhập kho
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Return History Tab */}
      {activeTab === 'history' && (
        <div className="history-list">
          <h3>Lịch sử nhập kho</h3>
          {returnHistory.length === 0 ? (
            <div className="empty-state">
              <h4>Chưa có lịch sử nhập kho</h4>
            </div>
          ) : (
            <div className="table-container">
              <table className="return-table">
                <thead>
                  <tr>
                    <th>Show</th>
                    <th>Người nhập</th>
                    <th>Vật tư nhập lại</th>
                    <th>Vật tư mất</th>
                    <th>Ngày nhập</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {returnHistory.map(form => (
                    <tr key={form._id}>
                      <td>
                        <div className="show-info">
                          <strong>{form.work_schedule_id?.job_name || 'N/A'}</strong>
                          <span className="date">{new Date(form.work_schedule_id?.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>{form.return_info?.returned_by?.full_name}</td>
                      <td>
                        <div className="materials-list">
                          {form.return_info?.returned_items?.map((item, idx) => (
                            <span key={idx} className="material-chip success">
                              {item.material_id?.name} x {item.quantity_returned}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="materials-list">
                          {form.return_info?.lost_items?.length > 0 ? (
                            form.return_info.lost_items.map((item, idx) => (
                              <span key={idx} className="material-chip danger" title={item.reason}>
                                {item.material_id?.name} x {item.quantity_lost}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">Không có</span>
                          )}
                        </div>
                      </td>
                      <td>{new Date(form.return_info?.returned_at).toLocaleDateString()}</td>
                      <td>{form.return_info?.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialReturn;
