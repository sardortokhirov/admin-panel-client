
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
    getOverallStats
};