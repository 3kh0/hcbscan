import type { H3Event } from "h3";

interface PaginationMeta {
  page: number;
  per_page: number;
  total?: number;
  has_more?: boolean;
}

export function wrapOk<T>(data: T, meta?: PaginationMeta) {
  return { ok: true as const, data, ...(meta ? { meta } : {}) };
}

export function wrapError(code: string, message: string) {
  return { ok: false as const, error: { code, message } };
}

export function parsePagination(
  event: H3Event,
  defaults: { page?: number; perPage?: number; maxPerPage?: number } = {}
) {
  const q = getQuery(event);
  const { page: dp = 1, perPage: dpp = 50, maxPerPage = 100 } = defaults;
  const page = Math.max(parseInt(String(q.page || dp), 10) || dp, 1);
  const per_page = Math.min(
    Math.max(parseInt(String(q.per_page || dpp), 10) || dpp, 1),
    maxPerPage
  );
  return { page, per_page, offset: (page - 1) * per_page };
}

export function mapOrg(r: any) {
  return {
    id: r["Organization ID"],
    name: r["Name"],
    slug: r["Slug"],
    category: r["Category"],
    balance_cents: Number(r["Balance"]),
    added: r["Added"],
    frozen_at: r["Frozen At"],
  };
}

export function mapActivity(r: any) {
  return {
    id: r["Activity ID"],
    key: r["Key"],
    created_at: r["Created At"],
    user: r["User ID"]
      ? { id: r["User ID"], name: r["User Name"], avatar: r["User Photo"] }
      : null,
    organization: r["Organization ID"]
      ? {
          id: r["Organization ID"],
          name: r["Organization Name"],
          logo: r["Organization Logo"],
        }
      : null,
  };
}

export function paginationMeta(
  page: number,
  per_page: number,
  total: number
): PaginationMeta {
  return {
    page,
    per_page,
    total,
    has_more: (page - 1) * per_page + per_page < total,
  };
}
