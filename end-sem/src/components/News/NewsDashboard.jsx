import React from 'react';
import NewsCard from './NewsCard';
import { Search, RefreshCw, Newspaper } from 'lucide-react';
import { SkeletonCard, ErrorRetry } from '../ui/Skeleton';
import toast from 'react-hot-toast';
import './News.css';

export default function NewsDashboard({ newsData }) {
  const {
    filteredArticles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    refresh,
    refreshCategory,
    categories,
  } = newsData;

  const handleRefresh = () => {
    refresh();
    toast.success('News refreshed!', { icon: '📰' });
  };

  const handleCategoryRefresh = (cat) => {
    refreshCategory(cat);
    toast.success(`${cat.toUpperCase()} refreshed!`, { icon: '🔄' });
  };

  return (
    <>
      {/* News Section Title */}
      <div className="section-title col-full" id="news">
        <span className="section-number">02</span>
        <div className="flex items-center justify-between">
          <div>
            <span className="label"><Newspaper size={12} /> PART 02 — INFORMATION</span>
            <h2 className="heading-lg" style={{ marginTop: '8px' }}>
              NEWS DASHBOARD
            </h2>
          </div>
          <button className="btn" onClick={handleRefresh} id="news-refresh-btn">
            <RefreshCw size={14} />
            <span>REFRESH ALL</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="news-controls col-full">
        <div className="news-controls-inner">
          <div className="news-search-wrapper">
            <Search size={14} className="news-search-icon" />
            <input
              type="text"
              className="input news-search"
              placeholder="SEARCH ARTICLES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="news-search-input"
            />
          </div>

          <div className="news-controls-right">
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="news-sort-select"
            >
              <option value="date-desc">NEWEST FIRST</option>
              <option value="date-asc">OLDEST FIRST</option>
              <option value="source">BY SOURCE</option>
            </select>

            {categories.map((cat) => (
              <button
                key={cat}
                className="btn btn-sm"
                onClick={() => handleCategoryRefresh(cat)}
              >
                <RefreshCw size={10} />
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles */}
      {error && !filteredArticles.length ? (
        <div className="col-full">
          <ErrorRetry message={error} onRetry={handleRefresh} />
        </div>
      ) : loading ? (
        <>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={i <= 2 ? 'col-6' : 'col-4'}>
              <SkeletonCard />
            </div>
          ))}
        </>
      ) : (
        filteredArticles.map((article, i) => (
          <div
            key={article.id || i}
            className={`${i < 2 ? 'col-6' : 'col-4'} fade-in`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <NewsCard article={article} featured={i < 2} />
          </div>
        ))
      )}

      {!loading && filteredArticles.length === 0 && !error && (
        <div className="col-full text-center" style={{ padding: 'var(--space-2xl)' }}>
          <p className="heading-md">NO ARTICLES FOUND</p>
          <p className="body-sm" style={{ marginTop: '8px' }}>
            Try adjusting your search or refresh the data.
          </p>
        </div>
      )}
    </>
  );
}
