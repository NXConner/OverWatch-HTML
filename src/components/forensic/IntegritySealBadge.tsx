import { ShieldCheck } from 'lucide-react';
import type { ProvenanceSeal } from '@/lib/sha256';

interface Props {
  seal: ProvenanceSeal;
  compact?: boolean;
}

// Visualizes the SHA-256 cryptographic seal generated at point of capture
// (combining filename, byte length, UTC timestamp, and optional GPS).
export const IntegritySealBadge = ({ seal, compact = false }: Props) => {
  const short = `${seal.hash.slice(0, 8)}…${seal.hash.slice(-8)}`;
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-0.5 border border-terminal/40 bg-terminal/5">
      <ShieldCheck size={10} className="text-terminal" />
      <div className="flex flex-col leading-tight">
        <span className="text-[8px] font-mono text-terminal tracking-widest">SHA-256 SEAL</span>
        {!compact && (
          <span className="text-[8px] font-mono text-muted-foreground" title={seal.hash}>
            {short}
          </span>
        )}
      </div>
      {!compact && (
        <span className="text-[8px] font-mono text-ash ml-1">
          {seal.gps ? `GPS✓` : 'GPS—'} • {new Date(seal.utc).toISOString().slice(11, 19)}Z
        </span>
      )}
    </div>
  );
};
