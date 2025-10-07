import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function ChamCong() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const todayYMD = () => new Date().toISOString().slice(0, 10);
  const qrDate = useMemo(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const d = sp.get('d');
      // basic yyyy-mm-dd validation
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      return todayYMD();
    } catch {
      return todayYMD();
    }
  }, []);
  const nowHM = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // 1) Login to create a session
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Đăng nhập thất bại');

      // 2) Determine user type
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      const meData = await meRes.json();
      if (!meRes.ok || !meData?.authenticated) throw new Error('Không lấy được thông tin người dùng');
      const userType = meData.user?.type || 'parttime';

      // 3) Perform check-in/out depending on type and current state
      const date = qrDate;
      let checkRes, checkData;
      if (userType === 'fulltime') {
        checkRes = await fetch('/api/attendance/checkin-show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ date })
        });
        checkData = await checkRes.json();
        if (!checkRes.ok) throw new Error(checkData.message || 'Chấm công show thất bại');
        setMessage('Chấm công show thành công!');
      } else {
        // PARTTIME: toggle check-in/out
        // 3.1) Fetch today's attendance to see if there's an open check-in
        const listRes = await fetch(`/api/attendance/my-by-date?date=${encodeURIComponent(date)}`, { credentials: 'include' });
        let openRecord = null;
        if (listRes.ok) {
          const list = await listRes.json();
          openRecord = Array.isArray(list) ? list.find(it => it.status === 'checked_in' && !it.check_out) : null;
        }

        if (openRecord) {
          // Do checkout
          const time = nowHM();
          checkRes = await fetch('/api/attendance/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ attendance_id: openRecord.id, check_out: `${date}T${time}`, note: 'QR checkout' })
          });
          checkData = await checkRes.json();
          if (!checkRes.ok) throw new Error(checkData.message || 'Chấm công out thất bại');
          setMessage('Chấm công out thành công!');
        } else {
          // Do checkin
          const time = nowHM();
          checkRes = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ date, check_in: `${date}T${time}` })
          });
          checkData = await checkRes.json();
          if (!checkRes.ok) throw new Error(checkData.message || 'Chấm công in thất bại');
          setMessage('Chấm công in thành công!');
        }
      }

      // 4) Logout to avoid persisting session on kiosk
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setPassword('');
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#f7f7fb' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow border-0 rounded-4">
              <Card.Body className="p-4">
                <h4 className="mb-3 text-center">Chấm công nhanh</h4>
                <p className="text-muted text-center mb-4">Nhập tài khoản để chấm công ngay</p>
                <Form onSubmit={handleCheckIn}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      autoFocus
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      required
                    />
                  </Form.Group>
                  <Button type="submit" className="w-100" style={{ background: '#6c63ff', border: 'none' }} disabled={loading}>
                    {loading ? (<><Spinner size="sm" className="me-2" /> Đang chấm công...</>) : 'Chấm công ngay'}
                  </Button>
                </Form>
                <div className="mt-3">
                  {message && <Alert variant="success" className="mb-0">{message}</Alert>}
                  {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
                </div>
                <div className="text-center text-muted mt-3" style={{ fontSize: 12 }}>
                  Ngày: {new Date().toLocaleDateString('vi-VN')} • Giờ hệ thống: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ChamCong;
