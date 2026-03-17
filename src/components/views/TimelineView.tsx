import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { ScorchedCard, MagmaButton } from '@/components/design-system';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';

const THREAT_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#3b82f6', E: '#22c55e', F: '#6b7280',
};

type Zoom = 'hour' | 'day' | 'all';

export const TimelineView = () => {
  const { events, activeThreatFilters } = useStore();
  const [zoom, setZoom] = useState<Zoom>('all');

  const filtered = useMemo(() => {
    return events
      .filter((e) => activeThreatFilters.includes(e.category))
      .map((e) => {
        const d = new Date(e.timestamp);
        return {
          ...e,
          timeNum: d.getTime(),
          hour: d.getHours() + d.getMinutes() / 60,
          day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      })
      .sort((a, b) => a.timeNum - b.timeNum);
  }, [events, activeThreatFilters]);

  const chartData = useMemo(() => {
    return filtered.map((e) => ({
      x: e.timeNum,
      y: e.intensity,
      category: e.category,
      title: e.title,
      platform: e.platform,
      hour: `${Math.floor(e.hour)}:${String(Math.round((e.hour % 1) * 60)).padStart(2, '0')}`,
    }));
  }, [filtered]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2 text-[10px] font-mono max-w-[200px]">
        <div className="text-foreground font-bold truncate">{d.title}</div>
        <div className="text-muted-foreground mt-0.5">{d.platform.toUpperCase()} • {d.hour}</div>
        <div className="text-primary mt-0.5">INTENSITY: {d.y}</div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border">
        {(['hour', 'day', 'all'] as Zoom[]).map((z) => (
          <MagmaButton key={z} size="sm" variant={zoom === z ? 'primary' : 'secondary'} onClick={() => setZoom(z)}>
            {z.toUpperCase()}
          </MagmaButton>
        ))}
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">
          {filtered.length} EVENTS PLOTTED
        </span>
      </div>

      <div className="flex-1 p-2">
        <ScorchedCard className="h-full" noPadding>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 14%)" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(v: number) => {
                  const d = new Date(v);
                  return zoom === 'hour'
                    ? d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 9, fill: 'hsl(220, 10%, 40%)' }}
                stroke="hsl(25, 40%, 18%)"
              />
              <YAxis
                dataKey="y"
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'hsl(220, 10%, 40%)' }}
                stroke="hsl(25, 40%, 18%)"
                label={{ value: 'INTENSITY', angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: 'hsl(220, 10%, 40%)' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={chartData} shape="diamond">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={THREAT_COLORS[entry.category] || '#6b7280'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ScorchedCard>
      </div>
    </div>
  );
};
