
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';

function RegisterWorkSchedule() {
  const now = new Date();
  const [schedules, setSchedules] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  // ...existing code...

  // Lấy lịch làm theo tháng được chọn
  useEffect(() => {
    fetch(`/api/work-schedule/month?year=${year}&month=${month}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setSchedules(data));
  }, [year, month]);

  // Lấy danh sách lịch đã đăng ký của user
  useEffect(() => {
    fetch('/api/work-schedule/my-registrations')
      .then(res => res.ok ? res.json() : [])
      .then(data => setMyRegistrations(data.map(sch => sch.id)));
  }, [year, month]);

  // Đăng ký lịch làm
  const handleRegister = async (schedule_id) => {
    setError('');
    setMessage('');
    const res = await fetch('/api/work-schedule/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule_id })
    });
    if (res.ok) {
      setMessage('Đăng ký thành công!');
      setMyRegistrations(ids => [...ids, schedule_id]);
    } else {
      const data = await res.json();
      setError(data.message || 'Lỗi đăng ký');
    }
  };

  // Lấy danh sách ngày có lịch làm trong tháng (YYYY-MM-DD)
  // ...existing code...

  // Hiệu ứng chấm đỏ trên calendar
  // ...existing code...
  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Đăng ký lịch làm trong tháng</h5>
        <Row className="mb-3">
          <Col xs={6} md={3}>
            <Form.Label>Tháng</Form.Label>
            <Form.Control type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} />
          </Col>
          <Col xs={6} md={3}>
            <Form.Label>Năm</Form.Label>
            <Form.Control type="number" min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} />
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <div className="table-responsive">
          <Table bordered hover size="sm" className="align-middle text-center">
            <thead>
              <tr>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Ngày</th>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Tên công việc</th>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Giờ bắt đầu</th>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Địa điểm</th>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Ghi chú</th>
                <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && <tr><td colSpan={6}>Không có lịch làm</td></tr>}
              {schedules.map(sch => (
                <tr key={sch.id}>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{new Date(sch.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.job_name}</td>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.start_time ? sch.start_time.slice(0,5) : ''}</td>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.location}</td>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.note}</td>
                  <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>
                    {myRegistrations.includes(sch.id)
                      ? <span className="text-success fw-bold">Đã đăng ký</span>
                      : <Button size="sm" onClick={() => handleRegister(sch.id)}>Đăng ký</Button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default RegisterWorkSchedule;
