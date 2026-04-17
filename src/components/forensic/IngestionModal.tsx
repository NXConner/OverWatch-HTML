import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Loader2, MapPin } from 'lucide-react';
import { ScorchedCard, MagmaButton } from '@/components/design-system';
import { IntegritySealBadge } from './IntegritySealBadge';
import { buildProvenanceSeal, type ProvenanceSeal } from '@/lib/sha256';

interface IngestedItem {
  file: File;
  seal: ProvenanceSeal;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// Step 2 of the Engine of Proof: physical evidence capture with cryptographic provenance.
export const IngestionModal = ({ open, onClose }: Props) => {
  const [items, setItems] = useState<IngestedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const requestGps = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGps(null),
      { enableHighAccuracy: true, timeout: 4000 }
    );
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setBusy(true);
    const list = Array.from(files);
    const sealed: IngestedItem[] = [];
    for (const file of list) {
      const seal = await buildProvenanceSeal(file, gps);
      sealed.push({ file, seal });
    }
    setItems((prev) => [...prev, ...sealed]);
    setBusy(false);
  }, [gps]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const remove = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
         onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <ScorchedCard glow className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Upload size={14} className="text-primary" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-foreground">
                STEP 2 — EVIDENCE CAPTURE
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          {/* GPS toggle */}
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <button
              onClick={requestGps}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-terminal transition-colors"
            >
              <MapPin size={10} />
              {gps ? `GPS LOCKED ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'BIND GPS COORDINATES'}
            </button>
            <span className="text-[8px] font-mono text-ash">
              SHA-256 generated at capture · combines filename + bytes + UTC + GPS
            </span>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`m-4 border border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-8 ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
            }`}
          >
            {busy ? (
              <Loader2 size={20} className="text-primary animate-spin" />
            ) : (
              <Upload size={20} className="text-muted-foreground mb-2" />
            )}
            <div className="text-[10px] font-mono text-foreground mt-1">
              DROP EVIDENCE FILES OR CLICK TO BROWSE
            </div>
            <div className="text-[8px] font-mono text-ash mt-0.5">
              Each file is hashed locally — only obfuscated weight updates are transmitted.
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Sealed items list */}
          {items.length > 0 && (
            <div className="px-4 pb-3 max-h-56 overflow-y-auto space-y-1.5">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border border-border bg-secondary/30">
                  <FileText size={12} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-foreground truncate">{it.file.name}</div>
                    <div className="text-[8px] font-mono text-ash">{(it.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <IntegritySealBadge seal={it.seal} compact />
                  <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-[9px] font-mono text-muted-foreground">
              {items.length} ARTIFACT{items.length === 1 ? '' : 'S'} SEALED
            </span>
            <div className="flex gap-2">
              <MagmaButton size="sm" variant="secondary" onClick={onClose}>CANCEL</MagmaButton>
              <MagmaButton
                size="sm"
                variant="primary"
                disabled={items.length === 0}
                onClick={onClose}
              >
                COMMIT TO CHAIN
              </MagmaButton>
            </div>
          </div>
        </ScorchedCard>
      </div>
    </div>
  );
};
