import { useState, useCallback, useRef } from 'react';
import { getFromStorage, setToStorage } from '../utils/api';
import { HF_CHAT_URL, HF_MODELS, HF_TOKEN, MAX_CHAT_MESSAGES } from '../utils/constants';

const STORAGE_KEY = 'smartcity_chat_history';
const MODEL_KEY = 'smartcity_working_model_idx';

export function useChatbot(dashboardData) {
  const [messages, setMessages] = useState(() => {
    return getFromStorage(STORAGE_KEY) || [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const workingModelIdx = useRef(getFromStorage(MODEL_KEY) ?? 0);

  // Build context from dashboard data
  const buildContext = useCallback(() => {
    const { issData, newsData } = dashboardData || {};
    let context = '';

    if (issData) {
      context += `ISS DATA:\n`;
      context += `- Position: Lat ${issData.position?.lat?.toFixed(4) || 'N/A'}, Lon ${issData.position?.lon?.toFixed(4) || 'N/A'}\n`;
      context += `- Speed: ${issData.currentSpeed || 0} km/h\n`;
      context += `- Location: ${issData.locationName || 'Unknown'}\n`;
      context += `- Positions Tracked: ${issData.positionsTracked || 0}\n`;
      if (issData.astronauts?.people?.length > 0) {
        context += `- People in Space: ${issData.astronauts.number}\n`;
        context += `- Names: ${issData.astronauts.people.map(p => `${p.name} (${p.craft})`).join(', ')}\n`;
      }
    }

    if (newsData?.articles?.length > 0) {
      context += `\nNEWS (${newsData.articles.length} articles):\n`;
      newsData.articles.slice(0, 8).forEach((a, i) => {
        context += `${i + 1}. "${a.title || 'Untitled'}" - ${a.source?.name || 'Unknown'}\n`;
      });
    }

    return context || 'Dashboard data is still loading.';
  }, [dashboardData]);

  // Add a message
  const addMessage = useCallback((msg) => {
    setMessages(prev => {
      const updated = [...prev, msg].slice(-MAX_CHAT_MESSAGES);
      setToStorage(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  // Try calling a model via the OpenAI-compatible chat completions API
  const tryModel = async (modelId, systemPrompt, userMessage) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(HF_CHAT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 250,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data = await response.json();

      // OpenAI-compatible response format
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Empty response from model');
      }

      return text.trim();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    }
  };

  // Send message
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    addMessage({ role: 'user', content: userMessage, timestamp: Date.now() });
    setIsTyping(true);

    try {
      if (!HF_TOKEN || HF_TOKEN.includes('your_')) {
        addMessage({
          role: 'assistant',
          content: '⚠️ Hugging Face token not set. Add VITE_AI_TOKEN to .env and restart.',
          timestamp: Date.now(),
        });
        setIsTyping(false);
        return;
      }

      const context = buildContext();

      const systemPrompt = `You are a Smart City Dashboard assistant. Answer ONLY using the dashboard data below. Do NOT use external knowledge. If the answer is not in the data, say "I don't have that information in the current dashboard data."

DASHBOARD DATA:
${context}

Answer concisely and helpfully based ONLY on the above data.`;

      let aiText = null;

      // Try the cached working model first
      const cachedIdx = workingModelIdx.current;
      if (cachedIdx !== null && cachedIdx < HF_MODELS.length) {
        try {
          aiText = await tryModel(HF_MODELS[cachedIdx], systemPrompt, userMessage);
        } catch (e) {
          console.warn(`Cached model ${HF_MODELS[cachedIdx]} failed:`, e.message);
        }
      }

      // Try all models in order
      if (!aiText) {
        for (let i = 0; i < HF_MODELS.length; i++) {
          try {
            console.log(`🔄 Trying: ${HF_MODELS[i]}...`);
            aiText = await tryModel(HF_MODELS[i], systemPrompt, userMessage);
            workingModelIdx.current = i;
            setToStorage(MODEL_KEY, i);
            console.log(`✅ Success: ${HF_MODELS[i]}`);
            break;
          } catch (e) {
            console.warn(`❌ ${HF_MODELS[i]}: ${e.message}`);
          }
        }
      }

      if (aiText) {
        addMessage({ role: 'assistant', content: aiText, timestamp: Date.now() });
      } else {
        // All models failed — use local smart fallback
        const fallback = generateLocalResponse(userMessage, dashboardData);
        addMessage({ role: 'assistant', content: fallback, timestamp: Date.now() });
      }
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [buildContext, addMessage, dashboardData]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    workingModelIdx.current = 0;
    localStorage.removeItem(MODEL_KEY);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { messages, isTyping, isOpen, sendMessage, clearChat, toggleOpen };
}

// Smart local fallback when AI is unavailable
function generateLocalResponse(question, data) {
  const q = question.toLowerCase();
  const iss = data?.issData;
  const news = data?.newsData;

  if (q.includes('where') || q.includes('location') || q.includes('position')) {
    if (iss?.position) {
      return `🛰️ The ISS is currently at:\n• Latitude: ${iss.position.lat.toFixed(4)}\n• Longitude: ${iss.position.lon.toFixed(4)}\n• Near: ${iss.locationName || 'calculating...'}`;
    }
  }

  if (q.includes('speed') || q.includes('fast')) {
    if (iss?.currentSpeed) {
      return `⚡ The ISS is traveling at ~${iss.currentSpeed.toLocaleString()} km/h (${(iss.currentSpeed / 1235).toFixed(1)}x the speed of sound!)`;
    }
  }

  if (q.includes('astronaut') || q.includes('people') || q.includes('who') || q.includes('space')) {
    if (iss?.astronauts?.people?.length > 0) {
      const names = iss.astronauts.people.map(p => `• ${p.name} (${p.craft})`).join('\n');
      return `👨‍🚀 ${iss.astronauts.number} people in space:\n\n${names}`;
    }
  }

  if (q.includes('news') || q.includes('article') || q.includes('headline')) {
    if (news?.articles?.length > 0) {
      const headlines = news.articles.slice(0, 5).map((a, i) => `${i + 1}. "${a.title}" — ${a.source?.name}`).join('\n');
      return `📰 Latest headlines:\n\n${headlines}`;
    }
  }

  return `I can help you with dashboard data! Try asking:\n• "Where is the ISS?"\n• "How fast is the ISS?"\n• "Who is in space?"\n• "Show me the news"`;
}
