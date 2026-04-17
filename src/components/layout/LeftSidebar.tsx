import { useState } from 'react';
import { ScorchedCard, MagmaButton } from '@/components/design-system';
import { User, Shield, Activity, ChevronDown, ChevronRight, Clock, Users, Crosshair, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { IngestionModal, ReportExportPanel, AlibiBreakerPanel } from '@/components/forensic';

export const LeftSidebar = () => {
  const subject = useStore((s) => s.subject);
  const analysis = useStore((s) => s.analysis);
  const [ingestOpen, setIngestOpen] = useState(false);

  return (
    <aside className="h-full overflow-y-auto border-r border-border bg-card p-3 flex flex-col gap-3">
      <IngestionModal open={ingestOpen} onClose={() => setIngestOpen(false)} />
      {/* Subject Profile */}
      <ScorchedCard glow>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 border border-primary bg-primary/10 flex items-center justify-center"
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <User size={16} className="text-primary" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-foreground">
              {subject?.codename ?? 'SUBJECT_NULL'}
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">
              AGE: {subject?.age ?? '--'} • RISK: <span className="text-destructive">{subject?.riskScore ?? '--'}%</span>
            </div>
          </div>
        </div>
        {/* Source distribution mini bars */}
        {subject && (
          <div className="space-y-1">
            {subject.baselineMetrics.primaryPlatforms.slice(0, 4).map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-muted-foreground w-16 text-right uppercase">{p}</span>
                <div className="flex-1 h-1.5 bg-secondary">
                  <div className="h-full bg-primary/60 transition-all" style={{ width: `${Math.min((subject.sourceDistribution[p] || 0) / 2, 100)}%` }} />
                </div>
                <span className="text-[8px] font-mono text-muted-foreground w-6">{subject.sourceDistribution[p] || 0}</span>
              </div>
            ))}
          </div>
        )}
      </ScorchedCard>

      {/* Threat Categories */}
      <ScorchedCard>
        <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
          <Shield size={10} /> THREAT CATEGORIES
        </div>
        <ThreatToggles />
      </ScorchedCard>

      {/* Baseline Metrics */}
      <ScorchedCard>
        <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
          <Activity size={10} /> BASELINE METRICS
        </div>
        <div className="space-y-1.5 text-[10px] font-mono">
          <MetricRow label="AVG SCREEN TIME" value={subject ? `${subject.baselineMetrics.avgDailyScreenTime}m` : '--'} />
          <MetricRow label="PEAK HOUR" value={subject ? `${String(subject.baselineMetrics.peakActivityHour).padStart(2, '0')}:00` : '--'} />
          <MetricRow label="CIRCADIAN DEV" value={subject ? `${subject.baselineMetrics.circadianDeviation}%` : '--'} />
          <MetricRow label="SOCIAL FREQ" value={subject ? `${subject.baselineMetrics.socialMediaFrequency}/day` : '--'} />
        </div>
      </ScorchedCard>

      {/* Context Injection Accordions */}
      <ContextAccordion icon={Clock} title="TEMPORAL ANCHORS">
        <div className="space-y-1.5 text-[9px] font-mono">
          <ContextItem label="D-DAY" value="2024-03-15" sub="Initial discovery event" />
          <ContextItem label="RELATIONSHIP START" value="2021-06-12" sub="Baseline period begins" />
          <ContextItem label="BEHAVIORAL SHIFT" value="2024-01-08" sub="Circadian pattern change detected" />
        </div>
      </ContextAccordion>

      <ContextAccordion icon={Users} title="KNOWN ENTITIES">
        <div className="space-y-1.5 text-[9px] font-mono">
          <EntityItem name="CONTACT_ECHO" rel="Unknown" risk="A" />
          <EntityItem name="PARTNER" rel="Spouse" risk="E" />
          <EntityItem name="CONTACT_PHANTOM" rel="Unknown" risk="A" />
          <EntityItem name="UNKNOWN_7" rel="Unidentified" risk="B" />
        </div>
      </ContextAccordion>

      <ContextAccordion icon={Crosshair} title="EXTERNAL TARGETS">
        <div className="space-y-1.5 text-[9px] font-mono">
          <TargetItem name="ENTITY_ECHO" platform="Instagram" notes="89 mentions, 47 contact attempts" />
          <TargetItem name="TINDER_MATCH_3" platform="Tinder" notes="12 interactions, active profile" />
        </div>
      </ContextAccordion>

      <ContextAccordion icon={Heart} title="RELATIONAL BASELINE">
        <div className="space-y-1.5 text-[9px] font-mono">
          <MetricRow label="MAGIC RATIO" value={analysis ? `${analysis.gottman.magicRatio}:1` : '--'} />
          <MetricRow label="PUB/PRIV DELTA" value={analysis ? `${analysis.socialPerformance.delta}%` : '--'} />
          <MetricRow label="DECEPTION IDX" value={analysis ? `${analysis.deceptionIndex}%` : '--'} />
          <MetricRow label="RECIDIVISM" value={analysis ? `${analysis.recidivismScore}%` : '--'} />
        </div>
      </ContextAccordion>

      {/* Alibi Breaker — temporal/geospatial conflict detector */}
      <AlibiBreakerPanel />

      {/* Step 4: Forensic export */}
      <ReportExportPanel />

      {/* Quick Actions */}
      <ScorchedCard>
        <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2">◆ QUICK ACTIONS</div>
        <div className="flex flex-col gap-1">
          <MagmaButton size="sm" variant="secondary" onClick={() => setIngestOpen(true)}>INGEST EVIDENCE</MagmaButton>
          <MagmaButton size="sm" variant="danger">EXECUTE CORRELATION</MagmaButton>
        </div>
      </ScorchedCard>
    </aside>
  );
};

