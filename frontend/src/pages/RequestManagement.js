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
                body: JSON.stringify({ 
                    status, 
                    response_note: status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối' 
                }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update request: ${res.status}`);
            }
            
            // Cập nhật lại danh sách
            await fetchRequests();
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Update request error:', err);
            setError(`Lỗi cập nhật yêu cầu: ${err.message}`);
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
                            <th>Tiêu đề</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Lý do</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => {
                            // Handle different response formats
                            const requestId = req._id || req.id;
                            const userName = req.user ? req.user.fullname : (req.fullname || 'N/A');
                            const userLogin = req.user ? req.user.username : (req.username || 'N/A');
                            const requestTitle = req.title || 'Yêu cầu';
                            const requestDescription = req.description || req.reason || 'Không có mô tả';
                            
                            return (
                                <tr key={requestId}>
                                    <td>{userName} ({userLogin})</td>
                                    <td>{requestTitle}</td>
                                    <td>{req.start_date ? new Date(req.start_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                    <td>{req.end_date ? new Date(req.end_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                    <td>{requestDescription}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                        {req.status === 'pending' && (
                                            <>
                                                <Button variant="success" size="sm" onClick={() => handleUpdateRequest(requestId, 'approved')}>Duyệt</Button>{' '}
                                                <Button variant="danger" size="sm" onClick={() => handleUpdateRequest(requestId, 'rejected')}>Từ chối</Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default RequestManagement;
