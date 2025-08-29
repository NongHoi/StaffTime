import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';

const NightShiftConfig = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/config').then(async res => {
      if (res.ok) {
        let data = {};
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        }
        setStart(data.night_shift_start || '');
        setEnd(data.night_shift_end || '');
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ night_shift_start: start, night_shift_end: end })
      });
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');
      setMessage('Cập nhật thành công!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-3">
      <Card.Body>
        <h5 className="mb-3">Cấu hình giờ ca đêm</h5>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form as={Row} onSubmit={handleSave} className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Giờ bắt đầu ca đêm</Form.Label>
              <Form.Control type="time" value={start} onChange={e => setStart(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Giờ kết thúc ca đêm</Form.Label>
              <Form.Control type="time" value={end} onChange={e => setEnd(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" style={{ background: '#6c63ff', border: 'none' }}>
              Lưu cấu hình
            </Button>
          </Col>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NightShiftConfig;
