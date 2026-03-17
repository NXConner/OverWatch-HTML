import { prisma } from "../../lib/prisma";
import { mapPrismaError } from "./_shared/errors";
import { toJson, tryParseJson } from "./_shared/json";
import { toPagination } from "./_shared/pagination";

export async function listSubjects(params: { caseId?: string; search?: string; page?: number; pageSize?: number }) {
  const { skip, take, page, pageSize } = toPagination(params);
  const where = {
    ...(params.caseId ? { caseId: params.caseId } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { alias: { contains: params.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [items, total] = await Promise.all([
    prisma.subjectBaselineProfile.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take
    }),
    prisma.subjectBaselineProfile.count({ where })
  ]);
  return {
    items: items.map((item) => ({ ...item, metadata: tryParseJson(item.metadata) })),
    total,
    page,
    pageSize
  };
}

export async function getSubjectById(id: string) {
  const item = await prisma.subjectBaselineProfile.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } }
  });
  return item ? { ...item, metadata: tryParseJson(item.metadata) } : null;
}

export async function createSubject(input: {
  caseId: string;
  name: string;
  alias?: string | null;
  description?: string | null;
  metadata?: unknown;
}) {
  try {
    const item = await prisma.subjectBaselineProfile.create({
      data: {
        caseId: input.caseId,
        name: input.name,
        alias: input.alias,
        description: input.description,
        metadata: toJson(input.metadata)
      }
    });
    return { ...item, metadata: tryParseJson(item.metadata) };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function updateSubject(
  id: string,
  updates: Partial<{ name: string; alias: string | null; description: string | null; caseId: string; metadata: unknown }>
) {
  try {
    const item = await prisma.subjectBaselineProfile.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.metadata !== undefined ? { metadata: toJson(updates.metadata) } : {})
      }
    });
    return { ...item, metadata: tryParseJson(item.metadata) };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subjectBaselineProfile.delete({ where: { id } });
    return { deleted: true };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function attachSubjectTag(subjectId: string, tagId: string) {
  try {
    return await prisma.subjectTag.create({ data: { subjectId, tagId } });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function detachSubjectTag(subjectId: string, tagId: string) {
  await prisma.subjectTag.deleteMany({ where: { subjectId, tagId } });
  return { deleted: true };
}

