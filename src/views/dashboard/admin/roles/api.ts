import { request } from "@/lib/http";
import type { ListParams, PageResult } from "../types";

export const listRoles = (params: ListParams, signal?: AbortSignal) =>
  request<PageResult>(
    `/api/admin/roles?${new URLSearchParams({ page: String(params.page), page_size: String(params.page_size), q: params.q })}`,
    { signal },
  );
export const save = (
  id: number | string | undefined,
  body: Record<string, unknown>,
) =>
  request(`/api/admin/roles${id === undefined ? "" : `/${id}`}`, {
    method: id === undefined ? "POST" : "PUT",
    body: JSON.stringify(body),
  });
export const remove = (id: number | string) =>
  request(`/api/admin/roles/${id}`, { method: "DELETE" });

export async function listAllRoles(signal?: AbortSignal) {
  const items: import("./types").Role[] = [];
  for (let page = 1; ; page++) {
    const result = await request<{
      items: import("./types").Role[];
      total: number;
    }>(`/api/admin/roles?page=${page}&page_size=100`, { signal });
    items.push(...result.items);
    if (!result.items.length || items.length >= result.total) return items;
  }
}
export const saveRole = (
  id: number | undefined,
  input: import("./types").RoleInput,
) => save(id, input);
export const setRoleStatus = (id: number, status: "active" | "disabled") =>
  request(`/api/admin/roles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const assignPermissions = (id: number, permission_ids: number[]) =>
  request(`/api/admin/roles/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permission_ids }),
  });
