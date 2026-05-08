import React from 'react';
import ISSMap from './ISSMap';
import ISSStats from './ISSStats';
import AstronautList from './AstronautList';
import { ErrorRetry } from '../ui/Skeleton';
import { RefreshCw, Satellite } from 'lucide-react';
import toast from 'react-hot-toast';
import './ISSTracker.css';

export default function ISSTracker({ issData }) {
  const {
    position,
    trajectory,
    currentSpeed,
    locationName,
    astronauts,
    loading,
    error,
    refresh,
    positionsTracked,
  } = issData;

  const handleRefresh = () => {
    refresh();
    toast.success('ISS data refreshed!', { icon: '🛰️' });
  };

  if (error && !position) {
    return (
      <section className="col-full" id="iss">
        <ErrorRetry message={error} onRetry={handleRefresh} />
      </section>
    );
  }

  return (
    <>
      {/* Section Title */}
      <div className="section-title col-full" id="iss">
        <span className="section-number">01</span>
        <div className="flex items-center justify-between">
          <div>
            <span className="label"><Satellite size={12} /> PART 01 — LIVE TRACKING</span>
            <h2 className="heading-lg" style={{ marginTop: '8px' }}>
              INTERNATIONAL SPACE STATION
            </h2>
          </div>
          <button className="btn" onClick={handleRefresh} id="iss-refresh-btn">
            <RefreshCw size={14} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Map — takes 8 columns */}
      <div className="col-8 row-2 iss-map-wrapper">
        <ISSMap
          position={position}
          trajectory={trajectory}
          loading={loading}
        />
      </div>

      {/* Stats — takes 4 columns */}
      <div className="col-4" style={{ padding: 0 }}>
        <ISSStats
          position={position}
          currentSpeed={currentSpeed}
          locationName={locationName}
          positionsTracked={positionsTracked}
          loading={loading}
        />
      </div>

      {/* Astronauts — takes 4 columns */}
      <div className="col-4" style={{ padding: 0 }}>
        <AstronautList astronauts={astronauts} loading={loading} />
      </div>
    </>
  );
}
