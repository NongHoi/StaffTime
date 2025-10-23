import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { Toast, ToastContainer } from 'react-bootstrap';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) return null;
    return context.socket || null;
};

export const useNotifications = () => {
    const context = useContext(SocketContext);
    if (!context) return { notifications: [], removeNotification: () => {} };
    return {
        notifications: context.notifications || [],
        removeNotification: context.removeNotification || (() => {})
    };
};

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        // auto remove after some time
        setTimeout(() => {
            removeNotification(notification.id);
        }, 10000); // Increased to 10 seconds
    }, [removeNotification]);

    useEffect(() => {
        if (user && user.id) {
            const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
            const newSocket = io(SOCKET_URL, {
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

            // Generic notification event
            newSocket.on('notification', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title: data.title || 'Thông báo',
                    message: data.message,
                    type: data.type || 'info',
                    time: new Date()
                });
            });

            // Other specific events
            newSocket.on('new_attendance', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title: 'Chấm công mới',
                    message: data.userName ? `${data.userName} vừa chấm công` : 'Có chấm công mới',
                    type: 'success',
                    time: new Date()
                });
            });

            newSocket.on('new_request', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title: 'Yêu cầu mới',
                    message: data.userName ? `${data.userName} gửi yêu cầu: ${data.title || ''}` : 'Có yêu cầu mới',
                    type: 'warning',
                    time: new Date()
                });
            });

            newSocket.on('request_approved', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title: 'Yêu cầu được duyệt',
                    message: `Yêu cầu "${data.title}" của bạn đã được chấp nhận`,
                    type: 'success',
                    time: new Date()
                });
            });

            newSocket.on('request_rejected', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    title: 'Yêu cầu bị từ chối',
                    message: `Yêu cầu "${data.title}" của bạn đã bị từ chối`,
                    type: 'danger',
                    time: new Date()
                });
            });

            newSocket.on('new_work_schedule', (data) => {
                addNotification({
                    id: Date.now() + Math.floor(Math.random() * 1000),
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
        <SocketContext.Provider value={{ socket, notifications, addNotification, removeNotification }}>
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
