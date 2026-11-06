import { describe, it, expect } from 'vitest';
import { latLonToVector, isNearJapan } from './geo';
describe('spherical coordinates', () => {
  it('maps equator, eastern hemisphere and poles correctly', () => {
    expect(latLonToVector(0, 0)).toEqual([1, 0, -0]);
    expect(latLonToVector(0, 90)[2]).toBeCloseTo(-1);
    expect(latLonToVector(90, 0)[1]).toBeCloseTo(1);
    expect(latLonToVector(-90, 0)[1]).toBeCloseTo(-1);
  });
  it('preserves radius around Japan and across the dateline', () => {
    for (const [lat, lon] of [[36, 138], [0, 180], [-45, -180]]) {
      expect(Math.hypot(...latLonToVector(lat, lon, 2))).toBeCloseTo(2);
    }
  });
  it('includes region boundaries and excludes outside locations', () => {
    expect(isNearJapan(20,120)).toBe(true);
    expect(isNearJapan(50,155)).toBe(true);
    expect(isNearJapan(19.9,138)).toBe(false);
    expect(isNearJapan(35,156)).toBe(false);
  });
});
