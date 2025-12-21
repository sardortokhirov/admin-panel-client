
import apiService from './apiService';

const PROMO_USERS_URL = '/admin/promo/users';

const addPromoUser = (userId) => {
    return apiService.post(`${PROMO_USERS_URL}`, null, {
        params: {
            userId
        }
    });
};

const removePromoUser = (userId) => {
    return apiService.delete(`${PROMO_USERS_URL}`, {
        params: {
            userId
        }
    });
};

const getAllPromoUsers = (page = 0, size = 10) => {
    return apiService.get(`${PROMO_USERS_URL}`, {
        params: {
            page,
            size
        }
    });
};

export const promoService = {
    addPromoUser,
    removePromoUser,
    getAllPromoUsers
};