const ContextAccordion = ({ icon: Icon, title, children }: { icon: typeof Clock; title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <ScorchedCard className="p-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground tracking-widest">
          <Icon size={10} /> {title}
        </div>
        {open ? <ChevronDown size={10} className="text-muted-foreground" /> : <ChevronRight size={10} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </ScorchedCard>
  );
};

const ContextItem = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="border-l-2 border-primary/30 pl-2">
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
    <div className="text-ash text-[8px]">{sub}</div>
  </div>
);

const EntityItem = ({ name, rel, risk }: { name: string; rel: string; risk: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <span className="text-foreground">{name}</span>
      <span className="text-ash ml-1">({rel})</span>
    </div>
    <span className={`text-threat-${risk.toLowerCase()} font-bold`}>CAT-{risk}</span>
  </div>
);

const TargetItem = ({ name, platform, notes }: { name: string; platform: string; notes: string }) => (
  <div className="border-l-2 border-destructive/30 pl-2">
    <div className="text-foreground">{name} <span className="text-muted-foreground">via {platform}</span></div>
    <div className="text-ash text-[8px]">{notes}</div>
  </div>
);

const ThreatToggles = () => {
  const { activeThreatFilters, toggleThreatFilter } = useStore();
  const cats = [
    { cat: 'A' as const, label: 'CRITICAL', color: 'bg-threat-a' },
    { cat: 'B' as const, label: 'HIGH', color: 'bg-threat-b' },
    { cat: 'C' as const, label: 'ELEVATED', color: 'bg-threat-c' },
    { cat: 'D' as const, label: 'MODERATE', color: 'bg-threat-d' },
    { cat: 'E' as const, label: 'LOW', color: 'bg-threat-e' },
    { cat: 'F' as const, label: 'INFO', color: 'bg-threat-f' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1">
      {cats.map(({ cat, label, color }) => (
        <button
          key={cat}
          onClick={() => toggleThreatFilter(cat)}
          className={`flex items-center gap-1.5 px-1.5 py-0.5 text-[9px] font-mono border transition-all ${
            activeThreatFilters.includes(cat)
              ? 'border-border text-foreground'
              : 'border-transparent text-muted-foreground opacity-40'
          }`}
        >
          <span className={`w-1.5 h-1.5 ${color} ${activeThreatFilters.includes(cat) ? '' : 'opacity-30'}`} />
          {cat}-{label}
        </button>
      ))}
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);
