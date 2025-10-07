import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Table, Form, Row, Col, Alert } from 'react-bootstrap';
import QRCode from 'qrcode';

const Attendance = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
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
  const fetchHistory = useCallback(async () => {
    let url = '';
    if (user?.type === 'fulltime') {
      // API riêng cho fulltime
      if (filterType === 'date') url = `/api/attendance/fulltime-by-date?date=${date}`;
      else if (filterType === 'month' && year && month) url = `/api/attendance/fulltime-by-month?year=${year}&month=${month}`;
      else if (filterType === 'week' && year && week) url = `/api/attendance/fulltime-by-week?year=${year}&week=${week}`;
    } else {
      if (filterType === 'date') url = `/api/attendance/my-by-date?date=${date}`;
      else if (filterType === 'month' && year && month) url = `/api/attendance/my-by-month?year=${year}&month=${month}`;
      else if (filterType === 'week' && year && week) url = `/api/attendance/my-by-week?year=${year}&week=${week}`;
    }
    if (!url) return setHistory([]);
    const res = await fetch(url);
    if (res.ok) setHistory(await res.json());
    else setHistory([]);
  }, [date, filterType, month, year, week, user]);

  useEffect(() => { fetchAttendanceDates(); }, []);
  useEffect(() => { fetchHistory(); }, [date, filterType, month, year, week, fetchHistory]);

  // Removed unused monthDates state

  // Khai báo các biến và hàm chỉ dùng cho parttime
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [outNote, setOutNote] = useState('');

  // QR code state
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrExpiryIn, setQrExpiryIn] = useState(30);
  const qrIntervalRef = useRef(null);
  const qrCountdownRef = useRef(null);

  const generateQrPayload = useCallback(() => {
    // Encode a link to the chấm công page; include a rotating param so QR changes every 30s
    const epoch = Math.floor(Date.now() / 1000);
    const windowSlot = Math.floor(epoch / 30);
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const url = new URL('/chamcong', base);
      url.searchParams.set('v', String(windowSlot));
      url.searchParams.set('d', date);
      return url.toString();
    } catch {
      // Fallback to relative url if origin not available
      return `/chamcong?v=${windowSlot}&d=${encodeURIComponent(date)}`;
    }
  }, [date]);

  const refreshQr = useCallback(async () => {
    try {
      const text = generateQrPayload();
      const dataUrl = await QRCode.toDataURL(text, { width: 220, margin: 1 });
      setQrDataUrl(dataUrl);
      setQrExpiryIn(30);
    } catch (e) {
      // silently ignore for now
    }
  }, [generateQrPayload]);

  useEffect(() => {
    // Start QR refresh cycle
    refreshQr();
    // refresh QR every 30s
    qrIntervalRef.current = setInterval(() => {
      refreshQr();
    }, 30000);
    // countdown timer each second
    qrCountdownRef.current = setInterval(() => {
      setQrExpiryIn((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (qrCountdownRef.current) clearInterval(qrCountdownRef.current);
    };
  }, [refreshQr]);

  // Chấm công show cho fulltime
  const handleCheckShow = async () => {
    setLoading(true); setMessage(''); setError('');
    try {
      const today = new Date();
      const selected = new Date(date);
      if (selected > today) {
        setError('Không thể chấm công cho ngày trong tương lai!');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/attendance/checkin-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note: outNote })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chấm công thất bại');
      setMessage('Chấm công show thành công!');
      setOutNote('');
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chấm công in cho parttime
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
            {user?.type === 'fulltime' ? (
              <>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control type="text" value={outNote} onChange={e => setOutNote(e.target.value)} placeholder="Ghi chú (nếu có)" />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label style={{ visibility: 'hidden' }}>.</Form.Label>
                    <Button variant="primary" className="w-100" style={{ background: '#6c63ff', border: 'none', height: 'calc(1.5em + 0.75rem + 2px)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleCheckShow} disabled={loading}>
                      Chấm công show hôm nay
                    </Button>
                  </Form.Group>
                </Col>
              </>
            ) : (
              <>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Giờ vào</Form.Label>
                    <Form.Control type="time" value={inTime} onChange={e => setInTime(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label style={{ visibility: 'hidden' }}>.</Form.Label>
                    <Button variant="primary" className="w-100" style={{ background: '#6c63ff', border: 'none', height: 'calc(1.5em + 0.75rem + 2px)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleCheckIn} disabled={loading || !inTime}>
                      Vào
                    </Button>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Giờ ra</Form.Label>
                    <Form.Control type="time" value={outTime} onChange={e => setOutTime(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label style={{ visibility: 'hidden' }}>.</Form.Label>
                    <Button variant="primary" className="w-100" style={{ background: '#6c63ff', border: 'none', height: 'calc(1.5em + 0.75rem + 2px)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleCheckOut} disabled={loading || !outTime}>
                     Ra
                    </Button>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Ghi chú ra</Form.Label>
                    <Form.Control type="text" value={outNote} onChange={e => setOutNote(e.target.value)} placeholder="Ghi chú khi ra (nếu có)" />
                  </Form.Group>
                </Col>
              </>
            )}
          </Form>
          <div className="mt-2">
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
          </div>
        </Card.Body>
      </Card>
      {/* QR Check-in Section */}
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <h5 className="mb-3">Chấm công bằng QR</h5>
          <Row className="align-items-center g-3">
            <Col md={3} sm={12} className="text-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="attendance-qr" style={{ width: 220, height: 220, borderRadius: 12, border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: 220, height: 220, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: 12 }}>
                  Đang tạo QR...
                </div>
              )}
            </Col>
            <Col md={9} sm={12}>
              <p className="mb-1">Mã QR dành cho tài khoản của bạn và ngày: <b>{new Date(date).toLocaleDateString('vi-VN')}</b></p>
              <p className="text-muted mb-2">Mã sẽ tự động thay đổi mỗi 30 giây để bảo mật. Vui lòng đưa mã này cho thiết bị quét để chấm công.</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Button variant="outline-primary" size="sm" onClick={refreshQr}>Làm mới ngay</Button>
                <span className="text-muted">Hết hạn trong: {qrExpiryIn}s</span>
              </div>
            </Col>
          </Row>
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
                <th>Ngày</th>
                {user?.type === 'fulltime' ? (
                  <th>Ghi chú</th>
                ) : (
                  <>
                    <th>Giờ vào</th>
                    <th>Giờ ra</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={user?.type === 'fulltime' ? 3 : (filterType === 'month' ? 6 : 5)} className="text-center">Không có dữ liệu</td></tr>}
              {history.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString('vi-VN') : ''}</td>
                  {user?.type === 'fulltime' ? (
                    <td>{item.note || ''}</td>
                  ) : (
                    <>
                      <td>{item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                      <td>{item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                      <td>{item.note || ''}</td>
                      <td>
                        {!item.check_out && (
                          <Button size="sm" variant="outline-primary" onClick={() => handleCheckOut(item.id)} disabled={loading || !outTime}>
                            Chấm công out
                          </Button>
                        )}
                      </td>
                    </>
                  )}
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
