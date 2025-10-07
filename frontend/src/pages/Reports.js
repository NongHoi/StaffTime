import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Form, Row, Col, Card } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();
    const [workingHoursFilter, setWorkingHoursFilter] = useState({
        period_type: 'month',
        year: currentYear,
        month: new Date().getMonth() + 1,
        week: ''
    });
    const [payrollFilter, setPayrollFilter] = useState({ year: currentYear });

    const [workingHoursData, setWorkingHoursData] = useState({
        labels: [],
        datasets: [],
    });
    const [payrollData, setPayrollData] = useState({
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
        datasets: [],
    });

    const fetchWorkingHoursReport = useCallback(async () => {
        try {
            const params = { ...workingHoursFilter };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/reports/working-hours', { params });
            const data = response.data;

            setWorkingHoursData({
                labels: data.map(d => d.full_name),
                datasets: [
                    {
                        label: 'Giờ làm bình thường',
                        data: data.map(d => d.total_normal_hours),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    },
                    {
                        label: 'Giờ tăng ca',
                        data: data.map(d => d.total_overtime_hours),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching working hours report:', error);
        }
    }, [workingHoursFilter]);

    const fetchPayrollReport = useCallback(async () => {
        try {
            const response = await api.get('/reports/payroll', { params: payrollFilter });
            const data = response.data;
            setPayrollData(prev => ({
                ...prev,
                datasets: [
                    {
                        label: `Tổng lương ${payrollFilter.year}`,
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            }));
        } catch (error) {
            console.error('Error fetching payroll report:', error);
        }
    }, [payrollFilter]);


    useEffect(() => {
        if (user && (user.role_id === 1 || user.role_id === 2)) {
            fetchWorkingHoursReport();
        }
    }, [user, fetchWorkingHoursReport]);
    
    useEffect(() => {
        if (user && (user.role_id === 1 || user.role_id === 2)) {
            fetchPayrollReport();
        }
    }, [user, fetchPayrollReport]);


    const handleWorkingHoursFilterChange = (e) => {
        const { name, value } = e.target;
        setWorkingHoursFilter(prev => ({ ...prev, [name]: value }));
    };

    const handlePayrollFilterChange = (e) => {
        const { name, value } = e.target;
        setPayrollFilter(prev => ({ ...prev, [name]: value }));
    };

    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const weeks = Array.from({ length: 53 }, (_, i) => i + 1);

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4">Báo cáo và Thống kê</h2>

            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Thống kê giờ làm</Card.Title>
                            <Form as={Row} className="mb-3 align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Loại</Form.Label>
                                        <Form.Select name="period_type" value={workingHoursFilter.period_type} onChange={handleWorkingHoursFilterChange}>
                                            <option value="week">Tuần</option>
                                            <option value="month">Tháng</option>
                                            <option value="year">Năm</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Năm</Form.Label>
                                        <Form.Select name="year" value={workingHoursFilter.year} onChange={handleWorkingHoursFilterChange}>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {workingHoursFilter.period_type === 'month' && (
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Tháng</Form.Label>
                                            <Form.Select name="month" value={workingHoursFilter.month} onChange={handleWorkingHoursFilterChange}>
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                                {workingHoursFilter.period_type === 'week' && (
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Tuần</Form.Label>
                                            <Form.Select name="week" value={workingHoursFilter.week} onChange={handleWorkingHoursFilterChange}>
                                                {weeks.map(w => <option key={w} value={w}>{w}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                )}
                            </Form>
                            <div style={{ height: '400px' }}>
                                <Bar data={workingHoursData} options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Tổng giờ làm và giờ tăng ca của nhân viên' } } }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Thống kê lương theo năm</Card.Title>
                             <Form as={Row} className="mb-3 align-items-end">
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Năm</Form.Label>
                                        <Form.Select name="year" value={payrollFilter.year} onChange={handlePayrollFilterChange}>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Form>
                            <div style={{ height: '400px' }}>
                                <Bar data={payrollData} options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: `Tổng chi phí lương năm ${payrollFilter.year}` } } }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Reports;
