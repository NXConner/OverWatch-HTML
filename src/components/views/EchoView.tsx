import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

const THREAT_COLORS: Record<string, THREE.Color> = {
  A: new THREE.Color('#ef4444'),
  B: new THREE.Color('#f97316'),
  C: new THREE.Color('#eab308'),
  D: new THREE.Color('#3b82f6'),
  E: new THREE.Color('#22c55e'),
  F: new THREE.Color('#6b7280'),
};

const PointCloud = () => {
  const events = useStore((s) => s.events);
  const activeThreatFilters = useStore((s) => s.activeThreatFilters);
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, count } = useMemo(() => {
    const filtered = events.filter((e) => activeThreatFilters.includes(e.category));
    const pos = new Float32Array(filtered.length * 3);
    const col = new Float32Array(filtered.length * 3);

    filtered.forEach((e, i) => {
      const d = new Date(e.timestamp);
      const timeNorm = (d.getHours() * 60 + d.getMinutes()) / 1440;
      const catIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(e.category);

      pos[i * 3] = (timeNorm - 0.5) * 8;
      pos[i * 3 + 1] = (e.intensity / 100 - 0.5) * 6;
      pos[i * 3 + 2] = (catIndex / 5 - 0.5) * 4;

      const c = THREAT_COLORS[e.category] || new THREE.Color('#6b7280');
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });

    return { positions: pos, colors: col, count: filtered.length };
  }, [events, activeThreatFilters]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
};

const GridHelper = () => {
  return (
    <>
      <gridHelper args={[10, 10, '#f9731620', '#f9731610']} position={[0, -3.5, 0]} />
      <axesHelper args={[5]} />
    </>
  );
};

export const EchoView = () => {
  return (
    <div className="w-full h-full relative bg-background/50">
      <Canvas camera={{ position: [6, 4, 6], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.3} />
        <PointCloud />
        <GridHelper />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>

      <div className="absolute bottom-3 left-3 text-[9px] font-mono text-muted-foreground">
        ◆ ECHO POINT CLOUD — 3D EVENT MAPPING
      </div>
      <div className="absolute top-3 left-3 text-[8px] font-mono text-muted-foreground space-y-0.5">
        <div>X: TIME OF DAY</div>
        <div>Y: INTENSITY</div>
        <div>Z: THREAT CATEGORY</div>
      </div>
    </div>
  );
};
