import { useMemo } from "react";
import { can } from "@/views/login/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { listAllRoles, remove, setRoleStatus } from "./api";
import {
  hiddenColumnsAtom,
  errorAtom,
  confirmationAtom,
  permissionRoleAtom,
  editorAtom,
  selectedAtom,
  pageSizeAtom,
  pageAtom,
  statusAtom,
  searchAtom,
} from "./store";
import type { Role } from "./types";
import type { PageProps } from "../types";

export function useRoles({ user }: PageProps) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["roles", "list"],
    queryFn: ({ signal }) => listAllRoles(signal),
  });
  const [search, setSearch] = useAtom(searchAtom),
    [status, setStatus] = useAtom(statusAtom),
    [page, setPage] = useAtom(pageAtom),
    [pageSize, setPageSize] = useAtom(pageSizeAtom);
  const [selected, setSelected] = useAtom(selectedAtom);
  const [editor, setEditor] = useAtom(editorAtom),
    [permissionRole, setPermissionRole] = useAtom(permissionRoleAtom);
  const [confirmation, setConfirmation] = useAtom(confirmationAtom);
  const [error, setError] = useAtom(errorAtom);
  const canWrite = can(user, "roles:write"),
    canAssign = canWrite && can(user, "permissions:read"),
    canDelete = canWrite && can(user, "*");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? [])
      .filter(
        (role) =>
          (status === "all" || role.status === status) &&
          (!term ||
            `${role.name} ${role.code} ${role.description}`
              .toLowerCase()
              .includes(term)),
      )
      .sort((a, b) => a.role_sort - b.role_sort || a.id - b.id);
  }, [query.data, search, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    currentPage = Math.min(page, pages),
    data = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // oxlint-disable-next-line react/incompatible-library -- TanStack v8 owns a mutable table instance; keep this call outside compiler memoization.
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    data,
    columns: [],
    getRowId: (row) => String(row.id),
  });
  const rows = table.getRowModel().rows.map((row) => row.original);
  const selectable = rows.filter((role) => !role.is_system),
    selectedVisible = selectable.filter((role) => selected.has(role.id)).length;
  const selectedRows = (query.data ?? []).filter(
    (role) => selected.has(role.id) && !role.is_system,
  );
  const [hiddenColumns, setHiddenColumns] = useAtom(hiddenColumnsAtom);
  const optionalColumns = ["权限标识", "权限", "状态"];
  const columnClasses: Record<string, string> = {
    权限标识: "[&_tr>*:nth-child(3)]:hidden",
    权限: "[&_tr>*:nth-child(4)]:hidden",
    状态: "[&_tr>*:nth-child(5)]:hidden",
  };
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["roles"] });
    void client.invalidateQueries({ queryKey: ["options"] });
    void client.invalidateQueries({ queryKey: ["session"] });
    void client.invalidateQueries({ queryKey: ["users"] });
    void client.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const enable = useMutation({
    mutationFn: (role: Role) => setRoleStatus(role.id, "active"),
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const action = confirmation!;
      const results = await Promise.allSettled(
        action.items.map((role) =>
          action.kind === "delete"
            ? remove(role.id)
            : setRoleStatus(role.id, action.status!),
        ),
      );
      const failed = action.items.filter(
        (_, index) => results[index]?.status === "rejected",
      );
      refresh();
      if (failed.length) {
        const rejected = results.find((result) => result.status === "rejected");
        setError(
          `${action.items.length - failed.length} 项已完成，${failed.length} 项失败。${rejected?.status === "rejected" && rejected.reason instanceof Error ? rejected.reason.message : ""}`,
        );
        setConfirmation({ ...action, items: failed });
        setSelected(new Set(failed.map((role) => role.id)));
      } else {
        setConfirmation(null);
        setSelected((previous) => {
          const next = new Set(previous);
          action.items.forEach((role) => next.delete(role.id));
          return next;
        });
        toast.success(
          action.kind === "delete" ? "角色已删除" : "角色状态已更新",
        );
      }
    },
  });
  const confirm = (action: NonNullable<typeof confirmation>) => {
    setError("");
    setConfirmation(action);
  };

  return {
    query,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    pageSize,
    setPageSize,
    selected,
    setSelected,
    editor,
    setEditor,
    permissionRole,
    setPermissionRole,
    confirmation,
    setConfirmation,
    error,
    canWrite,
    canAssign,
    canDelete,
    filtered,
    currentPage,
    rows,
    selectable,
    selectedVisible,
    selectedRows,
    hiddenColumns,
    setHiddenColumns,
    optionalColumns,
    columnClasses,
    refresh,
    enable,
    mutation,
    confirm,
  };
}
