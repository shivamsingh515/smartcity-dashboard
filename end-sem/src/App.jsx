import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { DashboardProvider } from './context/DashboardContext';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';
import { useTheme } from './hooks/useTheme';
import { useChatbot } from './hooks/useChatbot';
import Header from './components/Header/Header';
import Marquee from './components/ui/Marquee';
import ISSTracker from './components/ISSTracker/ISSTracker';
import NewsDashboard from './components/News/NewsDashboard';
import SpeedChart from './components/Charts/SpeedChart';
import NewsDistChart from './components/Charts/NewsDistChart';
import Chatbot from './components/Chatbot/Chatbot';
import { Satellite, Newspaper, BarChart3, Github, Globe } from 'lucide-react';
import './components/Charts/Charts.css';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const issData = useISS();
  const newsData = useNews();

  // Dashboard context for chatbot
  const dashboardData = {
    issData: {
      position: issData.position,
      currentSpeed: issData.currentSpeed,
      locationName: issData.locationName,
      positionsTracked: issData.positionsTracked,
      astronauts: issData.astronauts,
    },
    newsData: {
      articles: newsData.articles,
    },
  };

  const chatbot = useChatbot(dashboardData);

  // Marquee ticker items
  const marqueeItems = [
    `ISS SPEED: ${issData.currentSpeed?.toLocaleString() || '—'} KM/H`,
    `LOCATION: ${issData.locationName || 'CALCULATING'}`,
    `LAT ${issData.position?.lat?.toFixed(2) || '--'} / LON ${issData.position?.lon?.toFixed(2) || '--'}`,
    `${issData.astronauts?.number || '--'} PEOPLE IN SPACE`,
    `${newsData.articles?.length || 0} NEWS ARTICLES LOADED`,
    'SMARTCITY DASHBOARD — REAL-TIME DATA MONITORING',
  ];

  return (
    <DashboardProvider value={dashboardData}>
      <div className="dashboard-grid">
        {/* HEADER */}
        <Header theme={theme} onToggleTheme={toggleTheme} />

        {/* HERO SECTION */}
        <section className="hero-section col-full fade-in">
          <div className="hero-overline">
            <span>REAL-TIME MONITORING PLATFORM</span>
          </div>
          <h1 className="hero-heading glitch-text" data-text="SMARTCITY">
            SMART<span className="accent">CITY</span>
            <br />
            DASHBOARD
          </h1>
          <p className="body-sm" style={{ maxWidth: '500px', marginTop: 'var(--space-md)' }}>
            Live ISS tracking, global news aggregation, and AI-powered analytics — 
            all in one brutalist editorial interface.
          </p>

          <div className="hero-stats">
            <div className="hero-stat-item fade-in fade-in-1">
              <span className="hero-stat-value">{issData.currentSpeed?.toLocaleString() || '—'}</span>
              <span className="hero-stat-label">KM/H ISS SPEED</span>
            </div>
            <div className="hero-stat-item fade-in fade-in-2">
              <span className="hero-stat-value">{issData.astronauts?.number || '—'}</span>
              <span className="hero-stat-label">PEOPLE IN SPACE</span>
            </div>
            <div className="hero-stat-item fade-in fade-in-3">
              <span className="hero-stat-value">{newsData.articles?.length || '—'}</span>
              <span className="hero-stat-label">LIVE ARTICLES</span>
            </div>
            <div className="hero-stat-item fade-in fade-in-4">
              <span className="hero-stat-value">{issData.positionsTracked || '0'}</span>
              <span className="hero-stat-label">POSITIONS TRACKED</span>
            </div>
          </div>
        </section>

        {/* MARQUEE TICKER */}
        <Marquee items={marqueeItems} />

        {/* PART 1: ISS TRACKER */}
        <ISSTracker issData={issData} />

        {/* PART 4: CHARTS SECTION */}
        <div className="section-title col-full" id="charts">
          <span className="section-number">04</span>
          <div className="flex items-center justify-between">
            <div>
              <span className="label"><BarChart3 size={12} /> PART 04 — DATA VISUALIZATION</span>
              <h2 className="heading-lg" style={{ marginTop: '8px' }}>
                CHARTS & ANALYTICS
              </h2>
            </div>
          </div>
        </div>

        <div className="col-7" style={{ padding: 'var(--space-lg)' }}>
          <SpeedChart speedHistory={issData.speedHistory} />
        </div>

        <div className="col-5" style={{ padding: 'var(--space-lg)' }}>
          <NewsDistChart
            categoryData={newsData.getCategoryCount()}
            onCategoryClick={newsData.setActiveCategory}
            activeCategory={newsData.activeCategory}
          />
        </div>

        {/* MARQUEE 2 — separator */}
        <Marquee items={[
          'TECHNOLOGY', 'SCIENCE', 'GLOBAL NEWS', 'REAL-TIME DATA',
          'AI POWERED', 'LIVE TRACKING', 'OPEN DATA',
        ]} />

        {/* PART 2: NEWS DASHBOARD */}
        <NewsDashboard newsData={newsData} />

        {/* Footer */}
        <footer className="dashboard-footer col-full">
          <div className="footer-brand">SMARTCITY</div>
          <p className="meta">
            Built with React + Vite • ISS data via Open Notify API • AI by Mistral-7B
          </p>
          <div className="footer-links">
            <a href="#iss"><Satellite size={12} /> ISS TRACKER</a>
            <a href="#news"><Newspaper size={12} /> NEWS</a>
            <a href="#charts"><BarChart3 size={12} /> ANALYTICS</a>
          </div>
          <p className="label" style={{ marginTop: 'var(--space-lg)' }}>
            © 2026 — END SEMESTER PROJECT
          </p>
        </footer>
      </div>

      {/* PART 3: CHATBOT (floating, outside grid) */}
      <Chatbot chatbot={chatbot} />

      {/* Toast notifications */}
      <Toaster
        position="bottom-left"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '2px solid var(--border-heavy)',
            borderRadius: '0',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
          },
        }}
      />
    </DashboardProvider>
  );
}
