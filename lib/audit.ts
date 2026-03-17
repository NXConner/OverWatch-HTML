import { prisma } from '@/lib/prisma';

export async function logAudit(params: {
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
