import { describe, expect, it } from "vitest";
import {
  classifyBrowserEntry,
  detectAnomalies,
  generateDomainStats,
} from "../lib/forensic-classifier";

describe("forensic classifier smoke", () => {
  it("classifies a known domain with category and threat score", () => {
    const event = classifyBrowserEntry({
      title: "OnlyFans",
      url: "https://onlyfans.com",
      time_usec: 1710000000000000,
      page_transition: "typed",
      client_id: "client-001",
    });

    expect(event.category).toBe("adult_content");
    expect(event.severity).toBe("critical");
    expect(event.threatScore).toBeGreaterThan(70);
  });

  it("builds domain statistics and detects anomalies", () => {
    const events = [
      classifyBrowserEntry({
        title: "Unknown",
        url: "https://example.com",
        time_usec: 1710000000000000,
        page_transition: "link",
        client_id: "client-001",
      }),
      classifyBrowserEntry({
        title: "Explicit",
        url: "https://www.pornhub.com",
        time_usec: 1710003600000000,
        page_transition: "typed",
        client_id: "client-001",
      }),
    ];

    const stats = generateDomainStats(events);
    const anomalies = detectAnomalies(events);

    expect(stats["example.com"]).toBe(1);
    expect(stats["www.pornhub.com"]).toBe(1);
    expect(anomalies.length).toBeGreaterThanOrEqual(1);
  });
});
