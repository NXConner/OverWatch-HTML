import { createServer } from "node:http";
import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "../lib/prisma";

const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info("Backend server started", {
    port: env.PORT,
    nodeEnv: env.NODE_ENV
  });
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.warn("Shutdown signal received", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server shutdown complete");
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
