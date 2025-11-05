// src/api/apiService.js

import axios from 'axios';

// IMPORTANT: Replace with your actual backend URL
// const API_BASE_URL = 'http://localhost:8080/api';
// const API_BASE_URL = 'http://128.199.44.140:8080/api';
const API_BASE_URL = 'https://xonpey.uz:8082/api';
// const API_BASE_URL = 'https://misterpey.uz:8082/api';


const apiService = axios.create({
    baseURL: API_BASE_URL,
});

// This function sets the auth header for all future requests
export const setAuthHeader = (token) => {
    if (token) {
        // We add the "Basic " prefix here as required by the spec
        apiService.defaults.headers.common['Authorization'] = `Basic ${token}`;
    }
};

// This function clears the auth header on logout
export const clearAuthHeader = () => {
    delete apiService.defaults.headers.common['Authorization'];
};

// This is the line that was missing. It makes this the "default" export.
export default apiService;