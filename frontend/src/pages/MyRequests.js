import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';

const MyRequests = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const fetchMyRequests = async () => {
        try {
            const res = await fetch('/api/requests/my-requests');
            if (!res.ok) throw new Error('Failed to fetch requests');
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate,
                    reason: reason,
                    request_type: 'leave'
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gửi yêu cầu thất bại');
            }
            // Reset form and hide
            setStartDate('');
            setEndDate('');
            setReason('');
            setShowForm(false);
            // Refresh list
            fetchMyRequests();
        } catch (err) {
            setError(err.message);
        }
    };
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <Badge bg="success">Đã duyệt</Badge>;
            case 'rejected': return <Badge bg="danger">Từ chối</Badge>;
            default: return <Badge bg="warning">Chờ duyệt</Badge>;
        }
    };

    return (
        <Card>
            <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>Yêu cầu của tôi</span>
                    <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Đóng' : '+ Tạo yêu cầu mới'}
                    </Button>
                </Card.Title>

                {showForm && (
                    <Form onSubmit={handleSubmit} className="my-3 p-3 border rounded">
                        <h5>Tạo yêu cầu nghỉ phép</h5>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Từ ngày</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Đến ngày</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Lý do</Form.Label>
                            <Form.Control as="textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} required />
                        </Form.Group>
                        <Button type="submit">Gửi yêu cầu</Button>
                    </Form>
                )}

                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Loại</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Lý do</th>
                            <th>Trạng thái</th>
                            <th>Phản hồi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>Nghỉ phép</td>
                                <td>{new Date(req.start_date).toLocaleDateString('vi-VN')}</td>
                                <td>{new Date(req.end_date).toLocaleDateString('vi-VN')}</td>
                                <td>{req.reason}</td>
                                <td>{getStatusBadge(req.status)}</td>
                                <td>{req.reviewer_comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default MyRequests;
