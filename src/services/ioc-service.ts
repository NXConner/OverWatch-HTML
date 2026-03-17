import { prisma } from "../../lib/prisma";
import { mapPrismaError } from "./_shared/errors";
import { toPagination } from "./_shared/pagination";

const IOC_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: "ip", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { type: "domain", regex: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g },
  { type: "hash_sha256", regex: /\b[a-fA-F0-9]{64}\b/g },
  { type: "email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi }
];

export async function listIocs(params: { caseId?: string; type?: string; search?: string; page?: number; pageSize?: number }) {
  const { skip, take, page, pageSize } = toPagination(params);
  const where = {
    ...(params.caseId ? { caseId: params.caseId } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.search ? { value: { contains: params.search, mode: "insensitive" as const } } : {})
  };
  const [items, total] = await Promise.all([
    prisma.iOCEntry.findMany({ where, orderBy: { lastSeen: "desc" }, skip, take }),
    prisma.iOCEntry.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export async function createIoc(input: {
  type: string;
  value: string;
  caseId: string;
  sourceReportId?: string;
  confidence?: number;
}) {
  try {
    return await prisma.iOCEntry.upsert({
      where: { type_value_caseId: { type: input.type, value: input.value, caseId: input.caseId } },
      create: {
        type: input.type,
        value: input.value,
        caseId: input.caseId,
        sourceReportId: input.sourceReportId,
        confidence: input.confidence ?? 0.5
      },
      update: {
        lastSeen: new Date(),
        sourceReportId: input.sourceReportId ?? undefined,
        confidence: input.confidence ?? undefined,
        crossRefCount: { increment: 1 }
      }
    });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function extractIocsFromReport(reportId: string, caseId: string) {
  const report = await prisma.intelligenceReport.findUnique({ where: { id: reportId } });
  if (!report) return { created: 0, items: [] as unknown[] };

  const matches: Array<{ type: string; value: string }> = [];
  for (const pattern of IOC_PATTERNS) {
    const found = report.content.match(pattern.regex) ?? [];
    for (const value of found) matches.push({ type: pattern.type, value: value.toLowerCase() });
  }
  const deduped = Array.from(new Map(matches.map((m) => [`${m.type}:${m.value}`, m])).values());
  const items = await Promise.all(deduped.map((item) => createIoc({ ...item, caseId, sourceReportId: reportId, confidence: 0.7 })));
  return { created: items.length, items };
}

export async function deleteIoc(id: string) {
  await prisma.iOCEntry.delete({ where: { id } });
  return { deleted: true };
}

