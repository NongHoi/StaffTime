import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, Alert } from 'react-bootstrap';
import SalaryConfigModal from '../components/SalaryConfigModal';
import UserEditModal from '../components/UserEditModal';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
    else setUsers([]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (userId, roleId) => {
    setError(''); setMessage('');
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi');
    else { setMessage('Cập nhật quyền thành công!'); fetchUsers(); }
  };

  const handleChangeType = async (userId, type) => {
    setError(''); setMessage('');
    const res = await fetch(`/api/users/${userId}/type`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi');
    else { setMessage('Cập nhật loại thành công!'); fetchUsers(); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhân viên này?')) return;
    setError(''); setMessage('');
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi');
    else { setMessage('Đã xóa nhân viên!'); fetchUsers(); }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Quản lý nhân viên</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Table hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Số tài khoản</th>
              <th>Tên ngân hàng</th>
              {user?.role_id === 1 && <th>Quyền</th>}
              <th>Loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={user?.role_id === 1 ? 10 : 9} className="text-center">Đang tải...</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={user?.role_id === 1 ? 10 : 9} className="text-center">Không có dữ liệu</td></tr>}
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <span 
                    title={u.id} 
                    style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.85rem',
                      color: 'var(--gray-600)'
                    }}
                  >
                    {u.id.substring(0, 8)}...
                  </span>
                </td>
                <td>{u.username}</td>
                <td><strong>{u.fullname}</strong></td>
                <td>{u.phone}</td>
                <td>{u.email}</td>
                <td>{u.bank_account_number || ''}</td>
                <td>{u.bank_name || ''}</td>
                {user?.role_id === 1 && (
                  <td>
                    <Form.Select size="sm" value={u.role_id} onChange={e => handleChangeRole(u.id, Number(e.target.value))}>
                      <option value={1}>Admin</option>
                      <option value={2}>Manager</option>
                      <option value={3}>User</option>
                    </Form.Select>
                  </td>
                )}
                <td>
                  <Form.Select
                    size="sm"
                    value={u.type}
                    onChange={e => handleChangeType(u.id, e.target.value)}
                    disabled={user?.role_id !== 1 && u.role_id === 1}
                  >
                    <option value="parttime">Parttime</option>
                    <option value="fulltime">Fulltime</option>
                  </Form.Select>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setSelectedUser(u); setShowSalaryModal(true); }}>
                    Cấu hình lương
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => { setEditUser(u); setShowEditModal(true); }}>
                    Sửa
                  </Button>
                  {user?.role_id === 1 && (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(u.id)}>
                      Xóa
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
  <SalaryConfigModal show={showSalaryModal} onHide={() => setShowSalaryModal(false)} user={selectedUser} onSave={() => setShowSalaryModal(false)} />
  <UserEditModal show={showEditModal} onHide={() => setShowEditModal(false)} user={editUser} onSave={() => { setShowEditModal(false); fetchUsers(); }} />
      </Card.Body>
    </Card>
  );
};

export default UserManagement;
