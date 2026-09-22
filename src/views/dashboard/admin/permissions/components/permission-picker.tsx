import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLocalAtom } from "@/hooks/use-local-atom";
import {
  buildTree,
  descendantIds,
  filterTree,
  flattenTree,
  typeLabels,
} from "@/views/dashboard/admin/permissions/tree";
import type {
  Permission,
  PermissionNode,
} from "@/views/dashboard/admin/permissions/types";
import type { RecordRow } from "@/views/dashboard/admin/types";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

export function PermissionPicker({
  items,
  selected,
  onChange,
}: {
  items: RecordRow[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [search, setSearch] = useLocalAtom(""),
    [linked, setLinked] = useLocalAtom(true),
    [collapsed, setCollapsed] = useLocalAtom<Set<number>>(new Set());
  const permissions = useMemo<Permission[]>(
    () =>
      items.map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        code: typeof row.code === "string" ? row.code : null,
        description: String(row.description ?? ""),
        parent_id: typeof row.parent_id === "number" ? row.parent_id : null,
        order_num: Number(row.order_num),
        path: String(row.path ?? ""),
        permission_type:
          row.permission_type === "M"
            ? "M"
            : row.permission_type === "C"
              ? "C"
              : "F",
        visible: row.visible === true,
        status: row.status === "disabled" ? "disabled" : "active",
        icon: String(row.icon ?? "#"),
      })),
    [items],
  );
  const tree = useMemo(() => buildTree(permissions), [permissions]);
  const parentById = new Map(
    permissions.map((item) => [item.id, item.parent_id]),
  );
  const selectable = new Set<number>();
  const collect = (nodes: PermissionNode[], active = true) =>
    nodes.forEach((node) => {
      const enabled = active && node.status === "active";
      if (enabled) selectable.add(node.id);
      collect(node.children, enabled);
    });
  collect(tree);
  const selectedSet = new Set(selected);
  const change = (node: PermissionNode, checked: boolean) => {
    const next = new Set(selected);
    const ids = linked ? descendantIds(node) : [node.id];
    ids.forEach((id) => {
      if (checked) {
        if (selectable.has(id)) next.add(id);
      } else next.delete(id);
    });
    if (linked) {
      let parentId = parentById.get(node.id);
      while (parentId !== null && parentId !== undefined) {
        const children = permissions.filter(
          (item) => item.parent_id === parentId && selectable.has(item.id),
        );
        if (children.length && children.every((child) => next.has(child.id)))
          next.add(parentId);
        else next.delete(parentId);
        parentId = parentById.get(parentId);
      }
    }
    onChange([...next]);
  };
  const rows = (
    nodes: PermissionNode[],
    depth = 0,
  ): { node: PermissionNode; depth: number }[] =>
    nodes.flatMap((node) => [
      { node, depth },
      ...(!collapsed.has(node.id) || search
        ? rows(node.children, depth + 1)
        : []),
    ]);
  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 size-4 text-muted-foreground" />
          <Input
            className="border-0 pl-8 shadow-none"
            aria-label="搜索可分配权限"
            placeholder="搜索权限"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...selectable])}
        >
          全选
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([])}
        >
          清空
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b px-3 py-2 text-xs">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={linked}
            onCheckedChange={(checked) => setLinked(checked === true)}
          />
          父子联动
        </label>
        <button
          className="inline-flex items-center gap-1.5"
          type="button"
          onClick={() => setCollapsed(new Set())}
        >
          <ChevronsUpDown className="size-3.5" aria-hidden="true" />
          展开全部
        </button>
        <button
          className="inline-flex items-center gap-1.5"
          type="button"
          onClick={() =>
            setCollapsed(new Set(flattenTree(tree).map(({ node }) => node.id)))
          }
        >
          <ChevronsDownUp className="size-3.5" aria-hidden="true" />
          收起全部
        </button>
      </div>
      <div className="max-h-64 overflow-auto p-2">
        {rows(filterTree(tree, search, "all")).map(({ node, depth }) => {
          const ids = (linked ? descendantIds(node) : [node.id]).filter((id) =>
            selectable.has(id),
          );
          const count = ids.filter((id) => selectedSet.has(id)).length;
          const checked =
            ids.length > 0 && count === ids.length
              ? true
              : count > 0
                ? "indeterminate"
                : selectedSet.has(node.id);
          return (
            <div
              key={node.id}
              className="flex items-center gap-2 rounded-md py-2 pr-2 hover:bg-muted"
              style={{ paddingLeft: depth * 18 }}
            >
              {node.children.length ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-5"
                  aria-label={`展开或收起${node.name}`}
                  onClick={() =>
                    setCollapsed((previous) => {
                      const next = new Set(previous);
                      if (next.has(node.id)) next.delete(node.id);
                      else next.add(node.id);
                      return next;
                    })
                  }
                >
                  {collapsed.has(node.id) ? <ChevronRight /> : <ChevronDown />}
                </Button>
              ) : (
                <span className="w-5" />
              )}
              <Checkbox
                id={`pick-${node.id}`}
                checked={checked}
                disabled={!selectable.has(node.id) && !selectedSet.has(node.id)}
                onCheckedChange={(value) => change(node, value === true)}
              />
              <label
                htmlFor={`pick-${node.id}`}
                className="min-w-0 flex-1 cursor-pointer text-sm"
              >
                {node.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {node.code}
                </span>
              </label>
              <Badge variant="outline" className="text-[10px]">
                {node.status === "disabled"
                  ? "停用"
                  : typeLabels[node.permission_type]}
              </Badge>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">暂无可分配权限</p>
        )}
      </div>
      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
        已选择 {selected.length} 项
      </p>
    </div>
  );
}
