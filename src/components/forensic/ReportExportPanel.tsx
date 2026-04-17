import { useState } from 'react';
import jsPDF from 'jspdf';
import { FileText, Download, Loader2 } from 'lucide-react';
import { ScorchedCard, MagmaButton } from '@/components/design-system';
import { useStore } from '@/store/useStore';
import { sha256Hex } from '@/lib/sha256';

// Step 4 of the Engine of Proof: forensic audit report export (PDF)
export const ReportExportPanel = () => {
  const { subject, analysis, events, markedEvents } = useStore();
  const [busy, setBusy] = useState(false);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const stamp = new Date().toISOString();
      const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

      // Header
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text('PANOPTICON FORENSIC AUDIT REPORT', 40, 50);
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text(`REPORT ID: ${reportId}`, 40, 68);
      doc.text(`GENERATED: ${stamp}`, 40, 80);

      doc.setDrawColor(180);
      doc.line(40, 90, 572, 90);

      // Subject
      doc.setFont('courier', 'bold');
      doc.text('§ SUBJECT', 40, 110);
      doc.setFont('courier', 'normal');
      doc.text(`Codename: ${subject?.codename ?? '—'}`, 40, 124);
      doc.text(`Risk Score: ${subject?.riskScore ?? '—'}%`, 40, 136);
      doc.text(`Avg Screen Time: ${subject?.baselineMetrics.avgDailyScreenTime ?? '—'}m`, 40, 148);

      // Analysis
      doc.setFont('courier', 'bold');
      doc.text('§ ANALYSIS', 40, 174);
      doc.setFont('courier', 'normal');
      if (analysis) {
        doc.text(`Gottman — Criticism:${analysis.gottman.criticism}  Contempt:${analysis.gottman.contempt}`, 40, 188);
        doc.text(`Defensiveness:${analysis.gottman.defensiveness}  Stonewalling:${analysis.gottman.stonewalling}`, 40, 200);
        doc.text(`Magic Ratio: ${analysis.gottman.magicRatio}:1   Recidivism: ${analysis.recidivismScore}%`, 40, 212);
        doc.text(`Deception Index: ${analysis.deceptionIndex}%   Pub/Priv Δ: ${analysis.socialPerformance.delta}`, 40, 224);
      }

      // Events summary
      doc.setFont('courier', 'bold');
      doc.text(`§ EVENTS (${events.length} total · ${markedEvents.length} marked)`, 40, 250);
      doc.setFont('courier', 'normal');
      let y = 264;
      const sample = events.slice(0, 18);
      sample.forEach((e) => {
        const line = `[CAT-${e.category}] ${new Date(e.timestamp).toISOString().slice(0, 16)} ${e.platform.toUpperCase().padEnd(10)} ${e.title}`;
        doc.text(line.slice(0, 90), 40, y);
        y += 11;
      });

      // Provenance footer with SHA-256 of the report payload
      const payload = JSON.stringify({ reportId, stamp, subject: subject?.codename, eventsCount: events.length, marked: markedEvents.length });
      const hash = await sha256Hex(payload);
      setLastHash(hash);
      doc.setDrawColor(180);
      doc.line(40, 740, 572, 740);
      doc.setFont('courier', 'bold');
      doc.text('§ PROVENANCE SEAL (SHA-256)', 40, 754);
      doc.setFont('courier', 'normal');
      doc.text(hash.match(/.{1,32}/g)!.join('\n'), 40, 766);

      doc.save(`${reportId}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScorchedCard className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <FileText size={12} className="text-primary" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-foreground">
          STEP 4 — FORENSIC EXPORT
        </span>
      </div>
      <div className="text-[9px] font-mono text-ash">
        Generates a sealed PDF audit report. Hash combines subject, event count, and UTC stamp.
      </div>
      <MagmaButton size="sm" variant="primary" onClick={generate} disabled={busy} className="w-full">
        {busy ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 size={10} className="animate-spin" /> SEALING...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <Download size={10} /> EXPORT REPORT
          </span>
        )}
      </MagmaButton>
      {lastHash && (
        <div className="text-[8px] font-mono text-terminal break-all border border-terminal/30 bg-terminal/5 p-1.5">
          ◆ LAST SEAL · {lastHash.slice(0, 32)}…
        </div>
      )}
    </ScorchedCard>
  );
};
