import { request } from "@/lib/http";
import { isBuiltinPermission } from "./constants";
import type { ListParams, PageResult } from "../types";

export const listPermissions = async (
  params: ListParams,
  signal?: AbortSignal,
): Promise<PageResult> => {
  const page = await request<PageResult>(
    `/api/admin/permissions?${new URLSearchParams({ page: String(params.page), page_size: String(params.page_size), q: params.q })}`,
    { signal },
  );
  return {
    ...page,
    items: page.items.map((row) => ({
      ...row,
      is_builtin: isBuiltinPermission(row.code),
    })),
  };
};

export const save = (
  id: number | string | undefined,
  body: Record<string, unknown>,
) =>
  request(`/api/admin/permissions${id === undefined ? "" : `/${id}`}`, {
    method: id === undefined ? "POST" : "PUT",
    body: JSON.stringify(body),
  });
export const remove = (id: number | string) =>
  request(`/api/admin/permissions/${id}`, { method: "DELETE" });

export async function listTree(signal?: AbortSignal) {
  const rows: import("./types").Permission[] = [];
  for (let page = 1; ; page++) {
    const result = await request<{
      items: import("./types").Permission[];
      total: number;
    }>(`/api/admin/permissions?page=${page}&page_size=100`, { signal });
    rows.push(...result.items);
    if (!result.items.length || rows.length >= result.total) return rows;
  }
}
export const savePermission = (
  id: number | undefined,
  input: import("./types").PermissionInput,
) => save(id, input);
export const changeStatus = (id: number, status: "active" | "disabled") =>
  request(`/api/admin/permissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const reorder = (parent_id: number | null, ids: number[]) =>
  request("/api/admin/permissions/reorder", {
    method: "PUT",
    body: JSON.stringify({ parent_id, ids }),
  });
