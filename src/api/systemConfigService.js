// src/api/systemConfigService.js
import apiService from './apiService';

const AUTH_TOKEN = btoa('MaxUp1000:MaxUp1000');
const authConfig = {
    headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`
    }
};

const getConfiguration = () => apiService.get('/config', authConfig);

const updateConfiguration = (data) => apiService.post('/config', data, authConfig);

const updateConfigurationById = (id, data) => apiService.put(`/config/${id}`, data, authConfig);

export const systemConfigService = {
    getConfiguration,
    updateConfiguration,
    updateConfigurationById
};
