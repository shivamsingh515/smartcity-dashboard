import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton className="skeleton-title" />
      <Skeleton className="skeleton-text" style={{ width: '90%' }} />
      <Skeleton className="skeleton-text" style={{ width: '60%' }} />
      <Skeleton className="skeleton-img" />
      <Skeleton className="skeleton-text" style={{ width: '40%' }} />
    </div>
  );
}

export function ErrorRetry({ message, onRetry }) {
  return (
    <div className="error-state">
      <AlertTriangle size={32} style={{ color: 'var(--error-color)' }} />
      <span className="label" style={{ color: 'var(--error-color)' }}>ERROR</span>
      <p className="body-sm">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = 24 }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: '2px solid var(--border-color)',
      borderTopColor: 'var(--accent-lime)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
