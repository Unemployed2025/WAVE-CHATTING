import axios from "./axiosConfig";

export const messageAPI = {
  getMessagesBetweenUsers: async (friendId) => {
    const response = await axios.get(`/messages/allmessages/${friendId}`);
    return response.data;
  },

  createGroup: async (groupData) => {
    const response = await axios.post("/messages/group", groupData);
    return response.data;
  },

  getGroupMessages: async (groupId) => {
    const response = await axios.get(`/messages/group/${groupId}`);
    return response.data;
  },

  getGroups: async () => {
    const response = await axios.get("/messages/groups");
    return response.data;
  },

  sendGroupMessage: async (groupId, messageData) => {
    const response = await axios.post(
      `/messages/group/${groupId}/message`,
      messageData
    );
    return response.data;
  },
};
