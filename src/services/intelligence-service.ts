import { prisma } from "../../lib/prisma";
import { requestJson } from "./_shared/http-client";
import { mapPrismaError } from "./_shared/errors";

interface AIResult {
  content: string;
}

function composePrompt(caseData: {
  title: string;
  description: string | null;
  events: Array<{ eventType: string; source: string; severity: string; content: string | null }>;
  subjects: Array<{ name: string; alias: string | null; description: string | null }>;
}) {
  const events = caseData.events
    .slice(0, 300)
    .map((event) => `${event.severity.toUpperCase()} ${event.eventType} [${event.source}] ${event.content ?? ""}`)
    .join("\n");
  const subjects = caseData.subjects.map((s) => `${s.name}${s.alias ? ` (${s.alias})` : ""}`).join(", ");
  return `Case: ${caseData.title}
Description: ${caseData.description ?? "N/A"}
Subjects: ${subjects || "N/A"}
Events:
${events || "No events"}

Generate concise forensic insights with key findings, timeline risks, and recommended next actions.`;
}

export async function generateIntelligenceReport(input: {
  caseId: string;
  analysisType?: string;
  contextInjection?: string | null;
  userId?: string;
  userEmail?: string;
}) {
  const caseData = await prisma.case.findUnique({
    where: { id: input.caseId },
    include: {
      events: { select: { eventType: true, source: true, severity: true, content: true }, orderBy: { timestamp: "desc" }, take: 300 },
      subjects: { select: { name: true, alias: true, description: true } }
    }
  });
  if (!caseData) throw new Error("Case not found");

  const prompt = `${composePrompt(caseData)}\n\nAnalyst context:\n${input.contextInjection ?? "None"}`;
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  let content = "AI integration unavailable. Generated fallback summary from stored case context.";

  if (apiUrl && apiKey) {
    try {
      const response = await requestJson<AIResult>({
        url: apiUrl,
        headers: { Authorization: `Bearer ${apiKey}` },
        body: { prompt, analysisType: input.analysisType ?? "general", caseId: input.caseId }
      });
      if (response.content?.trim()) content = response.content.trim();
    } catch (error) {
      content = `AI request failed; fallback used.\n\nReason: ${error instanceof Error ? error.message : "Unknown"}\n\n${prompt}`;
    }
  }

  try {
    return await prisma.intelligenceReport.create({
      data: {
        caseId: input.caseId,
        analysisType: input.analysisType ?? "general",
        content,
        contextInjection: input.contextInjection,
        userId: input.userId,
        userEmail: input.userEmail
      }
    });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function listIntelligenceReports(caseId: string) {
  return prisma.intelligenceReport.findMany({ where: { caseId }, orderBy: { createdAt: "desc" } });
}

export async function saveIntelligenceReport(input: {
  caseId: string;
  analysisType?: string;
  content: string;
  contextInjection?: string | null;
  userId?: string;
  userEmail?: string;
}) {
  return prisma.intelligenceReport.create({
    data: {
      caseId: input.caseId,
      analysisType: input.analysisType ?? "manual",
      content: input.content,
      contextInjection: input.contextInjection,
      userId: input.userId,
      userEmail: input.userEmail
    }
  });
}

