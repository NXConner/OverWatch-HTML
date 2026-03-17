import { prisma } from "../../lib/prisma";
import { logAudit } from "../../lib/audit";
import { toPagination } from "./_shared/pagination";

export async function createAuditEntry(input: {
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await logAudit(input);
  return { created: true };
}

export async function listAuditEntries(params: {
  userId?: string;
  entity?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const { skip, take, page, pageSize } = toPagination(params);
  const where = {
    ...(params.userId ? { userId: params.userId } : {}),
    ...(params.entity ? { entity: params.entity } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.from || params.to
      ? {
          createdAt: {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {})
          }
        }
      : {})
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.auditLog.count({ where })
  ]);
  return { items, total, page, pageSize };
}

