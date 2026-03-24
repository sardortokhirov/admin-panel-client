// src/api/systemConfigService.js
import axios from 'axios';

// Base URL: same as others but we might need a custom instance for Basic Auth
const API_BASE_URL = 'https://xonpey.shop:8082/api';

const authHeader = 'Basic ' + btoa('MaxUp1000:MaxUp1000');

const configApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': authHeader,
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
            const response = await configApi.get('/config');
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
            // Remove ID if present for creating a new row (history entry)
            const { id, createdAt, ...data } = configData;
            const response = await configApi.post('/config', data);
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
            const response = await configApi.put(`/config/${id}`, configData);
            return response.data;
        } catch (error) {
            console.error("Error updating system config:", error);
            throw error;
        }
    }
};

export default systemConfigService;
