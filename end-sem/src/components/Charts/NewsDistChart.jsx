import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#D7FF3F', '#DCEEFF', '#FF6B6B', '#4ECDC4', '#9B59B6', '#F39C12'];

export default function NewsDistChart({ categoryData, onCategoryClick, activeCategory }) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="chart-placeholder">
        <span className="label">NEWS DISTRIBUTION</span>
        <p className="body-sm" style={{ marginTop: '8px' }}>
          Loading news data...
        </p>
      </div>
    );
  }

  const handleClick = (data) => {
    if (onCategoryClick) {
      // Toggle: if already active, clear it
      onCategoryClick(activeCategory === data.name ? null : data.name);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <span className="label">NEWS BY CATEGORY</span>
        {activeCategory && (
          <button
            className="btn btn-sm"
            onClick={() => onCategoryClick(null)}
            style={{ fontSize: '0.6rem' }}
          >
            CLEAR FILTER
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="var(--bg-primary)"
                strokeWidth={2}
                opacity={activeCategory && activeCategory !== entry.name ? 0.3 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-heavy)',
              borderRadius: '0',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
            }}
            formatter={(value, name) => [`${value} articles`, name.toUpperCase()]}
          />
          <Legend
            formatter={(value) => (
              <span style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--text-secondary)',
              }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
