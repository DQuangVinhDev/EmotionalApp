import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const client = axios.create({
    baseURL: 'http://192.168.1.201:5000', // Update this to your local IP if testing on real device
});

client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
