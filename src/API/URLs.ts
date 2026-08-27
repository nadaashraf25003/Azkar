export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://azkaar-web.runasp.net'

export const URLS = {
  // Adhkar Endpoints
  ADHKAAR: {
    LIST: '/adhkar',
    CATEGORIES: '/adhkar/categories',
    BY_CATEGORY: (categoryId: string) => `/adhkar/by-category/${categoryId}`,
    BY_ID: (id: string) => `/adhkar/${id}`,
    ADD: '/adhkar',
    DELETE: (id: string) => `/adhkar/${id}`,
    DAILY_PROGRESS: '/adhkar/progress/today',
    UPDATE_PROGRESS: '/adhkar/progress',
    DEVICE_OPEN: '/adhkar/device-open',
  },

  // Prayer Endpoints
  PRAYER: {
    TIMES: '/prayer/times',
    QIBLA: '/prayer/qibla',
    SETTINGS: '/prayer/settings',
  },

  // Content Endpoints
  CONTENT: {
    ASMAA_ALLAH: '/content/asmaa-allah',
    SEERAH: '/content/seerah',
    ADD_SEERAH: '/content/seerah',
    DELETE_SEERAH: (id: string) => `/content/seerah/${id}`,
    RELIGIOUS_INFO: '/content/religious-info',
    ADD_RELIGIOUS_INFO: '/content/religious-info',
    DELETE_RELIGIOUS_INFO: (id: string) => `/content/religious-info/${id}`,
    DAILY_MESSAGE: '/content/daily-message',
    MESSAGES: '/content/messages',
    ADD_MESSAGE: '/content/messages',
    DELETE_MESSAGE: (id: string) => `/content/messages/${id}`,
  },

  // Questions (Q&A) Endpoints
  QUESTIONS: {
    LIST: '/questions',
    DETAILS: (id: string) => `/questions/${id}`,
    ASK: '/questions',
    ADD_ANSWER: '/questions/answers',
    DELETE: (id: string) => `/questions/${id}`,
    DELETE_ANSWER: (id: string) => `/questions/answers/${id}`,
  },

  // Quran Recitations Endpoints
  RECITATIONS: {
    LIST: '/recitations',
    SUBMIT: '/recitations',
    APPROVE: (id: string) => `/recitations/${id}/approve`,
    REJECT: (id: string) => `/recitations/${id}/reject`,
    COMMENTS: (id: string) => `/recitations/${id}/comments`,
    RATE: (id: string) => `/recitations/${id}/rate`,
    DELETE: (id: string) => `/recitations/${id}`,
    DELETE_COMMENT: (id: string) => `/recitations/comments/${id}`,
  },

  // Kids Endpoints
  KIDS: {
    STORIES: '/kids/stories',
    ADD_STORY: '/kids/stories',
    DELETE_STORY: (id: string) => `/kids/stories/${id}`,
    CHALLENGES: '/kids/challenges',
    ADD_CHALLENGE: '/kids/challenges',
    DELETE_CHALLENGE: (id: string) => `/kids/challenges/${id}`,
    QUIZZES: '/kids/quizzes',
    ADD_QUIZ: '/kids/quizzes',
    DELETE_QUIZ: (id: string) => `/kids/quizzes/${id}`,
    PROGRESS: '/kids/progress',
    POINTS: '/kids/points',
  },

  // Tasbeeh Endpoints
  TASBEEH: {
    PRESETS: '/tasbeeh/presets',
    ADD_PRESET: '/tasbeeh/presets',
    DELETE_PRESET: (id: string) => `/tasbeeh/presets/${id}`,
    SESSION: '/tasbeeh/session',
    STATS: '/tasbeeh/stats',
  },

  // Favorites Endpoints
  FAVORITES: {
    LIST: '/favorites',
    TOGGLE: '/favorites/toggle',
  },

  // Admin Endpoints
  ADMIN: {
    STATS: '/admin/stats',
    REPORTS: '/admin/reports',
    DEVICES: '/admin/devices',
    DEVICES_SUMMARY: '/admin/devices/summary',
    DEVICES_LOG: '/admin/devices/log',
    DEVICES_CLEAR: '/admin/devices/clear',
  },
} as const

export default URLS
