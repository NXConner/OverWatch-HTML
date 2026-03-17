import { prisma } from "../../lib/prisma";
import { mapPrismaError, notFound } from "./_shared/errors";
import { toPagination } from "./_shared/pagination";

export interface CasesQuery {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildCaseNumber(): string {
  return `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, "0")}`;
}

export async function listCases(query: CasesQuery) {
  const { skip, take, page, pageSize } = toPagination(query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { caseNumber: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [items, total] = await Promise.all([
    prisma.case.findMany({
      where,
      include: { _count: { select: { subjects: true, events: true, notes: true, reports: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take
    }),
    prisma.case.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export async function getCaseById(id: string) {
  const item = await prisma.case.findUnique({
    where: { id },
    include: { _count: { select: { subjects: true, events: true, notes: true, reports: true } } }
  });
  if (!item) throw notFound("Case not found");
  return item;
}

export async function createCase(input: {
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
  createdById: string;
}) {
  try {
    return await prisma.case.create({
      data: {
        caseNumber: buildCaseNumber(),
        title: input.title,
        description: input.description,
        priority: input.priority ?? "medium",
        status: input.status ?? "open",
        createdById: input.createdById
      }
    });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function updateCase(
  id: string,
  updates: Partial<{ title: string; description: string | null; status: string; priority: string }>
) {
  try {
    return await prisma.case.update({ where: { id }, data: updates });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteCase(id: string) {
  try {
    await prisma.case.delete({ where: { id } });
    return { deleted: true };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

