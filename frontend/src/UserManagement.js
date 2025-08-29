import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import SalaryConfigModal from './SalaryConfigModal';
import UserEditModal from './UserEditModal';

const roleMap = { 1: 'Admin', 2: 'Manager', 3: 'User' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
    else setUsers([]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (userId, roleId) => {
    setError(''); setMessage('');
    const res = await fetch('/api/admin/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roleId })
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi');
    else { setMessage('Cập nhật quyền thành công!'); fetchUsers(); }
  };

  const handleChangeType = async (userId, type) => {
    setError(''); setMessage('');
    const res = await fetch('/api/admin/change-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type })
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi');
    else { setMessage('Cập nhật loại thành công!'); fetchUsers(); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhân viên này?')) return;
    setError(''); setMessage('');
    const res = await fetch('/api/admin/remove-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
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
              <th>Quyền</th>
              <th>Loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={8} className="text-center">Không có dữ liệu</td></tr>}
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.fullname}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.bank_account_number || ''}</td>
                <td>{user.bank_name || ''}</td>
                <td>
                  <Form.Select size="sm" value={user.role_id} onChange={e => handleChangeRole(user.id, Number(e.target.value))}>
                    <option value={1}>Admin</option>
                    <option value={2}>Manager</option>
                    <option value={3}>User</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Select size="sm" value={user.type} onChange={e => handleChangeType(user.id, e.target.value)}>
                    <option value="parttime">Parttime</option>
                    <option value="fulltime">Fulltime</option>
                  </Form.Select>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setSelectedUser(user); setShowSalaryModal(true); }}>
                    Cấu hình lương
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(user.id)}>
                    Xóa
                  </Button>
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
