
import apiService from './apiService';

const USER_PERMISSIONS_URL = '/admin/user-permissions';

const getAllPermissions = (page = 0, size = 10) => {
    return apiService.get(USER_PERMISSIONS_URL, {
        params: { page, size }
    });
};

const savePermissions = (userId, permissions) => {
    const { canTopUp, canWithdraw, canBonusTopUp } = permissions;
    return apiService.post(USER_PERMISSIONS_URL, null, {
        params: {
            userId,
            canTopUp,
            canWithdraw,
            canBonusTopUp
        }
    });
};

const deletePermissions = (userId) => {
    return apiService.delete(USER_PERMISSIONS_URL, {
        params: { userId }
    });
};

export const userPermissionsService = {
    getAllPermissions,
    savePermissions,
    deletePermissions
};
