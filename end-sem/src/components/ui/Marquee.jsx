import React from 'react';

export default function Marquee({ items }) {
  const text = items.join('  ★  ');
  // Duplicate for seamless loop
  const content = `${text}  ★  ${text}  ★  `;

  return (
    <div className="marquee-strip col-full" style={{ padding: '8px 0' }}>
      <div className="marquee-content">
        {content}
      </div>
    </div>
  );
}
