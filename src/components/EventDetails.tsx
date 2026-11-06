import { ExternalLink, MapPin, X } from 'lucide-react';
import { formatDate, magnitudeColor, type Earthquake } from '../lib/earthquakes';
export default function EventDetails({event,onClose}:{event:Earthquake;onClose:()=>void}) {
 return <section className="event-details" aria-label="選択した地震の詳細"><div className="detail-head"><span><MapPin size={13}/> OBSERVATION DETAILS</span><button aria-label="詳細を閉じる" onClick={onClose}><X size={16}/></button></div>
 <div className="detail-title"><strong style={{color:magnitudeColor(event.magnitude)}}>M {event.magnitude?.toFixed(1)??'—'}</strong><h3>{event.place}</h3></div>
 <dl><div><dt>発生日時 / 日本時間</dt><dd>{formatDate(event.time)} JST</dd></div><div><dt>震源の深さ</dt><dd>{event.depth.toFixed(1)} km</dd></div><div><dt>緯度</dt><dd>{event.latitude.toFixed(3)}° N</dd></div><div><dt>経度</dt><dd>{event.longitude.toFixed(3)}° E</dd></div></dl>
 {event.url&&<a href={event.url} target="_blank" rel="noreferrer">USGSで観測情報を見る <ExternalLink size={13}/></a>}</section>;
}
