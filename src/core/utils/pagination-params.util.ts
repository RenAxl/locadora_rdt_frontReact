import { Pagination } from "../models/Pagination";

export function buildPaginationParams(
  pagination: Pagination,
  filterKey: string,
  filterValue = "",
): Record<string, string> {
  return {
    [filterKey]: filterValue || "",
    page: String(pagination.page),
    linesPerPage: String(pagination.linesPerPage),
    direction: pagination.direction,
    orderBy: pagination.orderBy,
  };
}
