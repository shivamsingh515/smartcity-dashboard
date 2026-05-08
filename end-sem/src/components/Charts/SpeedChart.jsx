import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import './Charts.css';

export default function SpeedChart({ speedHistory }) {
  if (!speedHistory || speedHistory.length < 2) {
    return (
      <div className="chart-placeholder">
        <span className="label">ISS SPEED CHART</span>
        <p className="body-sm" style={{ marginTop: '8px' }}>
          Collecting speed data... ({speedHistory?.length || 0}/2 measurements needed)
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <span className="label">ISS SPEED OVER TIME</span>
        <span className="meta">{speedHistory.length} measurements</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={speedHistory} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D7FF3F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D7FF3F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-heavy)',
              borderRadius: '0',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value.toLocaleString()} km/h`, 'Speed']}
          />
          <Area
            type="monotone"
            dataKey="speed"
            stroke="#D7FF3F"
            strokeWidth={2}
            fill="url(#speedGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#D7FF3F', stroke: '#111' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
