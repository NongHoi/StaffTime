import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Alert } from 'react-bootstrap';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [outNote, setOutNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Bộ lọc
  const [filterType, setFilterType] = useState('date'); // date, month, week
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [month, setMonth] = useState(() => (new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [week, setWeek] = useState('');


  // Lấy danh sách ngày đã chấm công
  const fetchAttendanceDates = async () => {
    const res = await fetch('/api/attendance/my-dates');
    if (res.ok) setAttendanceDates(await res.json());
    else setAttendanceDates([]);
  };

  // Lấy dữ liệu chấm công theo bộ lọc
  const fetchHistory = async () => {
    let url = '';
    if (filterType === 'date') url = `/api/attendance/my-by-date?date=${date}`;
    else if (filterType === 'month' && year && month) url = `/api/attendance/my-by-month?year=${year}&month=${month}`;
    else if (filterType === 'week' && year && week) url = `/api/attendance/my-by-week?year=${year}&week=${week}`;
    if (!url) return setHistory([]);
    const res = await fetch(url);
    if (res.ok) setHistory(await res.json());
    else setHistory([]);
  };

  useEffect(() => { fetchAttendanceDates(); }, []);
  useEffect(() => { fetchHistory(); }, [date, filterType, month, year, week]);

  // Lấy danh sách ngày đã chấm công trong tháng khi chọn bộ lọc tháng
  const [monthDates, setMonthDates] = useState([]);
  useEffect(() => {
    if (filterType === 'month' && year && month) {
      // Lọc attendanceDates theo tháng/năm
      const filtered = attendanceDates.filter(d => {
        const dt = new Date(d);
        return dt.getFullYear().toString() === year && (dt.getMonth() + 1).toString().padStart(2, '0') === month;
      });
      setMonthDates(filtered);
    } else {
      setMonthDates([]);
    }
  }, [filterType, year, month, attendanceDates]);

  const handleCheckIn = async () => {
    setLoading(true); setMessage(''); setError('');
    try {
      // Không cho phép chấm công ngày tiếp theo của hôm nay
      const today = new Date();
      const selected = new Date(date);
      if (selected > today) {
        setError('Không thể chấm công cho ngày trong tương lai!');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_in: `${date}T${inTime}`, date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chấm công thất bại');
      setMessage('Chấm công in thành công!');
      setInTime('');
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (attendance_id) => {
    setLoading(true); setMessage(''); setError('');
    try {
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_id, check_out: `${date}T${outTime}`, note: outNote })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chấm công thất bại');
      setMessage('Chấm công out thành công!');
      setOutTime('');
      setOutNote('');
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <h5 className="mb-3">Chấm công trong ngày</h5>
          <Form as={Row} className="g-2 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ngày</Form.Label>
                <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Giờ vào</Form.Label>
                <Form.Control type="time" value={inTime} onChange={e => setInTime(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="primary" style={{ background: '#6c63ff', border: 'none' }} onClick={handleCheckIn} disabled={loading || !inTime}>
                Chấm công in
              </Button>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Giờ ra</Form.Label>
                <Form.Control type="time" value={outTime} onChange={e => setOutTime(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ghi chú ra</Form.Label>
                <Form.Control type="text" value={outNote} onChange={e => setOutNote(e.target.value)} placeholder="Ghi chú khi ra (nếu có)" />
              </Form.Group>
            </Col>
          </Form>
          <div className="mt-2">
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
          </div>
        </Card.Body>
      </Card>
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body>
          {/* Bộ lọc */}
          <Form as={Row} className="g-2 align-items-end mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Bộ lọc</Form.Label>
                <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="date">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="week">Theo tuần</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {/* Bỏ ô chọn ngày trong bộ lọc ngày */}
            {filterType === 'month' && (
              <>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Tháng</Form.Label>
                    <Form.Select value={month} onChange={e => setMonth(e.target.value)}>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={(i+1).toString().padStart(2, '0')}>{i+1}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Năm</Form.Label>
                    <Form.Control type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max="2100" />
                  </Form.Group>
                </Col>
                {/* Bỏ ô lọc ngày đã chấm */}
              </>
            )}
            {filterType === 'week' && (
              <>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Tuần</Form.Label>
                    <Form.Control type="number" value={week} onChange={e => setWeek(e.target.value)} min="1" max="53" placeholder="1-53" />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Năm</Form.Label>
                    <Form.Control type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max="2100" />
                  </Form.Group>
                </Col>
              </>
            )}
          </Form>
          <h5 className="mb-3">Lịch sử chấm công</h5>
          <Table hover responsive size="sm">
            <thead>
              <tr>
                <th>#</th>
                {filterType === 'month' && <th>Ngày đã chấm</th>}
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                {/* Không cần loại ca */}
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={filterType === 'month' ? 6 : 5} className="text-center">Không có dữ liệu</td></tr>}
              {history.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  {filterType === 'month' && <td>{item.check_in ? new Date(item.check_in).toLocaleDateString('vi-VN') : ''}</td>}
                  <td>{item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  <td>{item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  {/* Không cần loại ca */}
                  <td>{item.note || ''}</td>
                  <td>
                    {!item.check_out && (
                      <Button size="sm" variant="outline-primary" onClick={() => handleCheckOut(item.id)} disabled={loading || !outTime}>
                        Chấm công out
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
};

export default Attendance;
