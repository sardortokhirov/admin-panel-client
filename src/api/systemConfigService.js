// src/api/systemConfigService.js
import apiService from './apiService';

const getConfiguration = () => apiService.get('/config');

const updateConfiguration = (data) => apiService.post('/config', data);

const updateConfigurationById = (id, data) => apiService.put(`/config/${id}`, data);

export const systemConfigService = {
    getConfiguration,
    updateConfiguration,
    updateConfigurationById
};
