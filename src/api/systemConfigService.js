import apiService from './apiService';

const systemConfigService = {
    getLatestConfig: async () => {
        const response = await apiService.get('/config');
        return response.data;
    },

    getConfiguration: async () => {
        return apiService.get('/config');
    },

    createConfig: async (configData) => {
        const { id, createdAt, ...data } = configData;
        const response = await apiService.post('/config', data);
        return response.data;
    },

    updateConfig: async (id, configData) => {
        const response = await apiService.put(`/config/${id}`, configData);
        return response.data;
    },

    getWalletToWalletFee: async () => {
        const response = await apiService.get('/config/wallet-to-wallet-fee');
        return response.data;
    },

    updateWalletToWalletFee: async (percentage) => {
        const response = await apiService.patch('/config/wallet-to-wallet-fee', null, {
            params: { percentage }
        });
        return response.data;
    }
};

export { systemConfigService };
export default systemConfigService;
