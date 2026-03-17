import { Prisma } from "@prisma/client";

export class ServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): ServiceError {
  return new ServiceError(400, "BAD_REQUEST", message, details);
}

export function notFound(message: string, details?: unknown): ServiceError {
  return new ServiceError(404, "NOT_FOUND", message, details);
}

export function conflict(message: string, details?: unknown): ServiceError {
  return new ServiceError(409, "CONFLICT", message, details);
}

export function externalFailure(message: string, details?: unknown): ServiceError {
  return new ServiceError(502, "EXTERNAL_SERVICE_FAILURE", message, details);
}

export function mapPrismaError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return conflict("Unique constraint violation", error.meta);
    }
    if (error.code === "P2025") {
      return notFound("Record not found");
    }
  }
  return new ServiceError(500, "INTERNAL_ERROR", "Unexpected service error");
}

