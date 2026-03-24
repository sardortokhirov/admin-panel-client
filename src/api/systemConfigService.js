// src/api/systemConfigService.js
import axios from 'axios';
import { API_BASE_URL } from './apiService';

// Ensure baseURL ends with /api/ (one slash at the end)
const CLEAN_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

const configApi = axios.create({
    baseURL: CLEAN_BASE_URL,
    auth: {
        username: 'MaxUp1000',
        password: 'MaxUp1000'
    },
    headers: {
        'Content-Type': 'application/json'
    }
});

const systemConfigService = {
    /**
     * GET /api/config
     * Returns the latest config or creates and returns defaults.
     */
    getLatestConfig: async () => {
        try {
            // Using 'config' because baseURL already ends in '/api/'
            const response = await configApi.get('config');
            return response.data;
        } catch (error) {
            console.error("Error fetching system config:", error);
            throw error;
        }
    },

    /**
     * POST /api/config
     * Saves a new config entity (history).
     */
    createConfig: async (configData) => {
        try {
            const { id, createdAt, ...data } = configData;
            const response = await configApi.post('config', data);
            return response.data;
        } catch (error) {
            console.error("Error creating system config:", error);
            throw error;
        }
    },

    /**
     * PUT /api/config/{id}
     * Updates an existing config row.
     */
    updateConfig: async (id, configData) => {
        try {
            const response = await configApi.put(`config/${id}`, configData);
            return response.data;
        } catch (error) {
            console.error("Error updating system config:", error);
            throw error;
        }
    }
};

export default systemConfigService;
