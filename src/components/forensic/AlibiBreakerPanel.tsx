import { useMemo } from 'react';
import { ScorchedCard, TacticalBadge } from '@/components/design-system';
import { useStore } from '@/store/useStore';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

// "Alibi Breaker" forensic panel — surfaces temporal/geospatial contradictions
// across the marked event set (e.g., simultaneous activity on two platforms,
// or platform activity inconsistent with claimed location).
interface Conflict {
  id: string;
  type: 'temporal' | 'geospatial' | 'circadian';
  severity: 'A' | 'B' | 'C';
  summary: string;
  evidence: string[];
}

export const AlibiBreakerPanel = () => {
  const { events, subject } = useStore();

  const conflicts = useMemo<Conflict[]>(() => {
    if (events.length < 2) return [];
    const sorted = [...events].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    const out: Conflict[] = [];

    // 1. Temporal collisions: two distinct platforms within 60s
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1], b = sorted[i];
      const dt = (+new Date(b.timestamp) - +new Date(a.timestamp)) / 1000;
      if (dt <= 60 && a.platform !== b.platform) {
        out.push({
          id: `T-${a.id}-${b.id}`,
          type: 'temporal',
          severity: dt <= 15 ? 'A' : 'B',
          summary: `Concurrent activity on ${a.platform.toUpperCase()} and ${b.platform.toUpperCase()} within ${Math.round(dt)}s`,
          evidence: [a.title, b.title],
        });
      }
    }

    // 2. Geospatial jumps: >50km between consecutive geotagged events <30min apart
    const geo = sorted.filter((e) => e.coordinates);
    for (let i = 1; i < geo.length; i++) {
      const a = geo[i - 1], b = geo[i];
      const dtMin = (+new Date(b.timestamp) - +new Date(a.timestamp)) / 60000;
      if (dtMin > 30 || dtMin <= 0) continue;
      const km = haversineKm(a.coordinates!, b.coordinates!);
      const speed = km / (dtMin / 60); // km/h
      if (speed > 200) {
        out.push({
          id: `G-${a.id}-${b.id}`,
          type: 'geospatial',
          severity: speed > 600 ? 'A' : 'B',
          summary: `Implausible transit: ${km.toFixed(0)}km in ${dtMin.toFixed(0)}min (${speed.toFixed(0)} km/h)`,
          evidence: [a.title, b.title],
        });
      }
    }

    // 3. Circadian deviations against subject baseline
    if (subject?.baselineMetrics.peakActivityHour !== undefined) {
      const peak = subject.baselineMetrics.peakActivityHour;
      const offHours = sorted.filter((e) => {
        const h = new Date(e.timestamp).getHours();
        return Math.abs(h - peak) > 8 && (e.category === 'A' || e.category === 'B');
      }).slice(0, 3);
      offHours.forEach((e) => {
        out.push({
          id: `C-${e.id}`,
          type: 'circadian',
          severity: 'C',
          summary: `Off-peak high-threat event at ${new Date(e.timestamp).getHours().toString().padStart(2, '0')}:00 (baseline peak ${peak.toString().padStart(2, '0')}:00)`,
          evidence: [e.title],
        });
      });
    }

    return out.slice(0, 12);
  }, [events, subject]);

  return (
    <ScorchedCard className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-destructive" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-foreground">
            ALIBI BREAKER
          </span>
        </div>
        <span className="text-[9px] font-mono text-destructive">{conflicts.length} CONFLICT{conflicts.length === 1 ? '' : 'S'}</span>
      </div>

      {conflicts.length === 0 ? (
        <div className="text-[9px] font-mono text-muted-foreground py-3 text-center">
          NO CONTRADICTIONS DETECTED IN CURRENT EVENT SET
        </div>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {conflicts.map((c) => {
            const Icon = c.type === 'geospatial' ? MapPin : Clock;
            return (
              <div key={c.id} className="border-l-2 border-destructive/60 pl-2 py-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={9} className="text-destructive" />
                  <TacticalBadge category={c.severity} label={c.type.toUpperCase()} />
                </div>
                <div className="text-[9px] font-mono text-foreground">{c.summary}</div>
                <div className="text-[8px] font-mono text-ash mt-0.5 line-clamp-2">
                  ↳ {c.evidence.join(' ⇄ ')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ScorchedCard>
  );
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
