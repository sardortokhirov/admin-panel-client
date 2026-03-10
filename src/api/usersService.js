
import apiService from './apiService';

// Base URL for users endpoint
const BASE_URL = '/users';

export const usersService = {
    // 1.1 Get Users List (Paginated with Filters)
    getUsers: (params) => {
        return apiService.get(BASE_URL, { params });
    },

    // 1.2 Bulk Block Users
    bulkBlock: (chatIds) => {
        return apiService.post(`${BASE_URL}/bulk-block`, { chatIds });
    },

    // 1.3 Bulk Unblock Users
    bulkUnblock: (chatIds) => {
        return apiService.post(`${BASE_URL}/bulk-unblock`, { chatIds });
    },

    // 2.1 Get User Details
    getUserDetails: (chatId) => {
        return apiService.get(`${BASE_URL}/${chatId}`);
    },

    // 2.2 Get User Transfers
    getUserTransfers: (chatId, params) => {
        return apiService.get(`${BASE_URL}/${chatId}/transfers`, { params });
    },

    // 2.3 Get User Summary
    getUserSummary: (chatId) => {
        return apiService.get(`${BASE_URL}/${chatId}/summary`);
    },

    // 2.4 Update User Balance
    updateBalance: (chatId, balance) => {
        return apiService.put(`${BASE_URL}/${chatId}/balance`, { balance });
    },

    // 2.5 Update User Tickets
    updateTickets: (chatId, tickets) => {
        return apiService.put(`${BASE_URL}/${chatId}/tickets`, { tickets });
    },

    // 2.6 Update User Permanent Limit Increase
    updateLimit: (chatId, permanentLimitIncrease) => {
        return apiService.put(`${BASE_URL}/${chatId}/limit`, { permanentLimitIncrease });
    },

    // 2.6b Update User Base Daily Limit Percentage
    updateBaseDailyLimit: (chatId, percentage) => {
        return apiService.put(`${BASE_URL}/${chatId}/base-daily-limit`, { percentage });
    },

    // 2.7 Block User
    blockUser: (chatId) => {
        return apiService.post(`${BASE_URL}/${chatId}/block`);
    },

    // 2.8 Unblock User
    unblockUser: (chatId) => {
        return apiService.post(`${BASE_URL}/${chatId}/unblock`);
    },

    // 2.9 Delete User
    deleteUser: (chatId, deleteType = null) => {
        // Note: passing deleteType as query param if provided. 
        // Backend now performs HARD DELETE by default if no param is sent.
        const params = {};
        if (deleteType) params.deleteType = deleteType;
        return apiService.delete(`${BASE_URL}/${chatId}`, { params });
    },

    // 2.10 Update User Language
    updateLanguage: (chatId, language) => {
        return apiService.put(`${BASE_URL}/${chatId}/language`, { language });
    },

    // 2.11 Reset Daily Stats
    resetDailyStats: (chatId) => {
        return apiService.post(`${BASE_URL}/${chatId}/reset-daily-stats`);
    },

    // 2.12 Reset Balance
    resetBalance: (chatId) => {
        return apiService.post(`${BASE_URL}/${chatId}/reset-balance`);
    },

    // 2.13 Get Daily Stats
    getDailyStats: (chatId, params) => {
        return apiService.get(`${BASE_URL}/${chatId}/daily-stats`, { params });
    },

    // 2.14 Add Withdraw Quota
    addWithdrawQuota: (chatId, amount) => {
        return apiService.put(`${BASE_URL}/${chatId}/withdraw-quota`, { amount });
    },

    // 2.15 Update User Wallet Balance
    updateWalletBalance: (chatId, walletBalance) => {
        return apiService.put(`${BASE_URL}/${chatId}/wallet`, { walletBalance });
    }
};
