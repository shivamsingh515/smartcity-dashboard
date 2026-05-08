import React from 'react';
import { ExternalLink, Clock, User } from 'lucide-react';
import { formatDate } from '../../utils/api';

export default function NewsCard({ article, featured = false }) {
  const { title, description, url, urlToImage, source, author, publishedAt, category } = article;

  return (
    <article className={`card news-card ${featured ? 'news-card-featured' : ''}`}>
      {urlToImage && (
        <div className="news-card-image-wrapper">
          <img
            src={urlToImage}
            alt={title || 'News image'}
            className="news-card-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            loading="lazy"
          />
        </div>
      )}

      <div className="news-card-content">
        <div className="news-card-meta">
          <span className="news-card-category">{category?.toUpperCase()}</span>
          <span className="meta">
            <Clock size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {formatDate(publishedAt)}
          </span>
        </div>

        <h3 className={featured ? 'heading-md' : 'heading-sm'} style={{ margin: '8px 0' }}>
          {title || 'Untitled'}
        </h3>

        {description && (
          <p className="body-sm news-card-desc">
            {description.slice(0, featured ? 200 : 120)}
            {description.length > (featured ? 200 : 120) ? '...' : ''}
          </p>
        )}

        <div className="news-card-footer">
          <div className="news-card-source">
            <span className="meta">
              <User size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {author || source?.name || 'Unknown'}
            </span>
            {source?.name && author && (
              <span className="meta"> — {source.name}</span>
            )}
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            id={`read-more-${article.id}`}
          >
            READ MORE
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </article>
  );
}
