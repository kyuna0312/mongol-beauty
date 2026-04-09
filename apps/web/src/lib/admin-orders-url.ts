/** Build `/admin/orders` URL with optional `page` and `status` query (page 1 omitted). */
export function ordersListUrl(opts: { page?: number; status?: string | null }): string {
  const p = new URLSearchParams();
  if (opts.page && opts.page > 1) p.set('page', String(opts.page));
  if (opts.status) p.set('status', opts.status);
  const q = p.toString();
  return q ? `/admin/orders?${q}` : '/admin/orders';
}
