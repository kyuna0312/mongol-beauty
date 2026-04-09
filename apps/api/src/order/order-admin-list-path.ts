import { OrderStatus } from './order.entity';

/** Canonical path (including query) for GET /internal/orders/admin — must match gateway signing. */
export function buildAdminOrdersListPath(query: {
  limit: number;
  offset: number;
  status?: OrderStatus;
}): string {
  const parts: [string, string][] = [
    ['limit', String(query.limit)],
    ['offset', String(query.offset)],
  ];
  if (query.status) {
    parts.push(['status', String(query.status)]);
  }
  parts.sort((a, b) => a[0].localeCompare(b[0]));
  return `/internal/orders/admin?${new URLSearchParams(parts).toString()}`;
}
