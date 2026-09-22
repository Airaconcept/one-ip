import { request } from "@/lib/http";
import type { ListParams, PageResult } from "../types";

export const listOperationLogs = (params: ListParams, signal?: AbortSignal) =>
  request<PageResult>(
    `/api/admin/operation-logs?${new URLSearchParams({ page: String(params.page), page_size: String(params.page_size), q: params.q })}`,
    { signal },
  );
