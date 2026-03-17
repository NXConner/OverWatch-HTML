import { useStore } from '@/store/useStore';
import { MagmaButton } from '@/components/design-system';
import type { ViewTab } from '@/types';
import { Radar, Clock, Map, Network, Box, Brain } from 'lucide-react';
import { lazy, Suspense } from 'react';

const RadarView = lazy(() => import('@/components/views/RadarView').then(m => ({ default: m.RadarView })));
const TimelineView = lazy(() => import('@/components/views/TimelineView').then(m => ({ default: m.TimelineView })));
const MapView = lazy(() => import('@/components/views/MapView').then(m => ({ default: m.MapView })));
const NetworkView = lazy(() => import('@/components/views/NetworkView').then(m => ({ default: m.NetworkView })));
const EchoView = lazy(() => import('@/components/views/EchoView').then(m => ({ default: m.EchoView })));
const PsychDashboard = lazy(() => import('@/components/views/PsychDashboard').then(m => ({ default: m.PsychDashboard })));

const tabs: { id: ViewTab; label: string; icon: typeof Radar }[] = [
  { id: 'radar', label: 'RADAR', icon: Radar },
  { id: 'timeline', label: 'TIMELINE', icon: Clock },
  { id: 'map', label: 'MAP', icon: Map },
  { id: 'network', label: 'NETWORK', icon: Network },
  { id: 'echo', label: 'ECHO', icon: Box },
  { id: 'psych', label: 'PSYCH', icon: Brain },
];

const ViewLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-[10px] font-mono text-muted-foreground animate-pulse">LOADING MODULE...</div>
  </div>
);

const viewComponents: Record<ViewTab, React.LazyExoticComponent<React.ComponentType>> = {
  radar: RadarView,
  timeline: TimelineView,
  map: MapView,
  network: NetworkView,
  echo: EchoView,
  psych: PsychDashboard,
};

export const CenterStage = () => {
  const { activeView, setActiveView } = useStore();
  const ViewComponent = viewComponents[activeView];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/50">
        {tabs.map(({ id, label, icon: Icon }) => (
          <MagmaButton
            key={id}
            size="sm"
            variant={activeView === id ? 'primary' : 'secondary'}
            onClick={() => setActiveView(id)}
          >
            <Icon size={10} className="inline mr-1" />
            {label}
          </MagmaButton>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<ViewLoader />}>
          <ViewComponent />
        </Suspense>
      </div>
    </div>
  );
};
