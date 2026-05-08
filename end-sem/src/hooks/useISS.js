import { useState, useEffect, useCallback, useRef } from 'react';
import { haversineDistance, calculateSpeed } from '../utils/haversine';
import { fetchJSON } from '../utils/api';
import {
  ISS_POSITION_URL,
  ISS_ASTROS_URL,
  NOMINATIM_REVERSE_URL,
  ISS_POLL_INTERVAL,
  MAX_TRAJECTORY_POINTS,
  MAX_SPEED_HISTORY,
} from '../utils/constants';

export function useISS() {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Calculating...');
  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevPositionRef = useRef(null);
  const prevTimeRef = useRef(null);

  // Reverse geocode to get location name
  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const data = await fetchJSON(
        `${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lon}&format=json&zoom=5`
      );
      if (data.display_name) {
        // Shorten the name
        const parts = data.display_name.split(',');
        setLocationName(parts.slice(0, 2).join(',').trim());
      } else {
        setLocationName('Over Ocean');
      }
    } catch {
      setLocationName('Location unavailable');
    }
  }, []);

  // Fetch ISS position
  const fetchPosition = useCallback(async () => {
    try {
      const data = await fetchJSON(ISS_POSITION_URL);
      const lat = parseFloat(data.iss_position.latitude);
      const lon = parseFloat(data.iss_position.longitude);
      const timestamp = data.timestamp * 1000; // Convert to ms

      const newPos = { lat, lon, timestamp };
      setPosition(newPos);
      setError(null);

      // Calculate speed from previous position
      if (prevPositionRef.current && prevTimeRef.current) {
        const dist = haversineDistance(
          prevPositionRef.current.lat,
          prevPositionRef.current.lon,
          lat,
          lon
        );
        const timeDelta = timestamp - prevTimeRef.current;
        const speed = calculateSpeed(dist, timeDelta);

        // ISS speed is ~28000 km/h, filter out anomalies
        if (speed > 0 && speed < 50000) {
          setCurrentSpeed(Math.round(speed));
          setSpeedHistory((prev) => {
            const next = [...prev, { time: new Date(timestamp).toLocaleTimeString(), speed: Math.round(speed) }];
            return next.slice(-MAX_SPEED_HISTORY);
          });
        }
      }

      // Update trajectory
      setTrajectory((prev) => {
        const next = [...prev, [lat, lon]];
        return next.slice(-MAX_TRAJECTORY_POINTS);
      });

      // Reverse geocode every 3rd fetch to avoid rate limit
      if (!prevPositionRef.current || Math.random() < 0.33) {
        reverseGeocode(lat, lon);
      }

      prevPositionRef.current = { lat, lon };
      prevTimeRef.current = timestamp;
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [reverseGeocode]);

  // Fetch astronauts
  const fetchAstronauts = useCallback(async () => {
    try {
      const data = await fetchJSON(ISS_ASTROS_URL);
      setAstronauts({
        number: data.number,
        people: data.people || [],
      });
    } catch {
      // Silently fail — not critical
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    setLoading(true);
    fetchPosition();
    fetchAstronauts();
  }, [fetchPosition, fetchAstronauts]);

  // Auto-poll
  useEffect(() => {
    fetchPosition();
    fetchAstronauts();

    const posInterval = setInterval(fetchPosition, ISS_POLL_INTERVAL);
    const astroInterval = setInterval(fetchAstronauts, 60000); // Every minute

    return () => {
      clearInterval(posInterval);
      clearInterval(astroInterval);
    };
  }, [fetchPosition, fetchAstronauts]);

  return {
    position,
    trajectory,
    speedHistory,
    currentSpeed,
    locationName,
    astronauts,
    loading,
    error,
    refresh,
    positionsTracked: trajectory.length,
  };
}
