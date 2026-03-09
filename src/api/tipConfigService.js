// src/api/tipConfigService.js
import apiService from './apiService';

const API_URL = '/bot-tip-config';

export const getTipConfig = async () => {
    return apiService.get(API_URL);
};

export const updateTipConfig = async (data) => {
    // Both POST / PUT support it, let's use PUT for update/create
    return apiService.put(API_URL, data);
};

export const getTipStats = async (params) => {
    return apiService.get(`${API_URL}/stats`, { params });
};

export const getTipTransactions = async (params) => {
    return apiService.get(`${API_URL}/transactions`, { params });
};

export const getTipConfigStatus = async () => {
    return apiService.get(`${API_URL}/status`);
};
