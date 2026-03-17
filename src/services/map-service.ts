import { prisma } from "../../lib/prisma";
import { tryParseJson } from "./_shared/json";

interface GeoMeta {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export async function getCaseMapPoints(caseId: string) {
  const events = await prisma.unifiedForensicEvent.findMany({
    where: { caseId },
    select: { id: true, eventType: true, severity: true, timestamp: true, metadata: true, content: true }
  });
  return events
    .map((event) => {
      const meta = tryParseJson<GeoMeta>(event.metadata);
      if (typeof meta?.latitude !== "number" || typeof meta.longitude !== "number") return null;
      return {
        id: event.id,
        latitude: meta.latitude,
        longitude: meta.longitude,
        address: meta.address ?? null,
        eventType: event.eventType,
        severity: event.severity,
        timestamp: event.timestamp,
        content: event.content
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function getHeatmap(caseId: string) {
  const points = await getCaseMapPoints(caseId);
  const buckets = new Map<string, { latitude: number; longitude: number; count: number }>();
  for (const point of points) {
    const latBucket = Math.round(point.latitude * 100) / 100;
    const lngBucket = Math.round(point.longitude * 100) / 100;
    const key = `${latBucket}:${lngBucket}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { latitude: latBucket, longitude: lngBucket, count: 1 });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => b.count - a.count);
}

