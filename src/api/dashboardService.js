// src/api/dashboardService.js
import apiService from "./apiService";

const API_URL = "/dashboard";

const getDashboardStats = (params) => {
  return apiService.get(`${API_URL}/stats`, { params });
};

// 👇 ADD THIS NEW FUNCTION 👇
const getTotalApprovedBonusAmount = (params) => {
  return apiService.get(`${API_URL}/requests/total-bonus-amount`, { params });
};

const GetToggles = async (params) => {
  try {
    const resToggletopup = await apiService.get(`features`, { params });
    return { ...resToggletopup.data };
  } catch (err) {
    console.error("Toggle API error:", err?.response?.data || err.message);
    return {}; // yoki default qiymat
  }
};

const ToggleController = {
  // POST - Toggle Top-up
  toggleTopUp: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/topup?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Withdraw
  toggleWithdraw: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/withdraw?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Bonus
  toggleBonus: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/bonus?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Promo
  togglePromo: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/promo?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Bonus Limit
  toggleBonusLimit: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/bonus-limit?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Pay
  togglePay: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/pay?enabled=${enabled}`
    );
    return res.data;
  },

  // POST - Toggle Humo
  toggleHumo: async (enabled) => {
    const res = await apiService.post(
      `/features/toggle/humo?enabled=${enabled}`
    );
    return res.data;
  },
};
const getWalletBalances = () => {
  return apiService.get(`${API_URL}/wallet-balances`);
};

export const dashboardService = {
  getDashboardStats,
  getTotalApprovedBonusAmount, // Export the new function
  GetToggles,
  ToggleController,
  getWalletBalances,
};
