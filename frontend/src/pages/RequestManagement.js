import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useSocket } from '../context/SocketContext';

const RequestManagement = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const socket = useSocket();

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (!res.ok) throw new Error('Failed to fetch requests');
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (socket) {
            const handleNewRequest = (newRequest) => {
                // Kiểm tra để không thêm trùng lặp
                setRequests(prev => {
                    if (prev.find(r => r.id === newRequest.id)) {
                        return prev;
                    }
                    return [newRequest, ...prev];
                });
            };
            // Lắng nghe sự kiện có yêu cầu mới
            socket.on('new_request', handleNewRequest);

            // Dọn dẹp listener khi component unmount
            return () => {
                socket.off('new_request', handleNewRequest);
            };
        }
    }, [socket]);


    const handleUpdateRequest = async (id, status) => {
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reviewer_comment: '' }), // Thêm ô nhập comment sau
            });
            if (!res.ok) throw new Error('Failed to update request');
            // Cập nhật lại danh sách
            fetchRequests();
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

    if (user.role_id !== 1 && user.role_id !== 2) {
        return <p>Bạn không có quyền truy cập trang này.</p>;
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>Quản lý Yêu cầu</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nhân viên</th>
                            <th>Loại</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Lý do</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>{req.fullname} ({req.username})</td>
                                <td>Nghỉ phép</td>
                                <td>{new Date(req.start_date).toLocaleDateString('vi-VN')}</td>
                                <td>{new Date(req.end_date).toLocaleDateString('vi-VN')}</td>
                                <td>{req.reason}</td>
                                <td>{getStatusBadge(req.status)}</td>
                                <td>
                                    {req.status === 'pending' && (
                                        <>
                                            <Button variant="success" size="sm" onClick={() => handleUpdateRequest(req.id, 'approved')}>Duyệt</Button>{' '}
                                            <Button variant="danger" size="sm" onClick={() => handleUpdateRequest(req.id, 'rejected')}>Từ chối</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default RequestManagement;
