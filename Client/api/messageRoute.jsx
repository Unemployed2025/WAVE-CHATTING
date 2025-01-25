import axios from './axiosConfig';

export const messageAPI = {
    getMessagesBetweenUsers: async (friendId) => {
        const response = await axios.get(`/messages/allmessages/${friendId}`);
        return response.data;
    }
};