import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

const UserEditModal = ({ show, onHide, user, onSave }) => {
  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    email: '',
    bank_account_number: '',
    bank_name: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || '',
        phone: user.phone || '',
        email: user.email || '',
        bank_account_number: user.bank_account_number || '',
        bank_name: user.bank_name || ''
      });
    }
  }, [user, show]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');
      onSave && onSave();
      onHide();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật thông tin nhân viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Họ tên</Form.Label>
                <Form.Control name="fullname" value={form.fullname} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Điện thoại</Form.Label>
                <Form.Control name="phone" value={form.phone} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" value={form.email} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Số tài khoản</Form.Label>
                <Form.Control name="bank_account_number" value={form.bank_account_number} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Tên ngân hàng</Form.Label>
                <Form.Control name="bank_name" value={form.bank_name} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Hủy</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserEditModal;
