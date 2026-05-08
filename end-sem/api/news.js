// Vercel Serverless Function — proxies NewsAPI requests to avoid CORS on production
// This file runs server-side on Vercel, keeping the API key hidden

export default async function handler(req, res) {
  const { category = 'technology', q, pageSize = 5 } = req.query;
  const apiKey = process.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'News API key not configured' });
  }

  try {
    let url;
    if (q) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&apiKey=${apiKey}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=900'); // Cache for 15 minutes

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
}
