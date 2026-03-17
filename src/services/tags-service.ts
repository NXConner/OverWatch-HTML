import { prisma } from "../../lib/prisma";
import { mapPrismaError } from "./_shared/errors";

export async function listTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { events: true, subjects: true } } },
    orderBy: { name: "asc" }
  });
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    include: { _count: { select: { events: true, subjects: true } } }
  });
}

export async function createTag(input: { name: string; color?: string }) {
  try {
    return await prisma.tag.create({ data: { name: input.name.trim(), color: input.color ?? "#f97316" } });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function updateTag(id: string, updates: Partial<{ name: string; color: string }>) {
  try {
    return await prisma.tag.update({ where: { id }, data: updates });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  return { deleted: true };
}

