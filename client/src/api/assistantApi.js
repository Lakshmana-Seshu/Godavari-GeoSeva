import api from './client';

export const assistantApi = {
  chat: async ({ message, language = 'en', userLocation = null, conversationHistory = [] }) => {
    const response = await api.post('/assistant/chat', {
      message,
      language,
      userLocation,
      conversationHistory,
    });
    return response.data;
  },

  getSuggestions: async (language = 'en') => {
    const response = await api.get('/assistant/suggestions', {
      params: { language },
    });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/assistant/analytics');
    return response.data;
  },
};

export default assistantApi;

