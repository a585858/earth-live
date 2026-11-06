import { expect, it } from 'vitest';
import { parseFeed } from './earthquakes';
const now = Date.now();
const item = {type:'Feature',id:'test',properties:{mag:null,place:null,time:now,url:'javascript:alert(1)',type:'earthquake'},geometry:{type:'Point',coordinates:[138,36,10]}};
const wrap = (features: unknown[]) => ({type:'FeatureCollection',metadata:{generated:now},features});
it('accepts unknown magnitude and removes unsafe links', () => { expect(parseFeed(wrap([item]),now)[0]).toMatchObject({magnitude:null,url:null}); });
it('rejects malformed API data', () => { expect(() => parseFeed(wrap([{...item,geometry:{type:'Point',coordinates:[138,96,10]}}]))).toThrow(); });
it('excludes old, future and out-of-region events', () => {
  expect(parseFeed(wrap([{...item,properties:{...item.properties,time:now-8*86400000}},{...item,properties:{...item.properties,time:now+1000}},{...item,geometry:{type:'Point',coordinates:[0,0,10]}}]),now)).toEqual([]);
});
