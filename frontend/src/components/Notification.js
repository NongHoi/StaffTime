import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useNotifications } from '../context/SocketContext';

const Notification = () => {
    const { notifications, removeNotification } = useNotifications();

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    onClose={() => removeNotification(notification.id)}
                    delay={5000}
                    autohide
                    bg={notification.type}
                >
                    <Toast.Header>
                        <strong className="me-auto">{notification.title || 'Thông báo'}</strong>
                        <small>{notification.time ? new Date(notification.time).toLocaleTimeString('vi-VN') : 'bây giờ'}</small>
                    </Toast.Header>
                    <Toast.Body className={notification.type === 'danger' || notification.type === 'dark' ? 'text-white' : ''}>
                        {notification.message}
                    </Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default Notification;
