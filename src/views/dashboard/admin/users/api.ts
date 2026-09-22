import { request } from "@/lib/http";
import type { ListParams, PageResult } from "../types";

export const listUsers = (params: ListParams, signal?: AbortSignal) =>
  request<PageResult>(
    `/api/admin/users?${new URLSearchParams({ page: String(params.page), page_size: String(params.page_size), q: params.q })}`,
    { signal },
  );
export const save = (
  id: number | string | undefined,
  body: Record<string, unknown>,
) =>
  request(`/api/admin/users${id === undefined ? "" : `/${id}`}`, {
    method: id === undefined ? "POST" : "PUT",
    body: JSON.stringify(body),
  });
