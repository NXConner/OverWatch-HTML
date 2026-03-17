import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

const RING_COUNT = 5;
const THREAT_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#3b82f6', E: '#22c55e', F: '#6b7280',
};

const RadarSweep = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z -= delta * 1.2;
    }
  });

  const sweepGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    const arc = Math.PI / 6;
    const r = 4.5;
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * arc;
      shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <primitive object={sweepGeo} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
};

const RadarRings = () => {
  return (
    <>
      {Array.from({ length: RING_COUNT }).map((_, i) => {
        const radius = ((i + 1) / RING_COUNT) * 4.5;
        return (
          <mesh key={i} rotation={[0, 0, 0]}>
            <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Cross lines */}
      {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((angle, i) => (
        <mesh key={`line-${i}`} rotation={[0, 0, angle]}>
          <planeGeometry args={[9, 0.01]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
};

const EventDots = () => {
  const events = useStore((s) => s.events);
  const activeThreatFilters = useStore((s) => s.activeThreatFilters);

  const dots = useMemo(() => {
    return events
      .filter((e) => activeThreatFilters.includes(e.category))
      .map((e, i) => {
        const angle = (i / events.length) * Math.PI * 2 + (e.intensity * 0.01);
        const dist = (e.intensity / 100) * 4;
        return {
          id: e.id,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          color: THREAT_COLORS[e.category] || '#6b7280',
          size: 0.04 + (e.intensity / 100) * 0.06,
          intensity: e.intensity,
        };
      });
  }, [events, activeThreatFilters]);

  return (
    <>
      {dots.map((dot) => (
        <mesh key={dot.id} position={[dot.x, dot.y, 0.01]}>
          <circleGeometry args={[dot.size, 16]} />
          <meshBasicMaterial color={dot.color} transparent opacity={0.9} />
        </mesh>
      ))}
    </>
  );
};

const SweepLine = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 1.2;
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[4.5, 0.015]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const RadarView = () => {
  return (
    <div className="w-full h-full bg-background/50 relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <RadarRings />
        <RadarSweep />
        <SweepLine />
        <EventDots />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-[9px] font-mono text-muted-foreground">
        ◆ DOPPLER SWEEP ACTIVE — THREAT MAPPING ENABLED
      </div>
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        {Object.entries(THREAT_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-[8px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            CAT-{cat}
          </div>
        ))}
      </div>
    </div>
  );
};
