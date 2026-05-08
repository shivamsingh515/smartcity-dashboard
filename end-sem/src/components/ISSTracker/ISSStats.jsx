import React from 'react';
import { MapPin, Gauge, Navigation, Hash } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export default function ISSStats({ position, currentSpeed, locationName, positionsTracked, loading }) {
  if (loading) {
    return (
      <div className="iss-stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="iss-stat-card">
            <Skeleton className="skeleton-text" style={{ width: '40%' }} />
            <Skeleton className="skeleton-title" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: <MapPin size={12} />,
      label: 'LATITUDE',
      value: position ? position.lat.toFixed(4) : '--',
      unit: 'degrees',
    },
    {
      icon: <Navigation size={12} />,
      label: 'LONGITUDE',
      value: position ? position.lon.toFixed(4) : '--',
      unit: 'degrees',
    },
    {
      icon: <Gauge size={12} />,
      label: 'SPEED',
      value: currentSpeed ? currentSpeed.toLocaleString() : '—',
      unit: 'km/h',
    },
    {
      icon: <Hash size={12} />,
      label: 'POSITIONS TRACKED',
      value: positionsTracked,
      unit: `Location: ${locationName}`,
    },
  ];

  return (
    <div className="iss-stat-grid">
      {stats.map((stat, i) => (
        <div key={i} className="iss-stat-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <span className="label">
            {stat.icon} {stat.label}
          </span>
          <div className="iss-stat-value">{stat.value}</div>
          <div className="iss-stat-unit">{stat.unit}</div>
        </div>
      ))}
    </div>
  );
}
