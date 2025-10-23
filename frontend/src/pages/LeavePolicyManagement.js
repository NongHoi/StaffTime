import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import axios from 'axios';

const LeavePolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [formData, setFormData] = useState({
    policy_name: '',
    description: '',
    default_days: 12,
    leave_type: 'annual',
    assign_on_join: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/leaves/policies', { withCredentials: true });
      setPolicies(res.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách chính sách. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleShowModal = (policy = null) => {
    setError('');
    setSuccess('');
    if (policy) {
      setIsEditing(true);
      setCurrentPolicy(policy);
      setFormData({
        policy_name: policy.policy_name,
        description: policy.description || '',
        default_days: policy.default_days,
        leave_type: policy.leave_type,
        assign_on_join: policy.assign_on_join,
      });
    } else {
      setIsEditing(false);
      setCurrentPolicy(null);
      setFormData({
        policy_name: '',
        description: '',
        default_days: 12,
        leave_type: 'annual',
        assign_on_join: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPolicy(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const url = isEditing 
      ? `http://localhost:3000/api/leaves/policies/${currentPolicy._id}` 
      : 'http://localhost:3000/api/leaves/policies';
    const method = isEditing ? 'put' : 'post';

    try {
      const res = await axios[method](url, formData, { withCredentials: true });
      setSuccess(`Đã ${isEditing ? 'cập nhật' : 'tạo mới'} chính sách thành công!`);
      fetchPolicies();
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Đã xảy ra lỗi khi ${isEditing ? 'cập nhật' : 'tạo mới'} chính sách.`;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const leaveTypeMap = {
    annual: 'Nghỉ phép năm',
    sick: 'Nghỉ ốm',
    unpaid: 'Nghỉ không lương',
    maternity: 'Nghỉ thai sản (Nữ)',
    paternity: 'Nghỉ thai sản (Nam)',
  };

  return (
    <Container fluid>
      <Card className="shadow-sm">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Quản lý Chính sách Nghỉ phép
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-lg me-2"></i>Tạo Chính sách mới
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {loading && !policies.length ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên Chính sách</th>
                  <th>Loại nghỉ phép</th>
                  <th>Số ngày mặc định</th>
                  <th>Tự động gán</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy, index) => (
                  <tr key={policy._id}>
                    <td>{index + 1}</td>
                    <td>{policy.policy_name}</td>
                    <td>
                      <Badge bg="info">{leaveTypeMap[policy.leave_type] || policy.leave_type}</Badge>
                    </td>
                    <td>{policy.default_days}</td>
                    <td>{policy.assign_on_join ? 'Có' : 'Không'}</td>
                    <td>
                      <Button variant="outline-secondary" size="sm" onClick={() => handleShowModal(policy)}>
                        <i className="bi bi-pencil-square"></i> Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Chỉnh sửa Chính sách' : 'Tạo Chính sách mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="policy_name">
              <Form.Label>Tên Chính sách</Form.Label>
              <Form.Control
                type="text"
                name="policy_name"
                value={formData.policy_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="default_days">
                  <Form.Label>Số ngày mặc định</Form.Label>
                  <Form.Control
                    type="number"
                    name="default_days"
                    value={formData.default_days}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="leave_type">
                  <Form.Label>Loại nghỉ phép</Form.Label>
                  <Form.Select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="annual">Nghỉ phép năm</option>
                    <option value="sick">Nghỉ ốm</option>
                    <option value="unpaid">Nghỉ không lương</option>
                    <option value="maternity">Nghỉ thai sản (Nữ)</option>
                    <option value="paternity">Nghỉ thai sản (Nam)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="assign_on_join">
              <Form.Check
                type="switch"
                label="Tự động gán cho nhân viên mới"
                name="assign_on_join"
                checked={formData.assign_on_join}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                    Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : (isEditing ? 'Lưu thay đổi' : 'Tạo mới')}
                </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LeavePolicyManagement;
