import { externalFailure } from "./errors";

export interface HttpJsonRequest {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export async function requestJson<T>(request: HttpJsonRequest): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = request.timeoutMs ?? 20_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request.url, {
      method: request.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers ?? {})
      },
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text();
      throw externalFailure(`HTTP ${response.status} from external service`, text);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw externalFailure("External request timed out");
    }
    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }
    throw externalFailure("Failed to call external service", error);
  } finally {
    clearTimeout(timeout);
  }
}

