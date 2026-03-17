import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import 'leaflet/dist/leaflet.css';

const THREAT_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#3b82f6', E: '#22c55e', F: '#6b7280',
};

export const MapView = () => {
  const { events, activeThreatFilters } = useStore();

  const geoEvents = useMemo(
    () => events.filter((e) => e.coordinates && activeThreatFilters.includes(e.category)),
    [events, activeThreatFilters]
  );

  const trackPoints = useMemo(
    () =>
      geoEvents
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((e) => [e.coordinates!.lat, e.coordinates!.lng] as [number, number]),
    [geoEvents]
  );

  const center = useMemo(() => {
    if (geoEvents.length === 0) return [33.749, -84.388] as [number, number];
    const avg = geoEvents.reduce(
      (acc, e) => ({ lat: acc.lat + e.coordinates!.lat, lng: acc.lng + e.coordinates!.lng }),
      { lat: 0, lng: 0 }
    );
    return [avg.lat / geoEvents.length, avg.lng / geoEvents.length] as [number, number];
  }, [geoEvents]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        style={{ background: 'hsl(220, 15%, 6%)' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* GPS Track */}
        {trackPoints.length > 1 && (
          <Polyline positions={trackPoints} pathOptions={{ color: '#f97316', weight: 1.5, opacity: 0.5, dashArray: '6 4' }} />
        )}

        {/* Event markers */}
        {geoEvents.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.coordinates!.lat, event.coordinates!.lng]}
            radius={4 + (event.intensity / 100) * 6}
            pathOptions={{
              color: THREAT_COLORS[event.category],
              fillColor: THREAT_COLORS[event.category],
              fillOpacity: 0.6,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-[10px] font-mono" style={{ color: '#0a0a0f' }}>
                <div className="font-bold">{event.title}</div>
                <div className="mt-1">CAT-{event.category} • {event.platform.toUpperCase()}</div>
                <div>INT: {event.intensity} • {new Date(event.timestamp).toLocaleString()}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* HUD overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-card/90 border border-border p-2 text-[9px] font-mono text-muted-foreground">
        ◆ TACTICAL MAP — {geoEvents.length} GEO-TAGGED EVENTS
      </div>
      <div className="absolute bottom-3 right-3 z-[1000] bg-card/90 border border-border p-2 text-[8px] font-mono text-muted-foreground">
        {center[0].toFixed(4)}°N, {Math.abs(center[1]).toFixed(4)}°W
      </div>
    </div>
  );
};
