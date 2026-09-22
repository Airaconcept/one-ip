import type { User } from "@/views/login/api";

export type RecordRow = { id: number | string; [key: string]: unknown };
export type PageResult = {
  items: RecordRow[];
  total: number;
  page: number;
  page_size: number;
};
export type ListParams = { page: number; page_size: number; q: string };
export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "password"
    | "multiple";
  required?: boolean;
  readOnly?: (row: RecordRow) => boolean;
  createOnly?: boolean;
  editOnly?: boolean;
  showWhen?: { field: string; values: string[] };
  options?: { value: string; label: string }[];
  lookup?: "roles" | "permissions";
  hint?: string;
};
export type ResourceApi = {
  list: (params: ListParams, signal?: AbortSignal) => Promise<PageResult>;
  save?: (
    id: number | string | undefined,
    body: Record<string, unknown>,
  ) => Promise<unknown>;
  remove?: (id: number | string) => Promise<unknown>;
};
export type ResourceConfig = {
  key: string;
  title: string;
  description: string;
  permission: string;
  writePermission?: string;
  writeSuperOnly?: boolean;
  deleteSuperOnly?: boolean;
  canRemove?: (row: RecordRow) => boolean;
  columns: { key: string; label: string }[];
  fields?: Field[];
  api: ResourceApi;
};
export type PageProps = { user: User };
