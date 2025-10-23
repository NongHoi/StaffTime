import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const NotificationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/announcements/history', { withCredentials: true });
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching notification history:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`/api/announcements/${id}/read`, {}, { withCredentials: true });
            // Optimistically update the UI
            setHistory(prev => prev.map(item => 
                item._id === id ? { ...item, isRead: true } : item
            ));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    return (
        <Container fluid className="p-4">
            <Card className="glass-hover">
                <Card.Header>
                    <Card.Title><i className="bi bi-clock-history me-2"></i>Lịch sử Thông báo</Card.Title>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {history.length === 0 ? (
                                <ListGroup.Item>Không có thông báo nào.</ListGroup.Item>
                            ) : (
                                history.map(item => (
                                    <ListGroup.Item 
                                        key={item._id} 
                                        className={`d-flex justify-content-between align-items-start ${!item.isRead ? 'fw-bold' : ''}`}
                                        action
                                        onClick={() => !item.isRead && markAsRead(item._id)}
                                    >
                                        <div>
                                            <h5>{item.title}</h5>
                                            <p className="mb-1">{item.message}</p>
                                            <small className="text-muted">
                                                Từ: {item.author_id?.full_name || 'Hệ thống'} - {new Date(item.created_at).toLocaleString('vi-VN')}
                                            </small>
                                        </div>
                                        {!item.isRead && <Badge bg="primary" pill>Mới</Badge>}
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NotificationHistory;
