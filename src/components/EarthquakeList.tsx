import { ArrowUpRight, Radio } from 'lucide-react';
import { formatDate, magnitudeColor, type Earthquake } from '../lib/earthquakes';
export default function EarthquakeList({events,selectedId,onSelect,loading}:{events:Earthquake[];selectedId:string|null;onSelect:(id:string)=>void;loading:boolean}) {
 return <div className="event-list" aria-busy={loading}>
 {events.length===0 ? <div className="empty"><Radio size={28}/><p>{loading?'観測データを取得しています…':'条件に一致する地震はありません'}</p><small>USGSに報告された日本周辺の地震を表示します。</small></div> :
 events.map(e=><button className={'event-row '+(e.id===selectedId?'selected':'')} key={e.id} onClick={()=>onSelect(e.id)} aria-pressed={e.id===selectedId}>
 <span className="magnitude" style={{color:magnitudeColor(e.magnitude),borderColor:magnitudeColor(e.magnitude)+'35'}}> <small>M</small>{e.magnitude?.toFixed(1)??'—'}</span>
 <span className="event-copy"><strong>{e.place}</strong><small>{formatDate(e.time)} <span>JST</span> <i/> 深さ {e.depth.toFixed(1)} km</small></span><ArrowUpRight size={15}/></button>)}
 </div>;
}
