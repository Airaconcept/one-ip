import { useMemo } from "react";
import { can } from "@/views/login/api";
import {
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { savePermission, listTree, changeStatus, reorder, remove } from "./api";
import {
  hidingAtom,
  hiddenColumnsAtom,
  confirmationAtom,
  editorAtom,
  expandedAtom,
  statusAtom,
  searchAtom,
} from "./store";
import { buildTree, filterTree, flattenTree } from "./tree";
import type { Permission, PermissionNode } from "./types";
import type { PageProps } from "../types";

export function usePermissions({ user }: PageProps) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["permissions", "tree"],
    queryFn: ({ signal }) => listTree(signal),
  });
  const [search, setSearch] = useAtom(searchAtom),
    [status, setStatus] = useAtom(statusAtom),
    [expanded, setExpanded] = useAtom(expandedAtom);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [editor, setEditor] = useAtom(editorAtom);
  const [confirmation, setConfirmation] = useAtom(confirmationAtom);
  const [hiddenColumns, setHiddenColumns] = useAtom(hiddenColumnsAtom);
  const optionalColumns = ["类型", "权限标识", "路由地址", "显示", "状态"];
  const hiddenColumnClasses: Record<string, string> = {
    类型: "[&_tr>*:nth-child(3)]:hidden",
    权限标识: "[&_tr>*:nth-child(4)]:hidden",
    路由地址: "[&_tr>*:nth-child(5)]:hidden",
    显示: "[&_tr>*:nth-child(6)]:hidden",
    状态: "[&_tr>*:nth-child(7)]:hidden",
  };
  const tree = useMemo(() => buildTree(query.data ?? []), [query.data]);
  const filtered = useMemo(
    () => filterTree(tree, search, status),
    [tree, search, status],
  );
  const allExpanded = flattenTree(tree)
    .filter(({ node }) => node.children.length > 0)
    .every(({ node }) => expanded.has(node.id));
  const filterActive = Boolean(search) || status !== "all";
  const visible = (
    nodes: PermissionNode[],
    depth = 0,
  ): { node: PermissionNode; depth: number }[] =>
    nodes.flatMap((node) => [
      { node, depth },
      ...(filterActive || expanded.has(node.id)
        ? visible(node.children, depth + 1)
        : []),
    ]);
  const data = visible(filtered);
  // oxlint-disable-next-line react/incompatible-library -- TanStack v8 owns a mutable table instance; keep this call outside compiler memoization.
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    data,
    columns: [],
    getRowId: (row) => String(row.node.id),
  });
  const rows = table.getRowModel().rows.map((row) => row.original);
  const writable = can(user, "*");
  const visibleIds = rows.map(({ node }) => node.id);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["menu"] });
    void client.invalidateQueries({ queryKey: ["permissions"] });
    void client.invalidateQueries({ queryKey: ["options"] });
    void client.invalidateQueries({ queryKey: ["session"] });
    void client.invalidateQueries({ queryKey: ["dashboard"] });
    void client.invalidateQueries({ queryKey: ["roles"] });
  };
  const [hiding, setHiding] = useAtom(hidingAtom);
  const visibilityMutation = useMutation({
    mutationFn: ({ item, visible }: { item: Permission; visible: boolean }) =>
      savePermission(item.id, {
        name: item.name,
        code: item.code,
        description: item.description,
        parent_id: item.parent_id,
        order_num: item.order_num,
        path: item.path,
        permission_type: item.permission_type,
        status: item.status,
        icon: item.icon,
        visible,
      }),
    onSuccess: () => {
      setHiding(null);
      refresh();
      toast.success("显示状态已更新");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const enableMutation = useMutation({
    mutationFn: (item: Permission) => changeStatus(item.id, "active"),
    onSuccess: () => {
      refresh();
      toast.success("权限已启用");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const mutation = useMutation({
    mutationFn: () =>
      confirmation!.kind === "delete"
        ? remove(confirmation!.item.id)
        : changeStatus(confirmation!.item.id, confirmation!.status!),
    onSuccess: () => {
      setConfirmation(null);
      toast.success("权限已更新");
      refresh();
    },
  });
  const sorting = useMutation({
    mutationFn: ({ parent, ids }: { parent: number | null; ids: number[] }) =>
      reorder(parent, ids),
    onMutate: async ({ parent, ids }) => {
      await client.cancelQueries({ queryKey: ["permissions", "tree"] });
      const previous = client.getQueryData<Permission[]>([
        "permissions",
        "tree",
      ]);
      client.setQueryData<Permission[]>(["permissions", "tree"], (items) =>
        items?.map((item) =>
          item.parent_id === parent
            ? { ...item, order_num: ids.indexOf(item.id) }
            : item,
        ),
      );
      return { previous };
    },
    onError: (error: Error, _, context) => {
      if (context?.previous)
        client.setQueryData(["permissions", "tree"], context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("排序已保存"),
    onSettled: refresh,
  });
  const dragEnabled = writable && !filterActive && !sorting.isPending;
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!dragEnabled || !over || active.id === over.id) return;
    const source = query.data?.find((item) => item.id === active.id),
      target = query.data?.find((item) => item.id === over.id);
    if (!source || !target) return;
    if (source.parent_id !== target.parent_id) {
      toast.error("权限只能在同一个上级权限下拖动排序");
      return;
    }
    const siblings = (query.data ?? [])
      .filter((item) => item.parent_id === source.parent_id)
      .sort((a, b) => a.order_num - b.order_num || a.id - b.id);
    const ids = arrayMove(
      siblings,
      siblings.findIndex((item) => item.id === source.id),
      siblings.findIndex((item) => item.id === target.id),
    ).map((item) => item.id);
    sorting.mutate({ parent: source.parent_id, ids });
  };

  return {
    query,
    search,
    setSearch,
    status,
    setStatus,
    expanded,
    setExpanded,
    sensors,
    editor,
    setEditor,
    confirmation,
    setConfirmation,
    hiddenColumns,
    setHiddenColumns,
    optionalColumns,
    hiddenColumnClasses,
    tree,
    allExpanded,
    filterActive,
    visible,
    rows,
    writable,
    visibleIds,
    refresh,
    hiding,
    setHiding,
    visibilityMutation,
    enableMutation,
    mutation,
    dragEnabled,
    onDragEnd,
  };
}
