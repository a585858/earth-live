/** Y-up sphere: longitude 0 on +X, longitude 90E on -Z. */
export function latLonToVector(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = lat * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  return [radius * Math.cos(phi) * Math.cos(theta), radius * Math.sin(phi), -radius * Math.cos(phi) * Math.sin(theta)];
}
export const JAPAN_BOUNDS = { south: 20, north: 50, west: 120, east: 155 };
export function isNearJapan(lat: number, lon: number) {
  return lat >= JAPAN_BOUNDS.south && lat <= JAPAN_BOUNDS.north && lon >= JAPAN_BOUNDS.west && lon <= JAPAN_BOUNDS.east;
}
