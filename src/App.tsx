import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowUpRight, ChevronDown, Compass, Globe2, Info, LocateFixed, Minus, Plus, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { fetchEarthquakes, formatDate, type Earthquake } from './lib/earthquakes';
import EventDetails from './components/EventDetails';
import EarthquakeList from './components/EarthquakeList';
const Globe = lazy(()=>import('./components/Globe'));
export default function App(){
 const [events,setEvents]=useState<Earthquake[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState<string|null>(null);
 const [updated,setUpdated]=useState<number|null>(null);
 const [minimum,setMinimum]=useState(0);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [resetKey,setResetKey]=useState(0);
 const [zoom,setZoom]=useState(0);
 const request=useRef<AbortController|null>(null);
 async function refresh(){
  request.current?.abort(); const controller=new AbortController(); request.current=controller;
  setLoading(true);setError(null);
  const timeout=window.setTimeout(()=>controller.abort('timeout'),20000);
  try { const data=await fetchEarthquakes(controller.signal); if(request.current!==controller)return;setEvents(data);setUpdated(Date.now());setSelectedId(id=>data.some(e=>e.id===id)?id:null); }
  catch {if(request.current===controller && (!controller.signal.aborted || controller.signal.reason==='timeout'))setError('観測データを取得できませんでした。通信状況を確認して再試行してください。');}
  finally{clearTimeout(timeout);if(request.current===controller)setLoading(false);}
 }
 useEffect(()=>{void refresh(); return()=>request.current?.abort();},[]);
 const filtered=useMemo(()=>events.filter(e=>minimum===0 || (e.magnitude!==null&&e.magnitude>=minimum)),[events,minimum]);
 const selected=filtered.find(e=>e.id===selectedId);
 const maximum=events.reduce<number|null>((m,e)=>e.magnitude===null?m:Math.max(m??-Infinity,e.magnitude),null);
 return <div className="app-shell">
 <header><a className="brand" href="./"><span className="brand-symbol"><Globe2 size={25}/></span>earth<span>live</span><small>地球の動きを、見つめる。</small></a><div className="header-right"><span className="source-badge"><i/> USGS OBSERVATION</span><a className="about-link" href="#about">このサービスについて <ArrowUpRight size={14}/></a></div></header>
 <main>
 <div className="page-heading"><div><div className="eyebrow">OUR PLANET. IN MOTION.</div><h1>地球の今を、立体的に。</h1><p>日本周辺の地震活動を、ひとつの地球儀から。</p></div><div className="heading-meta"><span className="status-dot"/> {error?'接続エラー':loading?'データ取得中':'観測データ'}<small>データソース：USGS</small></div></div>
 <div className="workspace">
 <section className="globe-panel" aria-label="日本周辺の3D地球儀">
 <div className="panel-top"><span><Globe2 size={15}/> EARTH VIEW</span><span className="region-tag">日本周辺 <ChevronDown size={12}/></span></div>
 <div className="globe-view"><Suspense fallback={<div className="globe-fallback">地球儀を読み込み中…</div>}><Globe events={filtered} selectedId={selected?.id??null} onSelect={setSelectedId} resetKey={resetKey} zoom={zoom}/></Suspense></div>
 <div className="globe-coordinate">35° N &nbsp; 138° E <span>INITIAL VIEW</span></div>
 <div className="globe-controls"><button title="拡大" aria-label="地球儀を拡大" onClick={()=>setZoom(z=>z+1)}><Plus size={17}/></button><button title="縮小" aria-label="地球儀を縮小" onClick={()=>setZoom(z=>z-1)}><Minus size={17}/></button><div/><button title="日本に戻る" aria-label="地球儀を日本の初期位置に戻す" onClick={()=>setResetKey(k=>k+1)}><LocateFixed size={17}/></button></div>
 {selected&&<EventDetails event={selected} onClose={()=>setSelectedId(null)}/>}
 <div className="globe-bottom"><span><Compass size={14}/> ドラッグで回転・スクロールでズーム</span><div className="legend"><span><i style={{background:'#60d5c5'}}/> M &lt; 4</span><span><i style={{background:'#f6c66e'}}/> M 4–4.9</span><span><i style={{background:'#fb826d'}}/> M 5+</span><span><i style={{background:'#95a5b6'}}/> 不明</span></div></div>
 </section>
 <aside className="observations">
 <div className="list-heading"><div className="eyebrow">SEISMIC ACTIVITY</div><h2>最近の地震 <span>直近7日間</span></h2><p>日本周辺 · 北緯20–50° / 東経120–155°</p></div>
 <div className="stats"><div><span>観測された地震</span><strong>{updated?events.length:'—'}<small>件</small></strong></div><div><span>最大マグニチュード</span><strong className="max-mag">{maximum===null?'—':maximum.toFixed(1)}<small>M</small></strong></div></div>
 <div className="filter"><label htmlFor="magnitude"><SlidersHorizontal size={14}/> マグニチュード</label><select id="magnitude" value={minimum} onChange={e=>{setMinimum(Number(e.target.value));setSelectedId(null);}}><option value={0}>すべて</option><option value={3}>M 3.0 以上</option><option value={4}>M 4.0 以上</option><option value={5}>M 5.0 以上</option><option value={6}>M 6.0 以上</option></select></div>
 <div className="list-caption"><span>{filtered.length} 件の地震{error&&updated?'（前回取得分）':''}</span><span>新しい順 ↓</span></div>
 {error&&<div className="error" role="alert"><p>{error}</p><button onClick={()=>void refresh()} disabled={loading}>再試行 <RefreshCw size={13}/></button></div>}
 <EarthquakeList events={filtered} selectedId={selected?.id??null} onSelect={setSelectedId} loading={loading}/>
 <div className="refresh-bar"><span role="status">{updated?'最終取得 '+formatDate(updated)+' JST':loading?'USGSに接続しています':'未取得'}{loading&&updated?' · 更新中':''}</span><button disabled={loading} onClick={()=>void refresh()}><RefreshCw className={loading?'spin':''} size={14}/> 更新</button></div>
 </aside>
 </div>
 <section className="information" id="about"><span className="info-icon"><Info size={18}/></span><div><h2>地震を知るための、観測ビジュアライザー。</h2><p>USGSが報告した地震データを表示しています。マグニチュードは地震の規模を表し、日本の「震度」とは異なります。本サービスは緊急地震速報・公式防災警報ではありません。避難などの判断には、<a href="https://www.jma.go.jp/" target="_blank" rel="noreferrer">気象庁などの公式情報 <ArrowUpRight size={12}/></a>をご確認ください。</p><p className="coverage">USGSの収録状況により、日本周辺の小規模な地震など、すべての地震を網羅していません。マーカーは震央の位置を示し、深さは詳細に数値で表示します。</p></div></section>
 </main>
 <footer><span><Activity size={14}/> EARTH LIVE <small>地球を知る。変化を見つめる。</small></span><a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noreferrer">DATA BY USGS <ArrowUpRight size={12}/></a></footer>
 </div>;
}
