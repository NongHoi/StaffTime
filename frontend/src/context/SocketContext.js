import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Chỉ kết nối khi có thông tin user
        if (user && user.id) {
            // Kết nối tới server socket.io, truyền user_id qua query
            const newSocket = io('http://localhost:3000', {
                query: { userId: user.id },
            });

            setSocket(newSocket);

            // Lắng nghe sự kiện 'notification' từ server
            // newSocket.on('notification', (data) => {
            //     // Hiển thị thông báo cho người dùng, ví dụ dùng alert
            //     alert(`Thông báo mới: ${data.message}`);
            // });

            // Dọn dẹp khi component unmount hoặc user thay đổi
            return () => newSocket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
