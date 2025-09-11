import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useSocket } from '../context/SocketContext';

const Notification = () => {
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.on('notification', (data) => {
                const newNotification = {
                    id: new Date().getTime(), // Unique ID for the key
                    message: data.message,
                    show: true,
                };
                setNotifications(prev => [...prev, newNotification]);
            });
        }
    }, [socket]);

    const handleClose = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    onClose={() => handleClose(notification.id)}
                    show={notification.show}
                    delay={5000}
                    autohide
                >
                    <Toast.Header>
                        <strong className="me-auto">Thông báo</strong>
                        <small>bây giờ</small>
                    </Toast.Header>
                    <Toast.Body>{notification.message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default Notification;
