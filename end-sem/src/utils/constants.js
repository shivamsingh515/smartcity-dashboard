// API endpoints and configuration constants
const isProd = import.meta.env.PROD;

export const ISS_POSITION_URL = isProd ? '/api/iss-position' : 'http://api.open-notify.org/iss-now.json';
export const ISS_ASTROS_URL = isProd ? '/api/iss-astros' : 'http://api.open-notify.org/astros.json';
export const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

export const NEWS_API_BASE = 'https://newsapi.org/v2';
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// Hugging Face — NEW router API (OpenAI-compatible chat completions)
export const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';
export const HF_TOKEN = import.meta.env.VITE_AI_TOKEN || '';

// Models that work with the router API (verified)
export const HF_MODELS = [
  'meta-llama/Llama-3.1-8B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'microsoft/Phi-3-mini-4k-instruct',
];

// ISS config
export const ISS_POLL_INTERVAL = 15000; // 15 seconds
export const MAX_TRAJECTORY_POINTS = 15;
export const MAX_SPEED_HISTORY = 30;

// News config
export const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
export const NEWS_ARTICLES_PER_CATEGORY = 5;
export const NEWS_CATEGORIES = ['technology', 'science'];

// Chatbot config
export const MAX_CHAT_MESSAGES = 30;
