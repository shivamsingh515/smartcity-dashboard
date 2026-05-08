import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LoadingSpinner } from '../ui/Skeleton';

// Custom ISS icon
const issIcon = new L.DivIcon({
  className: 'iss-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #D7FF3F;
    border: 2px solid #111;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 0 20px rgba(215,255,63,0.5);
  ">🛰️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to auto-pan map to ISS position
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lon], map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function ISSMap({ position, trajectory, loading }) {
  if (loading || !position) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '400px',
        background: 'var(--bg-secondary)',
      }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <MapContainer
      center={[position.lat, position.lon]}
      zoom={3}
      scrollWheelZoom={true}
      style={{ height: '100%', minHeight: '400px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapUpdater position={position} />

      <Marker position={[position.lat, position.lon]} icon={issIcon}>
        <Tooltip direction="top" offset={[0, -20]} permanent={false}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <strong>ISS</strong><br />
            Lat: {position.lat.toFixed(4)}<br />
            Lon: {position.lon.toFixed(4)}
          </div>
        </Tooltip>
      </Marker>

      {trajectory.length > 1 && (
        <Polyline
          positions={trajectory}
          pathOptions={{
            color: '#D7FF3F',
            weight: 2,
            opacity: 0.8,
            dashArray: '8, 4',
          }}
        />
      )}
    </MapContainer>
  );
}
