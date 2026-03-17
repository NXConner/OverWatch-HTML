import { prisma } from "../../lib/prisma";
import { mapPrismaError } from "./_shared/errors";
import { toJson, tryParseJson } from "./_shared/json";
import { toPagination } from "./_shared/pagination";

export async function listEvents(params: {
  caseId?: string;
  severity?: string;
  source?: string;
  eventType?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const { skip, take, page, pageSize } = toPagination(params);
  const where = {
    ...(params.caseId ? { caseId: params.caseId } : {}),
    ...(params.severity ? { severity: params.severity } : {}),
    ...(params.source ? { source: params.source } : {}),
    ...(params.eventType ? { eventType: params.eventType } : {}),
    ...(params.search ? { content: { contains: params.search, mode: "insensitive" as const } } : {}),
    ...(params.from || params.to
      ? {
          timestamp: {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {})
          }
        }
      : {})
  };
  const [items, total] = await Promise.all([
    prisma.unifiedForensicEvent.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { timestamp: "desc" },
      skip,
      take
    }),
    prisma.unifiedForensicEvent.count({ where })
  ]);
  return { items: items.map((item) => ({ ...item, metadata: tryParseJson(item.metadata) })), total, page, pageSize };
}

export async function getEventById(id: string) {
  const item = await prisma.unifiedForensicEvent.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } }
  });
  return item ? { ...item, metadata: tryParseJson(item.metadata) } : null;
}

export async function createEvent(input: {
  caseId: string;
  eventType: string;
  source: string;
  content?: string | null;
  metadata?: unknown;
  severity?: string;
  timestamp?: string;
}) {
  try {
    const item = await prisma.unifiedForensicEvent.create({
      data: {
        caseId: input.caseId,
        eventType: input.eventType,
        source: input.source,
        content: input.content,
        metadata: toJson(input.metadata),
        severity: input.severity ?? "info",
        ...(input.timestamp ? { timestamp: new Date(input.timestamp) } : {})
      }
    });
    return { ...item, metadata: tryParseJson(item.metadata) };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function updateEvent(
  id: string,
  updates: Partial<{ eventType: string; source: string; content: string | null; severity: string; metadata: unknown }>
) {
  try {
    const item = await prisma.unifiedForensicEvent.update({
      where: { id },
      data: { ...updates, ...(updates.metadata !== undefined ? { metadata: toJson(updates.metadata) } : {}) }
    });
    return { ...item, metadata: tryParseJson(item.metadata) };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteEvent(id: string) {
  await prisma.unifiedForensicEvent.delete({ where: { id } });
  return { deleted: true };
}

export async function attachEventTag(eventId: string, tagId: string) {
  return prisma.eventTag.create({ data: { eventId, tagId } });
}

export async function detachEventTag(eventId: string, tagId: string) {
  await prisma.eventTag.deleteMany({ where: { eventId, tagId } });
  return { deleted: true };
}

