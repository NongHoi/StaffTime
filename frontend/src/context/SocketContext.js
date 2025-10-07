import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { Toast, ToastContainer } from 'react-bootstrap';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        setTimeout(() => {
            removeNotification(notification.id);
        }, 5000);
    }, [removeNotification]);

    useEffect(() => {
        if (user && user.id) {
            const newSocket = io('http://localhost:3000', {
                query: { userId: user.id },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            newSocket.on('notification', (data) => {
                console.log('Notification received:', data);
                addNotification({
                    id: Date.now(),
                    title: data.title || 'Thông báo',
                    message: data.message,
                    type: data.type || 'info',
                    time: new Date()
                });
            });

            newSocket.on('dashboard_update', (data) => {
                console.log('Dashboard update:', data);
            });

            newSocket.on('new_attendance', (data) => {
                console.log('New attendance:', data);
                addNotification({
                    id: Date.now(),
                    title: 'Chấm công mới',
                    message: `${data.user_name || 'Nhân viên'} vừa chấm công`,
                    type: 'success',
                    time: new Date()
                });
            });

            newSocket.on('new_request', (data) => {
                console.log('New request:', data);
                addNotification({
                    id: Date.now(),
                    title: 'Yêu cầu mới',
                    message: `${data.user_name || 'Nhân viên'} gửi yêu cầu: ${data.title || ''}`,
                    type: 'warning',
                    time: new Date()
                });
            });

            newSocket.on('request_approved', (data) => {
                console.log('Request approved:', data);
                addNotification({
                    id: Date.now(),
                    title: 'Yêu cầu được duyệt',
                    message: `Yêu cầu "${data.title}" của bạn đã được chấp nhận`,
                    type: 'success',
                    time: new Date()
                });
            });

            newSocket.on('request_rejected', (data) => {
                console.log('Request rejected:', data);
                addNotification({
                    id: Date.now(),
                    title: 'Yêu cầu bị từ chối',
                    message: `Yêu cầu "${data.title}" của bạn đã bị từ chối`,
                    type: 'danger',
                    time: new Date()
                });
            });

            newSocket.on('new_work_schedule', (data) => {
                console.log('New work schedule:', data);
                addNotification({
                    id: Date.now(),
                    title: 'Lịch làm mới',
                    message: `Lịch làm mới: ${data.job_name || 'Công việc'}`,
                    type: 'info',
                    time: new Date()
                });
            });

            setSocket(newSocket);

            return () => {
                console.log('Closing socket connection');
                newSocket.close();
            };
        }
    }, [user, addNotification]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                {notifications.map(notif => (
                    <Toast 
                        key={notif.id} 
                        onClose={() => removeNotification(notif.id)}
                        delay={5000}
                        autohide
                        bg={notif.type}
                    >
                        <Toast.Header>
                            <strong className="me-auto">{notif.title}</strong>
                            <small>{notif.time.toLocaleTimeString('vi-VN')}</small>
                        </Toast.Header>
                        <Toast.Body className={notif.type === 'danger' || notif.type === 'dark' ? 'text-white' : ''}>
                            {notif.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </SocketContext.Provider>
    );
};
