import axios from 'axios';

const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;

    if (import.meta.env.PROD) {
        return envURL || '/api';
    }

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

// Response interceptor to handle Token Expiration (401)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            const isLoginPage = window.location.pathname.includes('/auth');

            if (!isLoginPage) {
                // Clear all local auth data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Notify user and redirect
                // Note: We use window.location.href to force a clean state reload to the login page
                alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại. 🔐');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
