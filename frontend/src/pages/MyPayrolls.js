import React, { useState, useEffect } from 'react';
import { Card, Table, Alert } from 'react-bootstrap';

const MyPayrolls = ({ user }) => {
    const [payrolls, setPayrolls] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.id) {
            const fetchPayrolls = async () => {
                try {
                    const res = await fetch(`/api/payroll/user/${user.id}`);
                    if (!res.ok) {
                        throw new Error('Không thể tải lịch sử lương');
                    }
                    const data = await res.json();
                    setPayrolls(data);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchPayrolls();
        }
    }, [user]);

    if (!user) return null;

    return (
        <Card>
            <Card.Body>
                <Card.Title>Lịch sử Lương của bạn</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Tháng/Năm</th>
                            <th>Tổng lương</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrolls.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center">Chưa có dữ liệu lương.</td>
                            </tr>
                        ) : (
                            payrolls.map(p => (
                                <tr key={p.id}>
                                    <td>{p.month}/{p.year}</td>
                                    <td>{Number(p.total).toLocaleString('vi-VN')} đồng</td>
                                    <td>
                                        {/* Thêm link hoặc button để xem chi tiết sau */}
                                        Xem chi tiết
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default MyPayrolls;
