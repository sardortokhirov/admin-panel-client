// src/api/systemConfigService.js
import apiService from './apiService';

const getConfiguration = () => apiService.get('/config');

const updateConfiguration = (data) => apiService.post('/config', data);

const updateConfigurationById = (id, data) => apiService.put(`/config/${id}`, data);

const getWalletWithdrawRatio = () => apiService.get('/config/wallet-withdraw-ratio');

const updateWalletWithdrawRatio = (ratio) => apiService.patch(`/config/wallet-withdraw-ratio?ratio=${ratio}`);

const getWalletMinWithdraw = () => apiService.get('/config/wallet-min-withdraw');

const updateWalletMinWithdraw = (amount) => apiService.patch(`/config/wallet-min-withdraw?amount=${amount}`);

export const systemConfigService = {
    getConfiguration,
    updateConfiguration,
    updateConfigurationById,
    getWalletWithdrawRatio,
    updateWalletWithdrawRatio,
    getWalletMinWithdraw,
    updateWalletMinWithdraw
};
