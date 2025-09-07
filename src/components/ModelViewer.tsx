/* @ts-nocheck */
"use client";
import { useEffect, useRef, useState } from 'react';
// @ts-ignore - three types may not be picked up immediately in some TS configs
import * as THREE from 'three';

export default function ModelViewer(){
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status,setStatus] = useState<'loading'|'ready'|'missing'|'error'>('loading');

  useEffect(()=>{
    let disposed = false;
    if(!containerRef.current) return;
    const el = containerRef.current;
  const width = el.clientWidth;
  const height = el.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0d0d');
  const camera = new THREE.PerspectiveCamera(50, width/height, 0.05, 5000);
  (camera as any).position.set(8, 5, 8);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
  renderer.outputColorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
  renderer.toneMapping = (THREE as any).ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55; // brighter exposure
  ;(renderer as any).physicallyCorrectLights = true;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.85);
    scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const fill = new THREE.DirectionalLight(0xffffff, 0.55);
  (fill as any).position.set(-45,35,-55);
  fill.castShadow=false;
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  (rim as any).position.set(60,55,20);
  scene.add(rim);
  const dir = new THREE.DirectionalLight(0xffffff, 1.6);
  (dir as any).position.set(30,60,40);
    dir.castShadow = true;
    scene.add(dir);

    // Ground
  const groundGeo = new THREE.CircleGeometry(40, 96);
  const groundMat = new THREE.MeshStandardMaterial({ color:'#262626', roughness:0.95, metalness:0.0 });
  const ground = new THREE.Mesh(groundGeo, groundMat as any);
  (ground as any).rotation.x = -Math.PI/2;
  (ground as any).receiveShadow = true;
    scene.add(ground);

    // Track loaded root for framing
    let modelRoot:any = null;

    // OBJ + MTL Loader with texture path adjustments
    (async ()=>{
      try {
        // Dynamic imports
        // @ts-ignore
        const [{ OBJLoader }, { MTLLoader }] = await Promise.all([
          import('three/examples/jsm/loaders/OBJLoader'),
          import('three/examples/jsm/loaders/MTLLoader')
        ]);

        const manager = new THREE.LoadingManager();
        manager.setURLModifier((url:string)=>{
          // Normalize relative paths (may arrive as '/models/ba687.../file' or 'ba687.../file')
          const HASH_PREFIX = 'ba687344-';
            const clean = url.replace(/^\/*/, '');
            if(clean.includes(HASH_PREFIX)){
              const file = clean.split('/').pop();
              return `/models/house/${file}`;
            }
            return url.startsWith('http') ? url : (url.startsWith('/models/') ? url : `/models/${url}`);
        });

        const mtlLoader = new MTLLoader(manager);
        mtlLoader.setResourcePath('/models/');
        mtlLoader.load('house.mtl', (mtl:any)=>{
          mtl.preload();
          const objLoader = new (OBJLoader as any)(manager);
          if((objLoader as any).setMaterials) (objLoader as any).setMaterials(mtl);
          (objLoader as any).load('house.obj', (obj:any)=>{
            modelRoot = obj;
            // Convert inches to meters (SketchUp units) then uniform scale for view
            obj.scale.setScalar(0.0254); // inch -> meter
            const box = new THREE.Box3().setFromObject(obj);
            const size = new THREE.Vector3(); box.getSize(size);
            const center = new THREE.Vector3(); box.getCenter(center);
            obj.position.sub(center);
            // Lift so bottom sits on y=0 (avoid ground plane slicing through)
            obj.position.y += size.y / 2;
            // Force a front orientation (rotate about Y) — adjust angle if needed for your export
            obj.rotation.y = Math.PI * 0.7; // 90°
            // Material tweaks
            const targetColorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
            const brighten = 1.15;
            obj.traverse((c:any)=>{ if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; if(c.material){ const mats = Array.isArray(c.material)? c.material : [c.material]; mats.forEach((m:any)=>{ m.side = THREE.DoubleSide; if(m.map){ m.map.colorSpace = targetColorSpace; m.map.needsUpdate = true; } if(!m.map && m.color){ m.color.multiplyScalar(brighten); } }); } } });
            scene.add(obj);

            frameModel();
            if(!disposed) setStatus('ready');
          }, undefined, (e:any)=>{ if(!disposed){ console.warn('OBJ load error', e); setStatus('missing'); } });
        }, ()=>{}, (e:any)=>{ if(!disposed){ console.warn('MTL load error', e); setStatus('missing'); } });
      } catch(e){
        if(!disposed) setStatus('error');
      }
    })();

    // Simple orbit controls (minimal custom implementation)
  let isDown = false; let lastX=0; let lastY=0; let az=0; let elv=0.3; let distance=30;
    const target = new THREE.Vector3(0,0,0);
    function frameModel(){
      if(!modelRoot) return;
      const box = new THREE.Box3().setFromObject(modelRoot);
      const size = new THREE.Vector3(); box.getSize(size);
      const maxDim = Math.max(size.x,size.y,size.z);
  distance = maxDim * 1.2;
      const center = new THREE.Vector3(); box.getCenter(center);
      target.copy(center);
      updateCam();
    }
    function updateCam(){
      const r = distance;
      (camera as any).position.set(
        target.x + r * Math.cos(elv) * Math.sin(az),
        target.y + r * Math.sin(elv),
        target.z + r * Math.cos(elv) * Math.cos(az)
      );
      camera.lookAt(target);
    }
    updateCam();

    function pointerDown(e:PointerEvent){ isDown=true; lastX=e.clientX; lastY=e.clientY; }
  function pointerMove(e:PointerEvent){ if(!isDown) return; const dx=(e.clientX-lastX)/200; const dy=(e.clientY-lastY)/200; az -= dx; elv = Math.min(Math.max(elv + dy, -1.1), 1.1); lastX=e.clientX; lastY=e.clientY; updateCam(); }
  function wheel(e:WheelEvent){ e.preventDefault(); const delta = Math.sign(e.deltaY); distance *= (delta>0?1.08:0.92); distance = Math.min(Math.max(distance, 2), 800); updateCam(); }
    function pointerUp(){ isDown=false; }
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('wheel', wheel, { passive:false });
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);

    // Resize
    function onResize(){
      if(!el) return;
      const w = el.clientWidth; const h = el.clientHeight;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    }
    window.addEventListener('resize', onResize);

    // Animate
    function animate(){
      if(disposed) return;
  renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return ()=>{
      disposed=true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      if(renderer.domElement){
    renderer.domElement.removeEventListener('pointerdown', pointerDown);
    renderer.domElement.removeEventListener('wheel', wheel as any);
        if(renderer.domElement.parentElement === el){
          try { el.removeChild(renderer.domElement); } catch(_) { /* ignore */ }
        }
      }
      renderer.dispose();
    };
  },[]);

  return (
    <div className="rounded-2xl ring-1 ring-neutral-300 dark:ring-neutral-800 overflow-hidden bg-neutral-100 dark:bg-neutral-900 p-4">
      <h3 className="text-sm font-semibold tracking-wide text-brand-maroon dark:text-brand-gold mb-3">3D House Layout</h3>
      <div ref={containerRef} className="w-full h-[420px] rounded-lg overflow-hidden relative">
        {status!=='ready' && (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-900/40 backdrop-blur-sm">
            {status==='loading' && 'Loading model (house.obj)...'}
            {status==='missing' && 'Place /public/models/house.obj to view the model.'}
            {status==='error' && 'Could not load 3D viewer.'}
          </div>
        )}
      </div>
    </div>
  );
}