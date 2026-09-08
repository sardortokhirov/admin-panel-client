import axios from 'axios';
import { emitUnauthorized, getAuthToken, isAuthFailure } from './authStorage';

// const API_BASE_URL = 'http://localhost:8080/api';
// const API_BASE_URL = 'http://128.199.44.140:8080/api';
export const API_BASE_URL = 'https://misterpey.uz:8082/api';

const apiService = axios.create({
    baseURL: API_BASE_URL,
    timeout: 25000,
});

export const setAuthHeader = (token) => {
    if (token) {
        apiService.defaults.headers.common['Authorization'] = `Basic ${token}`;
    }
};

export const clearAuthHeader = () => {
    delete apiService.defaults.headers.common['Authorization'];
};

apiService.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
});

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        if (isAuthFailure(error) && getAuthToken()) {
            emitUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default apiService;
