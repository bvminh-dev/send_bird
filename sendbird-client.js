const axios = require('axios');
require('dotenv').config();

class SendBirdClient {
    constructor() {
        this.applicationId = process.env.SENDBIRD_APPLICATION_ID;
        this.apiToken = process.env.SENDBIRD_API_TOKEN;
        this.baseURL = `https://api-${this.applicationId}.sendbird.com`;
        
        if (!this.applicationId || !this.apiToken) {
            throw new Error('SENDBIRD_APPLICATION_ID and SENDBIRD_API_TOKEN must be set in environment variables');
        }
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Api-Token': this.apiToken,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Get user token for a specific user
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - Response from SendBird API
     */
    async getUserToken(userId) {
        try {
            console.log(`Getting token for user: ${userId}`);
            const response = await this.client.post(`/v3/users/${encodeURIComponent(userId)}/token`, {});
            console.log('User token retrieved successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error getting user token:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data object
     * @param {string} userData.user_id - User ID
     * @param {string} userData.nickname - User nickname
     * @param {string} userData.profile_url - User profile URL
     * @param {boolean} userData.issue_access_token - Whether to issue access token
     * @returns {Promise<Object>} - Response from SendBird API
     */
    async createUser(userData) {
        try {
            console.log('Creating user with data:', userData);
            const response = await this.client.post('/v3/users', userData);
            console.log('User created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = SendBirdClient; 