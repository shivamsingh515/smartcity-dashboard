// Global State for Chatbot Context
let dashboardData = {
  weather: null,
  currency: null,
  citizen: null,
  fact: null
};

// ==========================================
// API FETCHING LOGIC
// ==========================================

async function fetchWeather() {
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=18.52&longitude=73.86&current_weather=true");
    const data = await res.json();
    dashboardData.weather = data.current_weather;
    
    document.getElementById("weather-temp").innerText = `${data.current_weather.temperature}°C`;
    document.getElementById("weather-wind").innerText = `${data.current_weather.windspeed} km/h`;
    document.getElementById("weather-code").innerText = data.current_weather.weathercode;
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

async function fetchCurrency() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
    const data = await res.json();
    dashboardData.currency = data.rates;
    
    document.getElementById("curr-usd").innerText = data.rates.USD.toFixed(4);
    document.getElementById("curr-eur").innerText = data.rates.EUR.toFixed(4);
    document.getElementById("curr-gbp").innerText = data.rates.GBP.toFixed(4);
  } catch (error) {
    console.error("Error fetching currency:", error);
  }
}

async function fetchCitizen() {
  try {
    const res = await fetch("https://randomuser.me/api/");
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const user = data.results[0];
      dashboardData.citizen = user;
      
      document.getElementById("citizen-photo").src = user.picture.large;
      document.getElementById("citizen-name").innerText = `${user.name.first} ${user.name.last}`.toUpperCase();
      document.getElementById("citizen-email").innerText = user.email;
      document.getElementById("citizen-city").innerText = user.location.city.toUpperCase();
    } else {
      console.error("Citizen data structure invalid:", data);
    }
  } catch (error) {
    console.error("Error fetching citizen:", error);
  }
}

async function fetchFact() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
    const data = await res.json();
    dashboardData.fact = data.text;
    
    document.getElementById("city-fact").innerText = data.text;
  } catch (error) {
    console.error("Error fetching fact:", error);
  }
}

// Initialize all data on load
window.onload = () => {
  fetchWeather();
  fetchCurrency();
  fetchCitizen();
  fetchFact();
};

// ==========================================
// CHATBOT LOGIC
// ==========================================

function toggleChat() {
  const body = document.getElementById("chat-body");
  const icon = document.querySelector(".toggle-icon");
  if (body.style.display === "none") {
    body.style.display = "flex";
    icon.innerText = "[ - ]";
  } else {
    body.style.display = "none";
    icon.innerText = "[ + ]";
  }
}

function handleEnter(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

function appendMessage(text, sender) {
  const messagesDiv = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.innerText = text;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// OpenRouter API Key - loaded from config.js (local) or localStorage (deployed)
function getApiKey() {
  // Try config.js first (for local development)
  if (typeof CONFIG !== 'undefined' && CONFIG.OPENROUTER_KEY) {
    return CONFIG.OPENROUTER_KEY;
  }
  // Try localStorage (for deployed version)
  let key = localStorage.getItem("openrouter_key");
  if (key) return key;
  // Ask user to enter key
  key = prompt("Enter your OpenRouter API key to enable the AI chatbot:");
  if (key) {
    localStorage.setItem("openrouter_key", key);
    return key;
  }
  return null;
}

// Free models to try in order (fallback chain)
const FREE_MODELS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free"
];

// Try calling OpenRouter with a specific model
async function callOpenRouter(model, systemPrompt, userPrompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No API key provided.");
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await response.json();

  // If the API returned an error (rate-limit, 404, etc.), throw so we can try next model
  if (data.error) {
    throw new Error(`[${model}] ${data.error.message}`);
  }

  // If the response has valid choices, return the reply
  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
    return data.choices[0].message.content;
  }

  throw new Error(`[${model}] Unexpected response structure.`);
}

async function sendMessage() {
  const inputEl = document.getElementById("chat-input");
  const userQuestion = inputEl.value.trim();
  if (!userQuestion) return;

  // Add User Message
  appendMessage(userQuestion, "user");
  inputEl.value = "";
  
  // Add temporary loading message
  const loadingId = "msg-" + Date.now();
  const messagesDiv = document.getElementById("chat-messages");
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message bot";
  loadingDiv.id = loadingId;
  loadingDiv.innerText = "Analyzing live data...";
  messagesDiv.appendChild(loadingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Build Context String from global dashboard data
  const contextData = `
CURRENT DASHBOARD DATA:
- Weather: ${dashboardData.weather ? `Temp: ${dashboardData.weather.temperature}°C, Wind: ${dashboardData.weather.windspeed} km/h, Weather Code: ${dashboardData.weather.weathercode}` : 'Not loaded yet'}
- Currency (1 INR =): ${dashboardData.currency ? `USD ${dashboardData.currency.USD}, EUR ${dashboardData.currency.EUR}, GBP ${dashboardData.currency.GBP}` : 'Not loaded yet'}
- Featured Citizen: ${dashboardData.citizen ? `${dashboardData.citizen.name.first} ${dashboardData.citizen.name.last}, City: ${dashboardData.citizen.location.city}, Email: ${dashboardData.citizen.email}` : 'Not loaded yet'}
- City Fact of the Day: ${dashboardData.fact || 'Not loaded yet'}

INSTRUCTIONS: You are a smart city AI assistant. Answer the user's question ONLY using the live dashboard data provided above. Be helpful, concise, and conversational. Do not make up any information that is not in the data above.
`;

  // Try each free model in sequence until one works
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const botReply = await callOpenRouter(model, contextData, userQuestion);
      document.getElementById(loadingId).innerText = botReply;
      return; // Success! Stop trying more models.
    } catch (err) {
      console.warn(`Model failed: ${err.message}`);
      lastError = err;
    }
  }

  // All models failed
  console.error("All AI models failed:", lastError);
  document.getElementById(loadingId).innerText = "Sorry, all AI models are currently busy. Please try again in a few seconds.";
}
