import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Row, Col, Form } from 'react-bootstrap';


function MyRegisteredWorkSchedule({ user }) {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const fetchMySchedules = (y, m) => {
    setError('');
    fetch(`/api/work-schedule/my-registrations?year=${y}&month=${m}`)
      .then(async res => {
        if (res.ok) return res.json();
        const text = await res.text();
        console.error('API error:', res.status, text);
        throw new Error(text || 'Lỗi tải dữ liệu');
      })
      .then(data => setSchedules(data))
      .catch(err => setError('Không thể tải lịch làm đã đăng ký.\n' + (err.message || '')));
  };

  useEffect(() => {
    fetchMySchedules(year, month);
  }, [year, month]);

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Lịch làm đã đăng ký</h5>
        <Row className="mb-3">
          <Col xs="auto">
            <Form.Select value={month} onChange={e => setMonth(Number(e.target.value))}>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>Tháng {i+1}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto">
            <Form.Select value={year} onChange={e => setYear(Number(e.target.value))}>
              {[...Array(10)].map((_, i) => {
                const y = today.getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </Form.Select>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="table-responsive">
          <Table bordered hover size="sm" className="align-middle text-center" style={{marginBottom:0}}>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tên công việc</th>
                <th>Giờ bắt đầu</th>
                <th>Địa điểm</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && <tr><td colSpan={5}>Chưa đăng ký lịch làm nào</td></tr>}
              {schedules.map(sch => (
                <tr key={sch.id}>
                  <td>{new Date(sch.date).toLocaleDateString('vi-VN')}</td>
                  <td>{sch.job_name}</td>
                  <td>{sch.start_time}</td>
                  <td>{sch.location}</td>
                  <td>{sch.note}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default MyRegisteredWorkSchedule;
