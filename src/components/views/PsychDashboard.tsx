import { useStore } from '@/store/useStore';
import { ScorchedCard } from '@/components/design-system';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';

const GaugeCard = ({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) => {
  const data = [{ value: (value / max) * 100, fill: color }];
  return (
    <ScorchedCard className="flex flex-col items-center p-2">
      <div className="w-full h-20">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} data={data} barSize={8}>
            <RadialBar background={{ fill: 'hsl(220, 12%, 14%)' }} dataKey="value" cornerRadius={2} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-2">
        <div className="text-sm font-mono font-bold" style={{ color }}>{value}{max === 100 ? '%' : ''}</div>
        <div className="text-[8px] font-mono text-muted-foreground tracking-widest">{label}</div>
      </div>
    </ScorchedCard>
  );
};

export const PsychDashboard = () => {
  const analysis = useStore((s) => s.analysis);
  if (!analysis) return <div className="text-muted-foreground text-[10px] font-mono p-4">AWAITING ANALYSIS DATA...</div>;

  const { gottman, recidivismScore, deceptionIndex, sentimentTimeline, socialPerformance, ldaTopics } = analysis;

  const topicColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

  return (
    <div className="w-full h-full overflow-y-auto p-2 space-y-2">
      {/* Gottman Four Horsemen */}
      <div className="text-[9px] font-mono text-muted-foreground tracking-widest px-1">◆ GOTTMAN FOUR HORSEMEN</div>
      <div className="grid grid-cols-4 gap-1.5">
        <GaugeCard label="CRITICISM" value={gottman.criticism} color="#ef4444" />
        <GaugeCard label="CONTEMPT" value={gottman.contempt} color="#f97316" />
        <GaugeCard label="DEFENSIVE" value={gottman.defensiveness} color="#eab308" />
        <GaugeCard label="STONEWALL" value={gottman.stonewalling} color="#3b82f6" />
      </div>

      {/* Magic Ratio */}
      <ScorchedCard className="p-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-muted-foreground">MAGIC RATIO (pos:neg)</span>
          <span className="text-sm font-mono font-bold text-destructive">{gottman.magicRatio}:1</span>
        </div>
        <div className="w-full h-2 bg-secondary mt-1.5 relative">
          <div className="h-full bg-destructive transition-all" style={{ width: `${Math.min((gottman.magicRatio / 5) * 100, 100)}%` }} />
          <div className="absolute top-0 h-full w-px bg-terminal" style={{ left: '100%' }} title="Healthy: 5:1" />
        </div>
        <div className="text-[8px] font-mono text-muted-foreground mt-0.5 text-right">HEALTHY THRESHOLD: 5:1</div>
      </ScorchedCard>

      {/* Recidivism + Deception */}
      <div className="grid grid-cols-2 gap-1.5">
        <GaugeCard label="RECIDIVISM" value={recidivismScore} color="#ef4444" />
        <GaugeCard label="DECEPTION IDX" value={deceptionIndex} color="#f97316" />
      </div>

      {/* Sentiment Timeline */}
      <div className="text-[9px] font-mono text-muted-foreground tracking-widest px-1">◆ SENTIMENT TRAJECTORY</div>
      <ScorchedCard noPadding className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sentimentTimeline} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 14%)" />
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(220, 10%, 40%)' }} stroke="hsl(25, 40%, 18%)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: 'hsl(220, 10%, 40%)' }} stroke="hsl(25, 40%, 18%)" />
            <Tooltip contentStyle={{ background: 'hsl(220, 14%, 9%)', border: '1px solid hsl(25, 40%, 18%)', fontSize: 10 }} />
            <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#ef444420" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </ScorchedCard>

      {/* Social Performance */}
      <div className="text-[9px] font-mono text-muted-foreground tracking-widest px-1">◆ SOCIAL PERFORMANCE DELTA</div>
      <ScorchedCard className="p-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-mono font-bold text-terminal">{socialPerformance.public}%</div>
            <div className="text-[8px] font-mono text-muted-foreground">PUBLIC</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-destructive">Δ{socialPerformance.delta}</div>
            <div className="text-[8px] font-mono text-muted-foreground">DELTA</div>
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-ember">{socialPerformance.private}%</div>
            <div className="text-[8px] font-mono text-muted-foreground">PRIVATE</div>
          </div>
        </div>
      </ScorchedCard>

      {/* LDA Topics */}
      <div className="text-[9px] font-mono text-muted-foreground tracking-widest px-1">◆ LDA TOPIC DISTRIBUTION</div>
      <ScorchedCard noPadding className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ldaTopics} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 80 }}>
            <XAxis type="number" domain={[0, 0.5]} tick={{ fontSize: 8, fill: 'hsl(220, 10%, 40%)' }} stroke="hsl(25, 40%, 18%)" />
            <YAxis type="category" dataKey="topic" tick={{ fontSize: 8, fill: 'hsl(220, 10%, 40%)' }} stroke="hsl(25, 40%, 18%)" width={75} />
            <Bar dataKey="weight" barSize={10}>
              {ldaTopics.map((_, i) => (
                <Cell key={i} fill={topicColors[i % topicColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ScorchedCard>
    </div>
  );
};
