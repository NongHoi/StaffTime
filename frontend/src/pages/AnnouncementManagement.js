import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        message: '',
        target_users: []
    });

    useEffect(() => {
        fetchAnnouncements();
        fetchUsers();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get('/api/announcements', { withCredentials: true });
            setAnnouncements(res.data);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users', { withCredentials: true });
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAnnouncement(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSelection = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setNewAnnouncement(prev => ({ ...prev, target_users: selectedOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/announcements', newAnnouncement, { withCredentials: true });
            setShowModal(false);
            fetchAnnouncements();
            setNewAnnouncement({ title: '', message: '', target_users: [] }); // Reset form
        } catch (error) {
            console.error("Error creating announcement:", error);
        }
    };

    return (
        <Container fluid className="p-4">
            <Card className="glass-hover">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <Card.Title><i className="bi bi-megaphone-fill me-2"></i>Quản lý Thông báo</Card.Title>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-circle me-2"></i>Tạo thông báo mới
                    </Button>
                </Card.Header>
                <Card.Body>
                    <ListGroup>
                        {announcements.map(ann => (
                            <ListGroup.Item key={ann._id} className="mb-2">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h5>{ann.title}</h5>
                                        <p>{ann.message}</p>
                                        <small className="text-muted">
                                            Tác giả: {ann.author_id?.full_name || 'N/A'} - Ngày: {new Date(ann.created_at).toLocaleString('vi-VN')}
                                        </small>
                                    </div>
                                    <div>
                                        {ann.target_users.length > 0 ? (
                                            <Badge bg="info">{ann.target_users.length} người nhận</Badge>
                                        ) : (
                                            <Badge bg="success">Toàn bộ nhân viên</Badge>
                                        )}
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>

            {/* Create Announcement Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo thông báo mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={newAnnouncement.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="message"
                                value={newAnnouncement.message}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Gửi đến (để trống nếu gửi cho tất cả)</Form.Label>
                            <Form.Control
                                as="select"
                                multiple
                                name="target_users"
                                onChange={handleUserSelection}
                                style={{ height: '200px' }}
                            >
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>{user.full_name || user.username}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit">
                            Đăng thông báo
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AnnouncementManagement;
