import { useState, useEffect, useCallback } from 'react';
import { fetchJSON, getFromStorage, setToStorage, isCacheFresh } from '../utils/api';
import {
  NEWS_API_BASE,
  NEWS_API_KEY,
  NEWS_CACHE_DURATION,
  NEWS_ARTICLES_PER_CATEGORY,
  NEWS_CATEGORIES,
} from '../utils/constants';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'smartcity_news_cache';

    // Check cache first
    if (!forceRefresh && isCacheFresh(cacheKey, NEWS_CACHE_DURATION)) {
      const cached = getFromStorage(cacheKey);
      if (cached && cached.articles) {
        setArticles(cached.articles);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const allArticles = [];

      for (const category of NEWS_CATEGORIES) {
        try {
          // Try newsapi.org first
          const url = `${NEWS_API_BASE}/top-headlines?category=${category}&language=en&pageSize=${NEWS_ARTICLES_PER_CATEGORY}&apiKey=${NEWS_API_KEY}`;
          const data = await fetchJSON(url);

          if (data.articles) {
            const tagged = data.articles.map((a) => ({
              ...a,
              category,
              id: `${category}-${a.title?.slice(0, 20) || Math.random()}`,
            }));
            allArticles.push(...tagged);
          }
        } catch (catErr) {
          console.warn(`Failed to fetch ${category}:`, catErr.message);
          // Try fallback — GNews
          try {
            const fallbackUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=${NEWS_ARTICLES_PER_CATEGORY}&apikey=${NEWS_API_KEY}`;
            const fallbackData = await fetchJSON(fallbackUrl);
            if (fallbackData.articles) {
              const tagged = fallbackData.articles.map((a) => ({
                title: a.title,
                description: a.description,
                url: a.url,
                urlToImage: a.image,
                source: { name: a.source?.name || 'Unknown' },
                author: a.source?.name || 'Unknown',
                publishedAt: a.publishedAt,
                category,
                id: `${category}-${a.title?.slice(0, 20) || Math.random()}`,
              }));
              allArticles.push(...tagged);
            }
          } catch {
            // Both failed for this category
          }
        }
      }

      if (allArticles.length === 0) {
        throw new Error('No articles could be fetched. Check your API key.');
      }

      setArticles(allArticles);
      setToStorage(cacheKey, { articles: allArticles, timestamp: Date.now() });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);

      // Try to show cached even if stale
      const cached = getFromStorage(cacheKey);
      if (cached && cached.articles) {
        setArticles(cached.articles);
      }
    }
  }, []);

  // Refresh a single category
  const refreshCategory = useCallback((category) => {
    fetchNews(true);
  }, [fetchNews]);

  // Filter and sort articles
  const getFilteredArticles = useCallback(() => {
    let filtered = [...articles];

    // Filter by active category from chart click
    if (activeCategory) {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
        break;
      case 'source':
        filtered.sort((a, b) => (a.source?.name || '').localeCompare(b.source?.name || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [articles, searchQuery, sortBy, activeCategory]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles,
    filteredArticles: getFilteredArticles(),
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    refreshCategory,
    refresh: () => fetchNews(true),
    categories: NEWS_CATEGORIES,
    getCategoryCount: () => {
      const counts = {};
      articles.forEach((a) => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  };
}
