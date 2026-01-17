
import apiService from './apiService';

const PROMO_USERS_URL = '/admin/promo/users';

const PROMO_CHATS_URL = '/admin/promo/chats';

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

// Chat ID methods
const addPromoChat = (chatId) => {
    return apiService.post(`${PROMO_CHATS_URL}`, null, {
        params: {
            chatId
        }
    });
};

const removePromoChat = (chatId) => {
    return apiService.delete(`${PROMO_CHATS_URL}`, {
        params: {
            chatId
        }
    });
};

const getAllPromoChats = (page = 0, size = 10) => {
    return apiService.get(`${PROMO_CHATS_URL}`, {
        params: {
            page,
            size
        }
    });
};

export const promoService = {
    addPromoUser,
    removePromoUser,
    getAllPromoUsers,
    addPromoChat,
    removePromoChat,
    getAllPromoChats
};
