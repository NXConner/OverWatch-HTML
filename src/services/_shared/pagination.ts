export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function toPagination(input: PaginationInput): PaginationResult {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 25));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}

