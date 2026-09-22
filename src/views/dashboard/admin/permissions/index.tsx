import { RefreshButton, StatusFilter } from "@/components/list-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SweepShine } from "@/components/ui/sweep-shine";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { findMenuIconOption } from "@/lib/menu-icons";
import { PageDialogs } from "@/views/dashboard/admin/permissions/components/page-dialogs";
import { SortablePermissionRow } from "@/views/dashboard/admin/permissions/components/sortable-row";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Provider } from "jotai";
import {
  Plus,
  Search,
  ChevronsDownUp,
  ChevronsUpDown,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Folder,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { isBuiltinPermission } from "./constants";
import { flattenTree, typeLabels } from "./tree";
import { usePermissions } from "./use-permissions";
import type { PageProps } from "../types";

function Content(props: PageProps) {
  const state = usePermissions(props);
  const {
    query,
    search,
    setSearch,
    status,
    setStatus,
    expanded,
    setExpanded,
    sensors,
    setEditor,
    setConfirmation,
    hiddenColumns,
    setHiddenColumns,
    optionalColumns,
    hiddenColumnClasses,
    tree,
    allExpanded,
    filterActive,
    rows,
    writable,
    visibleIds,
    setHiding,
    visibilityMutation,
    enableMutation,
    mutation,
    dragEnabled,
    onDragEnd,
  } = state;
  return (
    <section className="commercial-list flex min-h-0 flex-1 flex-col bg-background">
      <header className="sr-only">
        <div>
          <h1 className="text-xl font-semibold">权限管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            维护目录、菜单和按钮权限，配置层级、状态与访问范围。
          </p>
        </div>
      </header>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 lg:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <StatusFilter value={status} onChange={setStatus} />
          <div className="relative w-full max-w-sm sm:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              aria-label="搜索权限"
              placeholder="搜索权限"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {writable && (
            <Button
              size="sm"
              onClick={() => setEditor({ editing: null, parent: null })}
            >
              <Plus />
              新增
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={filterActive}
            onClick={() => {
              const parents = flattenTree(tree)
                .filter(({ node }) => node.children.length > 0)
                .map(({ node }) => node.id);
              setExpanded(
                parents.every((id) => expanded.has(id))
                  ? new Set()
                  : new Set(parents),
              );
            }}
          >
            {allExpanded ? (
              <ChevronsDownUp aria-hidden="true" />
            ) : (
              <ChevronsUpDown aria-hidden="true" />
            )}
            {allExpanded ? "全部收起" : "全部展开"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <SlidersHorizontal />列<ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {optionalColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={!hiddenColumns.includes(column)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    setHiddenColumns((previous) =>
                      checked
                        ? previous.filter((item) => item !== column)
                        : [...previous, column],
                    )
                  }
                >
                  {column}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <RefreshButton
            disabled={query.isFetching}
            refresh={() => query.refetch()}
          />
        </div>
      </div>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        collisionDetection={(args) =>
          closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                query.data?.find((item) => item.id === container.id)
                  ?.parent_id ===
                query.data?.find((item) => item.id === args.active.id)
                  ?.parent_id,
            ),
          })
        }
        onDragEnd={onDragEnd}
      >
        <div className="commercial-table min-h-0 overflow-auto">
          <Table
            className={[
              "[&_td]:h-10 [&_td]:px-2.5 [&_td]:py-1.5 [&_th]:h-9 [&_th]:px-2.5",
              ...hiddenColumns.map((column) => hiddenColumnClasses[column]),
            ].join(" ")}
          >
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-9">
                  <span className="sr-only">拖动排序</span>
                </TableHead>

                {[
                  "权限名称",
                  "类型",
                  "权限标识",
                  "路由地址",
                  "显示",
                  "状态",
                  "操作",
                ].map((label) => (
                  <TableHead
                    key={label}
                    className={
                      label === "操作"
                        ? "sticky right-0 z-20 w-16 border-l bg-muted text-right whitespace-nowrap"
                        : "whitespace-nowrap"
                    }
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <SortableContext
              items={visibleIds}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {query.isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={8 - hiddenColumns.length}
                      className="h-40 text-center text-muted-foreground"
                    >
                      <SweepShine>正在加载权限…</SweepShine>
                    </TableCell>
                  </TableRow>
                ) : query.isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8 - hiddenColumns.length}
                      className="h-40 text-center text-destructive"
                      role="alert"
                    >
                      {query.error.message}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8 - hiddenColumns.length}
                      className="h-40 text-center text-muted-foreground"
                    >
                      暂无匹配权限
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map(({ node, depth }) => {
                    const Icon =
                      node.permission_type === "F"
                        ? null
                        : (findMenuIconOption(node.icon)?.Icon ??
                          (node.permission_type === "M" ? Folder : FileText));
                    return (
                      <SortablePermissionRow
                        key={node.id}
                        id={node.id}
                        name={node.name}
                        disabled={!dragEnabled}
                      >
                        <TableCell className="h-10">
                          <div
                            className="flex min-w-48 items-center gap-2"
                            style={{ paddingLeft: depth * 20 }}
                          >
                            {node.children.length > 0 ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                aria-label={`${expanded.has(node.id) ? "收起" : "展开"}${node.name}`}
                                onClick={() =>
                                  setExpanded((previous) => {
                                    const next = new Set(previous);
                                    if (next.has(node.id)) next.delete(node.id);
                                    else next.add(node.id);
                                    return next;
                                  })
                                }
                              >
                                {filterActive || expanded.has(node.id) ? (
                                  <ChevronDown />
                                ) : (
                                  <ChevronRight />
                                )}
                              </Button>
                            ) : (
                              <span className="w-6" />
                            )}
                            {Icon && (
                              <Icon
                                aria-hidden="true"
                                className="size-4 shrink-0 text-muted-foreground"
                              />
                            )}
                            {writable ? (
                              <button
                                type="button"
                                className="cursor-pointer whitespace-nowrap text-left font-medium"
                                onClick={() =>
                                  setEditor({ editing: node, parent: null })
                                }
                              >
                                {node.name}
                              </button>
                            ) : (
                              <span className="whitespace-nowrap font-medium">
                                {node.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[node.permission_type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {node.code ?? "—"}
                        </TableCell>
                        <TableCell
                          className="max-w-56 truncate text-xs text-muted-foreground"
                          title={node.path}
                        >
                          {node.path || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Switch
                            aria-label={`${node.name}显示`}
                            checked={node.visible}
                            disabled={
                              !writable ||
                              node.permission_type === "F" ||
                              visibilityMutation.isPending
                            }
                            onCheckedChange={(visible) => {
                              visibilityMutation.reset();
                              if (visible)
                                visibilityMutation.mutate({
                                  item: node,
                                  visible: true,
                                });
                              else setHiding(node);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            aria-label={`${node.name}启用状态`}
                            checked={node.status === "active"}
                            disabled={
                              !writable ||
                              mutation.isPending ||
                              enableMutation.isPending
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                enableMutation.mutate(node);
                                return;
                              }
                              mutation.reset();
                              setConfirmation({
                                kind: "status",
                                item: node,
                                status: checked ? "active" : "disabled",
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="sticky right-0 z-10 border-l bg-background text-right">
                          {writable && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`${node.name}操作`}
                                  className="size-7"
                                >
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {node.permission_type !== "F" && (
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setEditor({ editing: null, parent: node })
                                    }
                                  >
                                    <Plus />
                                    新增子权限
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setEditor({ editing: node, parent: null })
                                  }
                                >
                                  <Pencil />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={
                                    isBuiltinPermission(node.code) ||
                                    node.children.length > 0
                                  }
                                  className="text-destructive"
                                  onSelect={() => {
                                    mutation.reset();
                                    setConfirmation({
                                      kind: "delete",
                                      item: node,
                                    });
                                  }}
                                >
                                  <Trash2 />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </SortablePermissionRow>
                    );
                  })
                )}
              </TableBody>
            </SortableContext>
          </Table>
        </div>
      </DndContext>
      {filterActive && (
        <p className="text-xs text-muted-foreground">
          清除搜索和状态筛选后可拖动排序；仅支持同级排序。
        </p>
      )}

      <PageDialogs state={state} />
    </section>
  );
}
export default function Page(props: PageProps) {
  return (
    <Provider>
      <Content {...props} />
    </Provider>
  );
}
