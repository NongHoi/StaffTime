import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';

const SalaryConfigModal = ({ show, onHide, user, onSave }) => {
  const [form, setForm] = useState({
    day_shift_rate: '',
    night_shift_rate: '',
    base_salary: '',
    allowance: '',
    bonus: '',
    show_salary: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      // Có thể fetch lương hiện tại nếu muốn
      setForm({
        day_shift_rate: '',
        night_shift_rate: '',
        base_salary: '',
        show_salary: '',
        allowance: '',
        bonus: ''
      });
      setMessage(''); setError('');
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await fetch('/api/users/set-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: user.type, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');
      setMessage('Cập nhật lương thành công!');
      if (onSave) onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cấu hình lương cho {user?.fullname || user?.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {user?.type === 'parttime' && (
            <>
              <Row className="mb-2">
                <Col><Form.Group><Form.Label>Lương giờ ngày</Form.Label><Form.Control name="day_shift_rate" value={form.day_shift_rate} onChange={handleChange} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Lương giờ đêm</Form.Label><Form.Control name="night_shift_rate" value={form.night_shift_rate} onChange={handleChange} /></Form.Group></Col>
              </Row>
              <Row className="mb-2">
                <Col><Form.Group><Form.Label>Phụ cấp</Form.Label><Form.Control name="allowance" value={form.allowance} onChange={handleChange} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Thưởng/Chuyên cần</Form.Label><Form.Control name="bonus" value={form.bonus} onChange={handleChange} /></Form.Group></Col>
              </Row>
            </>
          )}
          {user?.type === 'fulltime' && (
            <>
              <Row className="mb-2">
                <Col><Form.Group><Form.Label>Lương cứng (fulltime)</Form.Label><Form.Control name="base_salary" value={form.base_salary} onChange={handleChange} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Lương show</Form.Label><Form.Control name="show_salary" value={form.show_salary || ''} onChange={handleChange} /></Form.Group></Col>
              </Row>
              <Row className="mb-2">
                <Col><Form.Group><Form.Label>Phụ cấp</Form.Label><Form.Control name="allowance" value={form.allowance} onChange={handleChange} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Thưởng/Chuyên cần</Form.Label><Form.Control name="bonus" value={form.bonus} onChange={handleChange} /></Form.Group></Col>
              </Row>
            </>
          )}
          <div className="d-grid mt-2">
            <Button type="submit" variant="primary" style={{ background: '#6c63ff', border: 'none' }}>Lưu</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SalaryConfigModal;
