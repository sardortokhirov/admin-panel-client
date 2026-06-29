import apiService from './apiService';

const PROMO_BASE = '/admin/promo';

const getChats = (page = 0, size = 10) => {
    return apiService.get(`${PROMO_BASE}/chats`, { params: { page, size } });
};

const addChat = (chatId) => {
    return apiService.post(`${PROMO_BASE}/chats`, null, { params: { chatId } });
};

const deleteChat = (chatId) => {
    return apiService.delete(`${PROMO_BASE}/chats`, { params: { chatId } });
};

const getChatLinks = (chatId) => {
    return apiService.get(`${PROMO_BASE}/chats/${chatId}/links`);
};

const addChatLink = (chatId, { platformUserId, platformName }) => {
    return apiService.post(`${PROMO_BASE}/chats/${chatId}/links`, {
        platformUserId,
        platformName,
    });
};

const deleteChatLink = (chatId, linkId) => {
    return apiService.delete(`${PROMO_BASE}/chats/${chatId}/links/${linkId}`);
};

const searchPromo = ({ chatId, platformUserId }) => {
    const params = {};
    if (chatId != null && chatId !== '') params.chatId = chatId;
    if (platformUserId != null && platformUserId !== '') params.platformUserId = platformUserId;
    return apiService.get(`${PROMO_BASE}/search`, { params });
};

export const promoService = {
    getChats,
    addChat,
    deleteChat,
    getChatLinks,
    addChatLink,
    deleteChatLink,
    searchPromo,
};
