import crypto from "node:crypto";
import { prisma } from "../../lib/prisma";
import { requestJson } from "./_shared/http-client";
import { mapPrismaError } from "./_shared/errors";
import { toJson } from "./_shared/json";

interface ParsedEvent {
  eventType: string;
  source: string;
  content?: string;
  severity?: string;
  timestamp?: string;
  metadata?: unknown;
}

export async function ingestEvents(caseId: string, source: string, events: ParsedEvent[]) {
  const created = await prisma.$transaction(
    events.map((event) =>
      prisma.unifiedForensicEvent.create({
        data: {
          caseId,
          eventType: event.eventType,
          source: event.source || source,
          content: event.content,
          severity: event.severity ?? "info",
          metadata: toJson(event.metadata),
          ...(event.timestamp ? { timestamp: new Date(event.timestamp) } : {})
        }
      })
    )
  );
  return { count: created.length, events: created };
}

export async function ingestFromPdf(input: { caseId: string; cloud_storage_path?: string; source?: string }) {
  const parserUrl = process.env.PDF_EXTRACT_API_URL;
  const parserKey = process.env.PDF_EXTRACT_API_KEY;
  const source = input.source ?? input.cloud_storage_path ?? "pdf";
  let extractedEvents: ParsedEvent[] = [];
  let failureReason: string | undefined;

  if (parserUrl && parserKey) {
    try {
      const response = await requestJson<{ events?: ParsedEvent[] }>({
        url: parserUrl,
        headers: { Authorization: `Bearer ${parserKey}` },
        body: { caseId: input.caseId, cloud_storage_path: input.cloud_storage_path, source }
      });
      extractedEvents = response.events ?? [];
    } catch (error) {
      failureReason = error instanceof Error ? error.message : "Unknown extractor failure";
    }
  } else {
    failureReason = "PDF extraction not configured (missing PDF_EXTRACT_API_URL/PDF_EXTRACT_API_KEY)";
  }

  const ingested = await ingestEvents(input.caseId, source, extractedEvents);
  const fileKey = input.cloud_storage_path ?? `${source}:${Date.now()}`;
  const fileHash = crypto.createHash("sha256").update(fileKey).digest("hex");

  try {
    const file = await prisma.ingestedFile.upsert({
      where: { fileHash_caseId: { fileHash, caseId: input.caseId } },
      create: { fileName: fileKey.split("/").pop() ?? fileKey, fileHash, caseId: input.caseId, source, eventCount: ingested.count },
      update: { source, eventCount: ingested.count }
    });
    return { file, ...ingested, failureReason };
  } catch (error) {
    throw mapPrismaError(error);
  }
}

