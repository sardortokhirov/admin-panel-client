
import apiService from './apiService';

const BLOCKED_USERS_URL = '/admin/blocked-users';

const getAllBlockedUsers = (page = 0, size = 10) => {
    return apiService.get(`${BLOCKED_USERS_URL}`, {
        params: {
            page,
            size
        }
    });
};

const unblockUser = (chatId) => {
    return apiService.post(`${BLOCKED_USERS_URL}/unblock`, null, {
        params: {
            chatId
        }
    });
};

export const blockedUsersService = {
    getAllBlockedUsers,
    unblockUser
};
