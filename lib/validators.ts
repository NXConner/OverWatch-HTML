import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const updateCaseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['open', 'active', 'closed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  alias: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  caseId: z.string().min(1, 'caseId required'),
  metadata: z.string().max(10000).optional().nullable(),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  alias: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  caseId: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  email: z.string().email('Valid email required'),
  subject: z.string().max(500).optional().nullable(),
  message: z.string().min(1, 'Message required').max(10000),
});

export const signupSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().max(200).optional(),
});

export const intelligenceSchema = z.object({
  caseId: z.string().min(1, 'caseId required'),
  analysisType: z.enum(['behavioral', 'temporal', 'general']).optional(),
  contextInjection: z.string().max(20000).optional().nullable(),
});

export const saveReportSchema = z.object({
  caseId: z.string().min(1, 'caseId required'),
  analysisType: z.string().max(100).optional(),
  content: z.string().min(1, 'Content required').max(100000),
  contextInjection: z.string().max(20000).optional().nullable(),
});

export const ingestSchema = z.object({
  caseId: z.string().min(1, 'caseId required'),
  source: z.string().max(500).optional(),
  cloud_storage_path: z.string().max(1000).optional(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Content required').max(50000),
});

export const presignedUploadSchema = z.object({
  fileName: z.string().min(1, 'fileName required').max(500),
  contentType: z.string().max(200).optional(),
  isPublic: z.boolean().optional(),
});

export const uploadCompleteSchema = z.object({
  cloud_storage_path: z.string().min(1),
  isPublic: z.boolean().optional(),
  fileName: z.string().max(500).optional(),
  caseId: z.string().min(1, 'caseId required'),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
});

export const iocExtractSchema = z.object({
  reportId: z.string().min(1),
  caseId: z.string().min(1),
});

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map(i => i.message).join(', ');
    return { success: false, error: msg };
  }
  return { success: true, data: result.data };
}
