export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function parsePageParams(searchParams: URLSearchParams, defaultSize = 10) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(5, Number.parseInt(searchParams.get("pageSize") ?? String(defaultSize), 10) || defaultSize),
  );
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  return { page, pageSize, q };
}
