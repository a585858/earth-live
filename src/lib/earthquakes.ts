import { z } from 'zod';
import { isNearJapan } from './geo';
export const FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const feature = z.object({
  type: z.literal('Feature'), id: z.string(),
  properties: z.object({ mag: z.number().finite().nullable(), place: z.string().nullable(), time: z.number().finite().refine(v => Math.abs(v) <= 8.64e15), url: z.string(), type: z.string() }),
  geometry: z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90), z.number().finite()]) })
});
const feed = z.object({ type: z.literal('FeatureCollection'), metadata: z.object({ generated: z.number().finite() }), features: z.array(feature) });
export interface Earthquake { id: string; magnitude: number | null; place: string; time: number; longitude: number; latitude: number; depth: number; url: string | null }
export function parseFeed(input: unknown, now = Date.now()): Earthquake[] {
  const data = feed.parse(input);
  return data.features.filter(f => f.properties.type === 'earthquake' && isNearJapan(f.geometry.coordinates[1], f.geometry.coordinates[0]) && f.properties.time >= now - 7*86400000 && f.properties.time <= now)
    .map(f => ({ id: f.id, magnitude: f.properties.mag, place: f.properties.place ?? '震源名不明', time: f.properties.time, longitude: f.geometry.coordinates[0], latitude: f.geometry.coordinates[1], depth: f.geometry.coordinates[2], url: /^https:\/\/earthquake\.usgs\.gov\//.test(f.properties.url) ? f.properties.url : null }))
    .sort((a,b) => b.time-a.time);
}
export async function fetchEarthquakes(signal: AbortSignal) {
  const response = await fetch(FEED_URL, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('USGSからデータを取得できませんでした。');
  return parseFeed(await response.json());
}
export const formatDate = (time: number) => new Intl.DateTimeFormat('ja-JP', { timeZone:'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false }).format(time);
export const magnitudeColor = (m: number | null) => m === null ? '#95a5b6' : m >= 5 ? '#fb826d' : m >= 4 ? '#f6c66e' : '#60d5c5';
