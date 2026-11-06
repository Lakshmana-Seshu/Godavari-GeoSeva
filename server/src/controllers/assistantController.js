import {
  processAssistantChat,
  assistantTelemetry,
  getSuggestedQuestions
} from '../services/aiAssistantService.js';

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, language = 'en', location = null, userLocation = null, isVoice = false } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message string is required.'
      });
    }

    const resolvedLocation = userLocation || location;

    const result = await processAssistantChat({
      message,
      language,
      location: resolvedLocation,
      isVoice: Boolean(isVoice)
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssistantAnalytics = async (req, res) => {
  const avgLatency =
    assistantTelemetry.successfulQueries > 0
      ? Math.round(assistantTelemetry.totalLatencyMs / assistantTelemetry.successfulQueries)
      : 0;

  return res.status(200).json({
    success: true,
    data: {
      totalQueries: assistantTelemetry.totalQueries,
      successfulQueries: assistantTelemetry.successfulQueries,
      failedQueries: assistantTelemetry.failedQueries,
      voiceQueries: assistantTelemetry.voiceQueryCount,
      averageLatencyMs: avgLatency,
      languageDistribution: assistantTelemetry.languageCounts,
      topCategories: assistantTelemetry.categorySearches,
      recentQueries: assistantTelemetry.recentQueries.slice(-10)
    }
  });
};

export const getAssistantSuggestions = async (req, res) => {
  const lang = (req.query.lang || req.query.language || 'en').toLowerCase().slice(0, 2);
  const suggestions = getSuggestedQuestions(lang);

  return res.status(200).json({
    success: true,
    data: {
      language: lang,
      suggestions
    }
  });
};
