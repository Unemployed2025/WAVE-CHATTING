import axios from './axiosConfig';

export const userAPI = {
    register: async (userData) => {
        const response = await axios.post('/users/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await axios.post('/users/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await axios.post('/users/logout');
        return response.data;
    },

    searchUsers: async (query) => {
        try {
            console.log('Searching for:', query);
            const response = await axios.get(`/users/search?query=${encodeURIComponent(query)}`);
            console.log('Search response:', response.data);
            return response.data;
          } catch (error) {
            console.error('Search API error:', error.response || error);
            throw error;
          }
    },

    getCurrentUserId: async () => {
        const response = await axios.get('/users/userId');
        return response.data;
    }
};