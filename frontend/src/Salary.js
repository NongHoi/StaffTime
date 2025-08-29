import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert, Table } from 'react-bootstrap';

const Salary = ({ user }) => {
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [type, setType] = useState('parttime');
  const [selectedUser, setSelectedUser] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [result, setResult] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [nightStart, setNightStart] = useState('');
  const [nightEnd, setNightEnd] = useState('');
  const [nightMsg, setNightMsg] = useState('');
  const [nightErr, setNightErr] = useState('');
  const [allowance, setAllowance] = useState('');
  const [bonus, setBonus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách nhân viên
    const fetchUsers = async () => {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
      else setUsers([]);
    };
    fetchUsers();
  }, []);

  // Khi chọn userId, cập nhật selectedUser và lấy ngày công tháng
  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
      setAttendance([]);
      return;
    }
    const user = users.find(u => String(u.id) === String(userId));
    setSelectedUser(user || null);
    // Lấy ngày công tháng cho user được chọn (admin/manager)
    const fetchAttendance = async () => {
      const res = await fetch(`/api/admin/attendance-by-month?user_id=${userId}&year=${year}&month=${month}`);
      if (res.ok) setAttendance(await res.json());
      else setAttendance([]);
    };
    fetchAttendance();
  }, [userId, users, year, month]);

  // Khi chọn userId, cập nhật selectedUser
  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
      return;
    }
    const user = users.find(u => String(u.id) === String(userId));
    setSelectedUser(user || null);
  }, [userId, users]);

  const handleCalc = async () => {
    setError(''); setResult(null); setLoading(true);
    try {
      // Always send allowance and bonus as numbers
      const allowanceNum = allowance === '' ? 0 : Number(allowance);
      const bonusNum = bonus === '' ? 0 : Number(bonus);
      const res = await fetch(`/api/salary/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, month, year, night_shift_start: nightStart, night_shift_end: nightEnd, allowance: allowanceNum, bonus: bonusNum })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tính lương thất bại');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lưu cố định giờ đêm
  const handleSaveNight = async (e) => {
    e.preventDefault();
    setNightMsg(''); setNightErr('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ night_shift_start: nightStart, night_shift_end: nightEnd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lưu thất bại');
      setNightMsg('Lưu giờ đêm thành công!');
    } catch (err) {
      setNightErr(err.message);
    }
  };

  // Chỉ cho phép admin/manager xem trang này
  if (!user || (user.role_id !== 1 && user.role_id !== 2)) return null;

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Tính lương nhân viên</h5>
        <Form as={Row} className="g-2 align-items-end mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Nhân viên</Form.Label>
              <Form.Select value={userId} onChange={e => setUserId(e.target.value)} required>
                <option value="">Chọn nhân viên</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullname} ({u.username})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Loại</Form.Label>
              <Form.Select value={type} onChange={e => setType(e.target.value)}>
                <option value="parttime">Parttime</option>
                <option value="fulltime">Fulltime</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Tháng</Form.Label>
              <Form.Control type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Năm</Form.Label>
              <Form.Control type="number" min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} />
            </Form.Group>
          </Col>
          {/* Bỏ nhập giờ đêm ở đây, chuyển xuống dưới */}
          <Col md={2}>
            <Form.Group>
              <Form.Label>Phụ cấp</Form.Label>
              <Form.Control type="number" value={allowance} onChange={e => setAllowance(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Chuyên cần/Thưởng</Form.Label>
              <Form.Control type="number" value={bonus} onChange={e => setBonus(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button variant="primary" style={{ background: '#6c63ff', border: 'none' }} onClick={handleCalc} disabled={loading || !userId}>
              Tính lương
            </Button>
          </Col>
        </Form>
        {error && <Alert variant="danger">{error}</Alert>}
        {result && (
          <Table bordered hover responsive size="sm" className="mt-3">
            <tbody>
              {type === 'parttime' ? (
                <>
                  <tr><td>Tổng giờ ngày</td><td>{Number(result.totalDay).toFixed(1)}</td></tr>
                  <tr><td>Tổng giờ đêm</td><td>{Number(result.totalNight).toFixed(1)}</td></tr>
                  <tr><td>Giá giờ ngày</td><td>{result.day_shift_rate}</td></tr>
                  <tr><td>Giá giờ đêm</td><td>{result.night_shift_rate}</td></tr>
                  <tr><td>Phụ cấp</td><td>{Number(allowance || 0).toLocaleString('vi-VN')}</td></tr>
                  <tr><td>Chuyên cần/Thưởng</td><td>{Number(bonus || 0).toLocaleString('vi-VN')}</td></tr>
                  <tr>
                    <td><b>Tổng lương</b></td>
                    <td><b>{
                      (
                        Number(result.totalDay) * Number(result.day_shift_rate || 0) +
                        Number(result.totalNight) * Number(result.night_shift_rate || 0) +
                        Number(allowance || 0) +
                        Number(bonus || 0)
                      ).toLocaleString('vi-VN')
                    } đồng</b></td>
                  </tr>
                </>
              ) : (
                <>
                  <tr><td>Lương cứng</td><td>{result.base_salary}</td></tr>
                  <tr><td>Số show</td><td>{result.show_count}</td></tr>
                  <tr><td>Tổng lương show</td><td>{result.total_show_salary}</td></tr>
                  <tr><td>Phụ cấp</td><td>{result.allowance}</td></tr>
                  <tr><td>Chuyên cần/Thưởng</td><td>{result.bonus}</td></tr>
                  <tr><td><b>Tổng lương</b></td><td><b>{Number(result.total).toLocaleString('vi-VN')} đồng</b></td></tr>
                </>
              )}
            </tbody>
          </Table>
        )}
        {/* Cấu hình giờ đêm cố định */}
        {/* <Form as={Row} className="g-2 align-items-end mb-3" onSubmit={handleSaveNight}>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Bắt đầu giờ đêm</Form.Label>
              <Form.Control type="time" value={nightStart} onChange={e => setNightStart(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Kết thúc giờ đêm</Form.Label>
              <Form.Control type="time" value={nightEnd} onChange={e => setNightEnd(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" style={{ background: '#6c63ff', border: 'none' }}>Lưu giờ đêm</Button>
          </Col>
          <Col md={6}>
            {nightMsg && <Alert variant="success" className="py-1 my-1">{nightMsg}</Alert>}
            {nightErr && <Alert variant="danger" className="py-1 my-1">{nightErr}</Alert>}
          </Col>
        </Form> */}
        <h6 className="mt-4">Nhân viên đã chọn</h6>
        {selectedUser && (
          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Lương ngày</th>
                <th>Lương đêm</th>
                <th>Số tài khoản</th>
                <th>Tên ngân hàng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedUser.id}</td>
                <td>{selectedUser.fullname}</td>
                <td>{selectedUser.day_shift_rate || ''}</td>
                <td>{selectedUser.night_shift_rate || ''}</td>
                <td>{selectedUser.bank_account_number || ''}</td>
                <td>{selectedUser.bank_name || ''}</td>
                <td>{selectedUser.total || ''}</td>
              </tr>
            </tbody>
          </Table>
        )}

        {/* Bảng ngày công tháng của nhân viên đã chọn */}
        {selectedUser && (
          <>
            <h6 className="mt-4">Ngày công trong tháng</h6>
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={4}>Không có dữ liệu</td></tr>
                ) : attendance.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.date ? new Date(a.date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>{a.check_in ? new Date(a.check_in).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                    <td>{a.check_out ? new Date(a.check_out).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                    <td>{a.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default Salary;
