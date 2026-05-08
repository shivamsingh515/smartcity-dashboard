// Haversine formula — calculates distance in km between two lat/lon points
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate speed in km/h given distance (km) and time delta (ms)
export function calculateSpeed(distanceKm, timeDeltaMs) {
  if (timeDeltaMs <= 0) return 0;
  const hours = timeDeltaMs / (1000 * 60 * 60);
  return distanceKm / hours;
}
