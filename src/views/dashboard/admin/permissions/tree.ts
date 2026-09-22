import type { Permission, PermissionNode } from "./types";

export const typeLabels = { M: "目录", C: "菜单", F: "按钮" };
export function buildTree(items: Permission[]) {
  const map = new Map<number, PermissionNode>(
    items.map((item) => [item.id, { ...item, children: [] }]),
  );
  const roots: PermissionNode[] = [];
  for (const node of map.values()) {
    const parent =
      node.parent_id === null ? undefined : map.get(node.parent_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (nodes: PermissionNode[]) => {
    nodes.sort((a, b) => a.order_num - b.order_num || a.id - b.id);
    nodes.forEach((node) => sort(node.children));
  };
  sort(roots);
  return roots;
}
export function descendantIds(node: PermissionNode): number[] {
  return [node.id, ...node.children.flatMap(descendantIds)];
}
export function flattenTree(
  nodes: PermissionNode[],
  depth = 0,
): { node: PermissionNode; depth: number }[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flattenTree(node.children, depth + 1),
  ]);
}
export function filterTree(
  nodes: PermissionNode[],
  search: string,
  status: string,
): PermissionNode[] {
  const term = search.trim().toLowerCase();
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, search, status);
    const match =
      (!term ||
        `${node.name} ${node.code ?? ""} ${node.path}`
          .toLowerCase()
          .includes(term)) &&
      (status === "all" || node.status === status);
    return match || children.length ? [{ ...node, children }] : [];
  });
}
