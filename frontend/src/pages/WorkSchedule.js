
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Định dạng giờ sang 24h (HH:mm), tự động nhận biết 12h (AM/PM) hoặc 24h
function format24h(timeStr) {
  if (!timeStr) return '';
  // Nếu có AM/PM
  const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})(?:\s)?(AM|PM)/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  // Nếu là HH:mm hoặc HH:mm:ss
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}


function WorkSchedule({ user }) {
  // State
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal tạo/sửa lịch làm
  const [showViewRegModal, setShowViewRegModal] = useState(false); // Modal xem đăng ký
  const [modalDate, setModalDate] = useState('');
  const [form, setForm] = useState({ job_name: '', start_time: '', location: '', note: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null); // Lịch đang sửa
  const [viewRegSchedule, setViewRegSchedule] = useState(null); // Lịch đang xem đăng ký
  const [registrations, setRegistrations] = useState([]);
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [myRegistrations, setMyRegistrations] = useState([]); // Lưu id các lịch đã đăng ký

  // Sửa lịch làm: mở modal, điền dữ liệu
  function handleEditSchedule(schedule) {
    setModalDate(schedule.date);
    setForm({
      job_name: schedule.job_name || '',
      start_time: schedule.start_time || '',
      location: schedule.location || '',
      note: schedule.note || ''
    });
    setShowModal(true);
    setError('');
    setSelectedSchedule(schedule); // Đánh dấu đang sửa
  }

  // Hàm xử lý xóa lịch làm
  async function handleDeleteSchedule(schedule) {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch làm này?')) {
      try {
        const res = await fetch(`/api/work-schedule/${schedule.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          setMessage('Đã xóa lịch làm!');
          await fetchSchedules();
        } else {
          const data = await res.json();
          setError(data.message || 'Lỗi xóa lịch');
        }
      } catch (err) {
        setError('Lỗi xóa lịch');
      }
    }
  }

  // Lấy lịch làm theo tháng dựa trên calendarValue
  const fetchSchedules = useCallback(async (date = calendarValue) => {
    const d = date;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const res = await fetch(`/api/work-schedule/month?year=${year}&month=${month}`);
    if (res.ok) setSchedules(await res.json());
    else setSchedules([]);
  }, [calendarValue]);
  useEffect(() => { fetchSchedules(); }, [calendarValue, fetchSchedules]);

  // Lấy danh sách lịch đã đăng ký của user (chỉ cho nhân viên)
  useEffect(() => {
    if (user.role_id === 3) {
      fetch('/api/work-schedule/my-registrations')
        .then(res => res.ok ? res.json() : [])
        .then(data => setMyRegistrations(data.map(sch => sch.id)));
    }
  }, [calendarValue, user.role_id]);

  // Khi chọn ngày trên lịch
  // Helper: format date to YYYY-MM-DD in local time
  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleCalendarChange = (date) => {
    setCalendarValue(date);
    setModalDate(formatDateLocal(date));
    setForm({ job_name: '', start_time: '', location: '', note: '' });
    setShowModal(true);
    setError('');
    setSelectedSchedule(null);
  };


  // Gửi tạo/sửa lịch làm
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setError('');
    const isEdit = !!selectedSchedule;
    const url = isEdit ? `/api/work-schedule/${selectedSchedule.id}` : '/api/work-schedule';
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit ? form : { ...form, date: modalDate };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setShowModal(false);
      setMessage(isEdit ? 'Cập nhật lịch làm thành công!' : 'Tạo lịch làm thành công!');
      setSelectedSchedule(null);
      await fetchSchedules();
    } else {
      const data = await res.json();
      setError(data.message || (isEdit ? 'Lỗi cập nhật lịch' : 'Lỗi tạo lịch'));
    }
  };

  // Đăng ký lịch làm
  const handleRegister = async (schedule_id) => {
    const res = await fetch('/api/work-schedule/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule_id })
    });
    if (res.ok) {
      setMessage('Đăng ký thành công!');
  // fetchSchedules(); // Đã được gọi trong useEffect
    } else {
      const data = await res.json();
      setError(data.message || 'Lỗi đăng ký');
    }
  };


  // Xem danh sách nhân viên đã đăng ký
  const handleViewRegistrations = async (schedule) => {
    setViewRegSchedule(schedule);
    setShowViewRegModal(true);
    const res = await fetch(`/api/work-schedule/${schedule.id}/registrations`);
    if (res.ok) setRegistrations(await res.json());
    else setRegistrations([]);
  };


  // Định dạng giờ sang 24h (HH:mm)
  function format24h(timeStr) {
    if (!timeStr) return '';
    // Nếu là HH:mm:ss hoặc HH:mm, chỉ lấy HH:mm
    const [h, m] = timeStr.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }

  // Lấy các ngày đã có lịch làm trong tháng
  const scheduledDates = schedules.map(sch => sch.date);

  // Hiển thị lịch dạng calendar + danh sách
  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
  <h5 className="mb-3">Lịch làm việc tháng {calendarValue.getMonth() + 1}/{calendarValue.getFullYear()}</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Row className="mb-2 align-items-stretch flex-nowrap" style={{overflowX:'auto'}}>
          <Col xs={12} md={5} style={{minWidth:320, maxWidth:400, flex:'0 0 350px', paddingRight:0}}>
            {(user.role_id === 1 || user.role_id === 2) && (
              <div style={{background:'#fff', borderRadius:8, boxShadow:'0 1px 4px #eee', padding:8}}>
                <Calendar
                  value={calendarValue}
                  onClickDay={handleCalendarChange}
                  calendarType="iso8601"
                  tileClassName={({ date }) => {
                    const d = date.toISOString().slice(0, 10);
                    if (scheduledDates.includes(d)) return 'has-schedule';
                    return '';
                  }}
                  minDetail="month"
                  maxDetail="month"
                  showNeighboringMonth={false}
                  onActiveStartDateChange={({ activeStartDate }) => setCalendarValue(activeStartDate)}
                />
              </div>
            )}
          </Col>
          <Col xs={12} md={7} style={{minWidth:400, flex:'1 1 0', paddingLeft:16}}>
            <div className="table-responsive" style={{maxHeight: 'calc(100vh - 250px)', overflowY: 'auto'}}>
              <Table bordered hover size="sm" className="align-middle text-center" style={{marginBottom:0}}>
                <thead>
                  <tr>
                    <th style={{whiteSpace:'nowrap', minWidth:90}}>Ngày</th>
                    <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Tên công việc</th>
                    <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Giờ bắt đầu</th>
                    <th style={{maxWidth:180, whiteSpace:'normal', wordBreak:'break-word'}}>Địa điểm</th>
                    <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Ghi chú</th>
                    {/* Cột Đăng ký đã bị loại bỏ */}
                    {(user.role_id === 1 || user.role_id === 2) && <th style={{whiteSpace:'normal', wordBreak:'break-word'}}>Quản lý</th>}
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 && <tr><td colSpan={user.role_id === 1 || user.role_id === 2 ? 6 : 5}>Không có lịch làm</td></tr>}
                  {schedules.map(sch => (
                    <tr key={sch.id}>
                      <td style={{whiteSpace:'nowrap', minWidth:90}}>{new Date(sch.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.job_name}</td>
                      <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.start_time ? format24h(sch.start_time) : ''}</td>
                      <td style={{maxWidth:180, whiteSpace:'normal', wordBreak:'break-word', overflow:'hidden', textOverflow:'ellipsis'}}>{sch.location}</td>
                      <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>{sch.note}</td>
                      {/* Cột Đăng ký đã bị loại bỏ */}
                      {(user.role_id === 1 || user.role_id === 2) && (
                        <td style={{whiteSpace:'normal', wordBreak:'break-word'}}>
                          <div style={{display:'flex', flexDirection:'row', gap:8, justifyContent:'center', alignItems:'center'}}>
                            <Button size="sm" variant="light" title="Xem đăng ký" onClick={() => handleViewRegistrations(sch)}>
                              <FaEye />
                            </Button>
                            <Button size="sm" variant="light" title="Sửa" onClick={() => handleEditSchedule(sch)}>
                              <FaEdit />
                            </Button>
                            <Button size="sm" variant="light" title="Xóa" onClick={() => handleDeleteSchedule(sch)}>
                              <FaTrash color="#dc3545" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
        {/* Modal tạo/sửa lịch làm */}
        <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedSchedule(null); }}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedSchedule ? `Sửa lịch làm ngày ${modalDate}` : `Tạo lịch làm ngày ${modalDate}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateSchedule}>
              <Form.Group className="mb-2">
                <Form.Label>Tên công việc</Form.Label>
                <Form.Control value={form.job_name} onChange={e => setForm(f => ({ ...f, job_name: e.target.value }))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Giờ bắt đầu</Form.Label>
                <Form.Control type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Địa điểm</Form.Label>
                <Form.Control value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => { setShowModal(false); setSelectedSchedule(null); }} className="me-2">Hủy</Button>
                <Button type="submit" variant="primary">Lưu</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        {/* Modal xem đăng ký */}
        <Modal show={showViewRegModal} onHide={() => { setShowViewRegModal(false); setViewRegSchedule(null); }}>
          <Modal.Header closeButton>
            <Modal.Title>Nhân viên đã đăng ký: {viewRegSchedule?.job_name} ({viewRegSchedule?.date})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {registrations.length === 0 && <li>Chưa có ai đăng ký</li>}
              {registrations.map(u => <li key={u.id}>{u.fullname} ({u.username})</li>)}
            </ul>
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
}

export default WorkSchedule;
