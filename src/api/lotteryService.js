import apiService from './apiService';

const LOTTERY_URL = '/lottery';



export const lotteryService = {
    // Prize Management
    getPrizes: () => apiService.get(`${LOTTERY_URL}/prizes`),
    addPrize: (prize) => apiService.post(`${LOTTERY_URL}/prizes`, prize),
    deletePrize: (id) => apiService.delete(`${LOTTERY_URL}/prizes/${id}`),

    // User Balance & Tickets
    getUserBalance: (chatId) => apiService.get(`${LOTTERY_URL}/balance/${chatId}`), // Public? Controller doesn't show auth check for this one specifically, but others do. Added auth just in case or left public if backend allows. The provided code: `getBalance` does NOT have `if (!authenticate(request))` check. So it's public.

    // Add Tickets: POST /lottery/tickets/{chatId}?amount={amount}
    addTickets: (chatId, amount) => apiService.post(`${LOTTERY_URL}/tickets/${chatId}?amount=${amount}`),

    // Delete Tickets: DELETE /lottery/tickets/{chatId}
    resetTickets: (chatId) => apiService.delete(`${LOTTERY_URL}/tickets/${chatId}`),

    // Delete Balance: DELETE /lottery/balance/{chatId}
    resetBalance: (chatId) => apiService.delete(`${LOTTERY_URL}/balance/${chatId}`),

    // Random Award: POST /lottery/award-random-users
    awardRandomUsers: (data) => apiService.post(`${LOTTERY_URL}/award-random-users`, null, {
        params: {
            totalUsers: data.totalUsers,
            randomUsers: data.randomUsers,
            amount: data.amount
        }
    }),

    // Approved Users: GET /lottery/approved-users-chatids
    getApprovedUsersChatIds: () => apiService.get(`${LOTTERY_URL}/approved-users-chatids`),

    // Paginated Balances: GET /lottery/balances
    getUserBalancesPaginated: (page, size, sortBy, sortDirection) => apiService.get(`${LOTTERY_URL}/balances`, {
        params: { page, size, sortBy, sortDirection }
    }),

    // Overall Stats: GET /lottery/overall
    getOverallStats: () => apiService.get(`${LOTTERY_URL}/overall`)
};