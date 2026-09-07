// src/api/loginService.js

import apiService from './apiService';

/**
 * Sends login event data to the backend.
 * The endpoint is now /admin/login-info.
 * @param {object} loginData - The login event details.
 * @returns {Promise}
 */
// 👇 THIS IS THE ONLY LINE THAT CHANGES. The path is now '/admin/login-info'.
const recordLogin = (loginData) => apiService.post('/admin/login-info', loginData);

/**
 * Fetches all recorded login events.
 * The endpoint remains /admin/login.
 * @returns {Promise} A promise that resolves to the list of login events.
 */
const getLoginEvents = () => apiService.get('/admin/login');

const verifyAuth = () => apiService.get('/features');

export const loginService = {
    recordLogin,
    getLoginEvents,
    verifyAuth,
};