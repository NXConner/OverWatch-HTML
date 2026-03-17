type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function write(entry: LogEntry): void {
  const payload = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(payload);
    return;
  }
  if (entry.level === "warn") {
    console.warn(payload);
    return;
  }
  console.log(payload);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    write({ level: "info", message, context, timestamp: new Date().toISOString() });
  },
  warn(message: string, context?: Record<string, unknown>): void {
    write({ level: "warn", message, context, timestamp: new Date().toISOString() });
  },
  error(message: string, context?: Record<string, unknown>): void {
    write({ level: "error", message, context, timestamp: new Date().toISOString() });
  }
};
