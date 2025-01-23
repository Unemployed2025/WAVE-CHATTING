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
        const response = await axios.get(`/users/search?query=${query}`);
        return response.data;
    },

    getCurrentUserId: async () => {
        const response = await axios.get('/users/userId');
        return response.data;
    }
};