import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.PROD) return '/api';

    const envURL = import.meta.env.VITE_API_URL;

    // Nếu đang truy cập qua IP (không phải localhost) thì ưu tiên dùng IP đó để gọi API
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `http://${window.location.hostname}:5000`;
    }

    return envURL || 'http://localhost:5000';
};

const client = axios.create({
    baseURL: getBaseURL(),
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
