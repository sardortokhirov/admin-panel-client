// src/api/apkLinkBotService.js

import apiService from './apiService';

export const apkLinkBotService = {
    getConfig: () => apiService.get('/apk-link-bot/config'),
    updateConfig: (config) => apiService.put('/apk-link-bot/config', config),

    getPlatforms: () => apiService.get('/apk-link-bot/platforms'),
    createPlatform: (platform) => apiService.post('/apk-link-bot/platforms', platform),
    updatePlatform: (id, platform) => apiService.put(`/apk-link-bot/platforms/${id}`, platform),
    deletePlatform: (id) => apiService.delete(`/apk-link-bot/platforms/${id}`),



    // Channels
    getChannels: () => apiService.get('/apk-link-bot/channels'),
    createChannel: (data) => apiService.post('/apk-link-bot/channels', data),
    updateChannel: (id, data) => apiService.put(`/apk-link-bot/channels/${id}`, data),
    deleteChannel: (id) => apiService.delete(`/apk-link-bot/channels/${id}`),

    // Groups
    getGroups: () => apiService.get('/apk-link-bot/groups'),
    createGroup: (data) => apiService.post('/apk-link-bot/groups', data),
    updateGroup: (id, data) => apiService.put(`/apk-link-bot/groups/${id}`, data),
    deleteGroup: (id) => apiService.delete(`/apk-link-bot/groups/${id}`),

    updateMainChannel: (data) => apiService.put('/apk-link-bot/config/main-apk-channel', data),
};
