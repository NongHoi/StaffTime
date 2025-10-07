import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Form, Row, Col } from 'react-bootstrap';

function SavedPayrolls({ users }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Create user mapping for display
  const userMap = {};
  if (users && users.length) {
    users.forEach(u => { userMap[u.id] = u; });
  }

  const fetchPayrolls = (user_id) => {
    setError('');
    setLoading(true);
    setPayrolls([]);
    if (!user_id) return;
    setLoading(true);
    fetch(`/api/payroll/user/${user_id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Lỗi tải dữ liệu'))
      .then(data => setPayrolls(data))
      .catch(() => setError('Không thể tải bảng lương đã lưu.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedUser) fetchPayrolls(selectedUser);
  }, [selectedUser]);

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Bảng lương đã lưu</h5>
        <Row className="mb-3">
          <Col xs={12} md={6}>
            <Form.Select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {users && users.map(u => (
                <option key={u.id} value={u.id}>{u.fullname || u.username}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="table-responsive">
          <Table bordered hover size="sm" className="align-middle text-center" style={{marginBottom:0}}>
            <thead>
              <tr>
                <th>Tháng/Năm</th>
                <th>Giờ ngày</th>
                <th>Giờ đêm</th>
                <th>Lương ngày</th>
                <th>Lương đêm</th>
                <th>Phụ cấp</th>
                <th>Thưởng</th>
                <th>Tổng</th>
                <th>Ngày lưu</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 && <tr><td colSpan={9}>Chưa có bảng lương nào</td></tr>}
              {payrolls.map(p => (
                <tr key={p.id}>
                  <td>{p.month}/{p.year}</td>
                  <td>{p.total_day}</td>
                  <td>{p.total_night}</td>
                  <td>{p.day_shift_rate}</td>
                  <td>{p.night_shift_rate}</td>
                  <td>{p.allowance}</td>
                  <td>{p.bonus}</td>
                  <td style={{fontWeight:'bold'}}>{p.total}</td>
                  <td>{new Date(p.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SavedPayrolls;
