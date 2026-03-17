import { prisma } from "../../lib/prisma";

export async function getDashboardStats() {
  const [cases, subjects, events, reports, iocs, ingestFiles] = await Promise.all([
    prisma.case.count(),
    prisma.subjectBaselineProfile.count(),
    prisma.unifiedForensicEvent.count(),
    prisma.intelligenceReport.count(),
    prisma.iOCEntry.count(),
    prisma.ingestedFile.count()
  ]);

  const [eventSeverity, caseStatus] = await Promise.all([
    prisma.unifiedForensicEvent.groupBy({ by: ["severity"], _count: { severity: true } }),
    prisma.case.groupBy({ by: ["status"], _count: { status: true } })
  ]);

  return {
    totals: { cases, subjects, events, reports, iocs, ingestFiles },
    eventSeverity: eventSeverity.map((row) => ({ severity: row.severity, count: row._count.severity })),
    caseStatus: caseStatus.map((row) => ({ status: row.status, count: row._count.status }))
  };
}

export async function getCaseStats(caseId: string) {
  const [subjects, events, reports, iocs, notes] = await Promise.all([
    prisma.subjectBaselineProfile.count({ where: { caseId } }),
    prisma.unifiedForensicEvent.count({ where: { caseId } }),
    prisma.intelligenceReport.count({ where: { caseId } }),
    prisma.iOCEntry.count({ where: { caseId } }),
    prisma.caseNote.count({ where: { caseId } })
  ]);
  return { caseId, totals: { subjects, events, reports, iocs, notes } };
}

