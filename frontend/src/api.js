import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // use relative path so CRA proxy can forward requests to backend during development
    withCredentials: true, // include cookies for session-based auth
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
