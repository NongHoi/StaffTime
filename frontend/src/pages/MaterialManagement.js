import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MaterialManagement.css';

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit: '',
    category: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/materials', { withCredentials: true });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      alert('Lỗi khi tải danh sách vật tư: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await axios.put(`/api/materials/${editingMaterial._id}`, formData, { withCredentials: true });
      } else {
        await axios.post('/api/materials', formData, { withCredentials: true });
      }
      fetchMaterials();
      setShowForm(false);
      setEditingMaterial(null);
      setFormData({ name: '', description: '', quantity: 0, unit: '', category: '' });
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Lỗi khi lưu vật tư: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description,
      quantity: material.quantity,
      unit: material.unit,
      category: material.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa vật tư này?')) {
      try {
        await axios.delete(`/api/materials/${id}`, { withCredentials: true });
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Lỗi khi xóa vật tư: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getQuantityClass = (quantity) => {
    if (quantity <= 10) return 'quantity-low';
    if (quantity <= 50) return 'quantity-medium';
    return 'quantity-high';
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = materials.length;
  const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
  const lowStockItems = materials.filter(m => m.quantity <= 10).length;

  return (
    <div className="material-management">
      <div className="material-management-container">
        <h2>Quản lý Vật tư</h2>

        <div className="material-stats">
          <div className="stat-card">
            <h3>Tổng loại vật tư</h3>
            <div className="stat-value">{totalItems}</div>
          </div>
          <div className="stat-card">
            <h3>Tổng số lượng</h3>
            <div className="stat-value">{totalQuantity}</div>
          </div>
          <div className="stat-card">
            <h3>Sắp hết hàng</h3>
            <div className="stat-value" style={{color: lowStockItems > 0 ? '#dc3545' : '#28a745'}}>{lowStockItems}</div>
          </div>
        </div>

        <div className="material-actions">
          <button onClick={() => { setShowForm(true); setEditingMaterial(null); setFormData({ name: '', description: '', quantity: 0, unit: '', category: '' }); }} className="add-btn">
            Thêm Vật tư
          </button>
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm vật tư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="material-form">
            <h3>{editingMaterial ? 'Sửa Vật tư' : 'Thêm Vật tư Mới'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên vật tư *</label>
                <input
                  type="text"
                  placeholder="Nhập tên vật tư"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số lượng *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Đơn vị *</label>
                <input
                  type="text"
                  placeholder="VD: cái, hộp, kg..."
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <input
                  type="text"
                  placeholder="VD: Điện tử, Văn phòng..."
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả chi tiết về vật tư..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit">{editingMaterial ? 'Cập nhật' : 'Thêm mới'}</button>
              <button type="button" onClick={() => {setShowForm(false); setEditingMaterial(null);}}>Hủy</button>
            </div>
          </form>
        )}

        <div className="material-table-container">
          <table className="material-table">
            <thead>
              <tr>
                <th>Tên Vật Tư</th>
                <th>Mô Tả</th>
                <th>Số Lượng</th>
                <th>Đơn Vị</th>
                <th>Danh Mục</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map(material => (
                  <tr key={material._id}>
                    <td><strong>{material.name}</strong></td>
                    <td>{material.description || '—'}</td>
                    <td>
                      <span className={`quantity-badge ${getQuantityClass(material.quantity)}`}>
                        {material.quantity}
                      </span>
                    </td>
                    <td>{material.unit}</td>
                    <td>
                      {material.category ? (
                        <span className="category-badge">{material.category}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(material)}>Sửa</button>
                        <button className="btn-delete" onClick={() => handleDelete(material._id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div>
                      <h3>Chưa có vật tư nào</h3>
                      <p>Hãy thêm vật tư đầu tiên của bạn</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialManagement;