import React from 'react';
import { Users } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export default function AstronautList({ astronauts, loading }) {
  if (loading) {
    return (
      <div className="astronaut-section">
        <Skeleton className="skeleton-text" style={{ width: '50%' }} />
        <Skeleton className="skeleton-title" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="skeleton-text" style={{ marginBottom: '12px' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="astronaut-section">
      <span className="label"><Users size={12} /> PEOPLE IN SPACE RIGHT NOW</span>
      <div className="astronaut-count">{astronauts.number}</div>

      <ul className="astronaut-list">
        {astronauts.people.map((person, i) => (
          <li key={i} className="astronaut-item fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <span>{person.name}</span>
            <span className="astronaut-craft">{person.craft}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
