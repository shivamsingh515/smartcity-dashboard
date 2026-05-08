import React from 'react';
import { Sun, Moon, Satellite, Menu } from 'lucide-react';
import './Header.css';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header col-full">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <Satellite size={18} />
          </div>
          <div className="header-brand-text">
            <span className="header-title">SMARTCITY</span>
            <span className="header-subtitle">DASHBOARD</span>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#iss" className="header-link">
            <span className="header-link-num">01</span>
            ISS
          </a>
          <a href="#charts" className="header-link">
            <span className="header-link-num">04</span>
            DATA
          </a>
          <a href="#news" className="header-link">
            <span className="header-link-num">02</span>
            NEWS
          </a>
        </nav>

        <div className="header-actions">
          <div className="header-status">
            <span className="live-dot"></span>
            <span className="label" style={{ color: 'var(--success-color)' }}>LIVE</span>
          </div>
          <button
            className="btn-icon header-theme-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            id="theme-toggle"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
