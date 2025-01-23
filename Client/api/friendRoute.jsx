import axios from './axiosConfig';

export const friendAPI = {
    getFriendsList: async () => {
        const response = await axios.get('/friend/friends');
        return response.data;
    },

    sendFriendRequest: async (receiverId) => {
        const response = await axios.post('/friend/friend-request', { receiverId });
        return response.data;
    },

    acceptFriendRequest: async (requestId) => {
        const response = await axios.post('/friend/friend-request/accept', { requestId });
        return response.data;
    },

    getPendingRequests: async () => {
        const response = await axios.get('/friend/friend-request/pending');
        return response.data;
    },

    checkFriendshipStatus: async (targetUserId) => {
        const response = await axios.get(`/friend/friend-request/friendship-status/${targetUserId}`);
        return response.data;
    }
};