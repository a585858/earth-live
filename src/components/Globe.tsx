import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Stars } from '@react-three/drei';
import { BackSide, Vector3 } from 'three';
import { useRef, type ComponentRef, type RefObject } from 'react';
type Controls = ComponentRef<typeof OrbitControls>;
import { latLonToVector } from '../lib/geo';
import { magnitudeColor, type Earthquake } from '../lib/earthquakes';

type Land = { features: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
function Geography({onError}:{onError:(failed:boolean)=>void}) {
  const [land, setLand] = useState<Land | null>(null);
  useEffect(() => { const controller = new AbortController(); fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_land.geojson', {signal:controller.signal}).then(r => { if (!r.ok) throw Error(); return r.json() as Promise<Land>; }).then(data=>{setLand(data);onError(false);}).catch(() => {if(!controller.signal.aborted)onError(true);}); return () => controller.abort(); }, [onError]);
  const lines = useMemo(() => land?.features.flatMap(f => {
    const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] : f.geometry.coordinates as number[][][][];
    return polygons.flatMap(p => p.map(ring => ring.map(p => latLonToVector(p[1],p[0],2.008))));
  }) ?? [], [land]);
  return <>{lines.map((points,i) => <Line key={i} points={points} color="#609baf" lineWidth={0.8} transparent opacity={0.7}/>)}</>;
}
function Grid() {
  const lines = useMemo(() => {
    const result: [number,number,number][][] = [];
    for (let lat=-60;lat<=60;lat+=30) result.push(Array.from({length:181},(_,i)=>latLonToVector(lat,i*2,2.003)));
    for (let lon=0;lon<360;lon+=30) result.push(Array.from({length:91},(_,i)=>latLonToVector(i*2-90,lon,2.003)));
    return result;
  },[]);
  return <>{lines.map((points,i)=><Line key={i} points={points} color="#315166" transparent opacity={0.38} lineWidth={0.6}/>)}</>;
}
class GlobeBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <div className="globe-fallback">3D表示を利用できません。<br/>下の地震一覧から観測情報をご覧ください。</div> : this.props.children;}
}
export default function Globe({events, selectedId, onSelect, resetKey, zoom}: {events:Earthquake[];selectedId:string|null;onSelect:(id:string)=>void;resetKey:number;zoom:number}) {
  const controls = useRef<Controls>(null);
  const [geographyError,setGeographyError]=useState(false);
  return <GlobeBoundary>{geographyError&&<div className="geography-error" role="status">海岸線データを取得できません。地球儀を再読み込みすると再試行します。</div>}<Canvas dpr={[1,1.7]} camera={{position:latLonToVector(35,138,6.6), fov:43}} gl={{antialias:true,alpha:true}} fallback={<div className="globe-fallback">WebGL非対応です。地震一覧をご利用ください。</div>}>
    <ambientLight intensity={1.5}/><directionalLight position={[-4,5,-6]} intensity={2}/>
    <Stars radius={70} depth={30} count={1100} factor={2} saturation={0} fade speed={0}/>
    <mesh onClick={event=>event.stopPropagation()} onPointerOver={event=>event.stopPropagation()}><sphereGeometry args={[2,80,80]}/><meshStandardMaterial color="#102b3c" roughness={0.88} metalness={0.3}/></mesh>
    <mesh scale={1.025}><sphereGeometry args={[2,64,64]}/><meshBasicMaterial color="#2d8199" transparent opacity={0.075} side={BackSide}/></mesh>
    <Grid/><Suspense fallback={null}><Geography onError={setGeographyError}/></Suspense>
    {events.map(e => <group key={e.id} position={latLonToVector(e.latitude,e.longitude,2.026)}>
      <mesh onClick={event=>{event.stopPropagation();onSelect(e.id);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}>
        <sphereGeometry args={[e.id===selectedId ? 0.038 : 0.017+Math.max(0,e.magnitude??0)*0.003,14,14]}/><meshBasicMaterial color={magnitudeColor(e.magnitude)}/>
      </mesh>
      {e.id===selectedId && <mesh><sphereGeometry args={[0.07,16,16]}/><meshBasicMaterial color="#fff" wireframe transparent opacity={0.45}/></mesh>}
    </group>)}
    <OrbitControls ref={controls} enablePan={false} minDistance={2.7} maxDistance={10} enableDamping dampingFactor={0.08} rotateSpeed={0.5}/>
    <CameraReset resetKey={resetKey} zoom={zoom} controls={controls}/>
  </Canvas></GlobeBoundary>;
}
function CameraReset({resetKey,zoom,controls}:{resetKey:number;zoom:number;controls:RefObject<Controls|null>}) {
  useEffect(()=>{ if(controls.current){ controls.current.object.position.copy(new Vector3(...latLonToVector(35,138,6.6))); controls.current.target.set(0,0,0); controls.current.update(); } },[resetKey,controls]);
  const previousZoom=useRef(zoom);
  useEffect(()=>{ const c=controls.current; if(c){c.object.position.multiplyScalar(Math.pow(0.8,zoom-previousZoom.current));c.object.position.clampLength(2.7,10);c.update();} previousZoom.current=zoom; },[zoom,controls]);
  return null;
}
