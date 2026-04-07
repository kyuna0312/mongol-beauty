/**
 * Full-route loading UI for React.lazy + Suspense (production-ready, branded).
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16">
      <div
        className="h-12 w-12 animate-spin rounded-full border-2 border-rose-100 border-t-primary-500"
        role="status"
        aria-label="Ачаалж байна"
      />
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-stone-700">Ачаалж байна</p>
        <p className="mt-1 text-xs text-stone-500">Түр хүлээнэ үү</p>
      </div>
    </div>
  );
}
