import { prisma } from "../../lib/prisma";
import { tryParseJson } from "./_shared/json";

type EventMeta = { latitude?: number; longitude?: number; category?: string } | null;

export async function buildCaseAnalysis(caseId: string) {
  const [caseEntity, events, subjects, iocCount] = await Promise.all([
    prisma.case.findUnique({ where: { id: caseId }, select: { id: true, caseNumber: true, title: true, status: true, priority: true } }),
    prisma.unifiedForensicEvent.findMany({
      where: { caseId },
      select: { id: true, severity: true, eventType: true, timestamp: true, metadata: true }
    }),
    prisma.subjectBaselineProfile.findMany({ where: { caseId }, select: { id: true } }),
    prisma.iOCEntry.count({ where: { caseId } })
  ]);
  if (!caseEntity) return null;

  const severityBreakdown: Record<string, number> = {};
  const eventTypeBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  let geocodedEvents = 0;

  for (const event of events) {
    severityBreakdown[event.severity] = (severityBreakdown[event.severity] ?? 0) + 1;
    eventTypeBreakdown[event.eventType] = (eventTypeBreakdown[event.eventType] ?? 0) + 1;
    const meta = tryParseJson<EventMeta>(event.metadata);
    if (meta?.category) categoryBreakdown[meta.category] = (categoryBreakdown[meta.category] ?? 0) + 1;
    if (typeof meta?.latitude === "number" && typeof meta?.longitude === "number") geocodedEvents += 1;
  }

  return {
    case: caseEntity,
    totals: { events: events.length, subjects: subjects.length, iocs: iocCount, geocodedEvents },
    breakdowns: { severity: severityBreakdown, eventType: eventTypeBreakdown, category: categoryBreakdown }
  };
}

export async function buildGlobalAnalysis() {
  const [cases, events, iocs] = await Promise.all([prisma.case.count(), prisma.unifiedForensicEvent.count(), prisma.iOCEntry.count()]);
  const hotCases = await prisma.case.findMany({
    orderBy: [{ events: { _count: "desc" } }],
    take: 10,
    select: { id: true, caseNumber: true, title: true, _count: { select: { events: true, subjects: true } } }
  });
  return { totals: { cases, events, iocs }, hotCases };
}

