
import apiService from './apiService';

const LOTTERY_URL = '/lottery';

const getLotteryStats = (page = 0, size = 10) => {
    // This endpoint seems to return a list of participants/tickets
    return apiService.get(`${LOTTERY_URL}/stats`, {
        params: { page, size }
    });
};

const awardLottery = (userId) => {
    return apiService.post(`${LOTTERY_URL}/award?userId=${userId}`);
};

const getOverallStats = () => {
    // Uses Basic Auth header specifically for this request as per requirement
    const AUTH_TOKEN = btoa('MaxUp1000:MaxUp1000');
    return apiService.get(`${LOTTERY_URL}/overall`, {
        headers: {
            'Authorization': `Basic ${AUTH_TOKEN}`
        }
    });
};

export const lotteryService = {
    getLotteryStats,
    awardLottery,
    getOverallStats,
    getPrizes: () => apiService.get(`${LOTTERY_URL}/prizes`),
    addPrize: (prize) => apiService.post(`${LOTTERY_URL}/prizes`, prize),
    deletePrize: (id) => apiService.delete(`${LOTTERY_URL}/prizes/${id}`),
    getApprovedUsersChatIds: () => apiService.get(`${LOTTERY_URL}/approved-users`),
    getUserBalance: (chatId) => apiService.get(`${LOTTERY_URL}/balance/${chatId}`),
    addTickets: (chatId, tickets) => apiService.post(`${LOTTERY_URL}/tickets?chatId=${chatId}&tickets=${tickets}`),
    resetTickets: (chatId) => apiService.delete(`${LOTTERY_URL}/tickets/${chatId}`),
    resetBalance: (chatId) => apiService.delete(`${LOTTERY_URL}/balance/${chatId}`),
    awardRandomUsers: (data) => apiService.post(`${LOTTERY_URL}/award-random`, data),
    getUserBalancesPaginated: (page, size, sortBy, sortDirection) => apiService.get(`${LOTTERY_URL}/balances`, { params: { page, size, sortBy, sortDirection } })
};