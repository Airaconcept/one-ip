import { StatusFilter } from "@/components/list-controls";
import { TablePagination } from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { PageDialogs } from "@/views/dashboard/admin/roles/components/page-dialogs";
import { Provider } from "jotai";
import {
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  KeyRound,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRoles } from "./use-roles";
import type { PageProps } from "../types";

function Content(props: PageProps) {
  const state = useRoles(props);
  const {
    query,
    search,
    setSearch,
    status,
    setStatus,
    setPage,
    pageSize,
    setPageSize,
    selected,
    setSelected,
    setEditor,
    setPermissionRole,
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
    enable,
    mutation,
    confirm,
  } = state;
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="sr-only">
        <div>
          <h1 className="text-xl font-semibold">角色管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理角色、启停状态与目录、菜单和按钮权限。
          </p>
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-3 lg:px-4">
        <StatusFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <div className="relative">
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            className="w-full sm:w-80 pl-8"
            placeholder="搜索角色"
            aria-label="搜索角色"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {canAssign && (
            <Button size="sm" onClick={() => setEditor({ role: null })}>
              <Plus />
              新增
            </Button>
          )}
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
                  onSelect={(e) => e.preventDefault()}
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
          <Button
            size="sm"
            variant="outline"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw />
            <SweepShine active={query.isFetching}>刷新</SweepShine>
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <Table
          className={[
            "min-w-[800px] table-fixed [&_td]:px-2 [&_td]:py-2 [&_th]:h-10 [&_th]:px-2",
            ...hiddenColumns.map((column) => columnClasses[column]),
          ].join(" ")}
        >
          <colgroup>
            <col style={{ width: 40 }} />
            <col />
            {!hiddenColumns.includes("权限标识") && (
              <col style={{ width: "25%" }} />
            )}
            {!hiddenColumns.includes("权限") && <col style={{ width: 80 }} />}
            {!hiddenColumns.includes("状态") && <col style={{ width: 112 }} />}
            <col style={{ width: 80 }} />
          </colgroup>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="选择本页角色"
                  checked={
                    selectable.length > 0 &&
                    selectedVisible === selectable.length
                      ? true
                      : selectedVisible > 0
                        ? "indeterminate"
                        : false
                  }
                  disabled={!selectable.length}
                  onCheckedChange={(checked) =>
                    setSelected((previous) => {
                      const next = new Set(previous);
                      selectable.forEach((role) =>
                        checked === true
                          ? next.add(role.id)
                          : next.delete(role.id),
                      );
                      return next;
                    })
                  }
                />
              </TableHead>
              {["角色名称", "权限标识", "权限", "状态", "操作"].map((label) => (
                <TableHead
                  key={label}
                  className={
                    label === "操作"
                      ? "sticky right-0 z-20 border-l bg-muted text-right"
                      : "whitespace-nowrap"
                  }
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-muted-foreground"
                  role="status"
                >
                  <SweepShine>正在加载角色…</SweepShine>
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-destructive"
                  role="alert"
                >
                  {query.error.message}
                </TableCell>
              </TableRow>
            ) : !rows.length ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-muted-foreground"
                >
                  暂无匹配角色
                </TableCell>
              </TableRow>
            ) : (
              rows.map((role) => (
                <TableRow
                  key={role.id}
                  data-state={selected.has(role.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`选择${role.name}`}
                      disabled={role.is_system}
                      checked={selected.has(role.id)}
                      onCheckedChange={(checked) =>
                        setSelected((previous) => {
                          const next = new Set(previous);
                          if (checked === true) next.add(role.id);
                          else next.delete(role.id);
                          return next;
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="h-10 whitespace-nowrap">
                    {canWrite && !role.is_system ? (
                      <button
                        type="button"
                        className="cursor-pointer font-medium"
                        onClick={() => setEditor({ role })}
                      >
                        {role.name}
                      </button>
                    ) : (
                      <span className="font-medium">{role.name}</span>
                    )}
                    {role.description && (
                      <p
                        className="max-w-72 truncate text-xs text-muted-foreground"
                        title={role.description}
                      >
                        {role.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {role.code}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {role.permission_ids.length} 项
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        aria-label={`${role.name}角色状态`}
                        checked={role.status === "active"}
                        disabled={
                          !canWrite ||
                          role.is_system ||
                          mutation.isPending ||
                          enable.isPending
                        }
                        size="sm"
                        onCheckedChange={(checked) =>
                          checked
                            ? enable.mutate(role)
                            : confirm({
                                kind: "status",
                                items: [role],
                                status: checked ? "active" : "disabled",
                              })
                        }
                      />
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {role.status === "active" ? "启用" : "停用"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 border-l bg-background text-right">
                    {(canWrite || canAssign) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={`${role.name}角色操作`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {canAssign && (
                            <DropdownMenuItem
                              onSelect={() => setPermissionRole(role)}
                            >
                              <KeyRound />
                              {role.is_system ? "查看权限" : "配置权限"}
                            </DropdownMenuItem>
                          )}
                          {canWrite && !role.is_system && (
                            <DropdownMenuItem
                              onSelect={() => setEditor({ role })}
                            >
                              <Pencil />
                              编辑
                            </DropdownMenuItem>
                          )}
                          {canDelete && !role.is_system && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() =>
                                  confirm({ kind: "delete", items: [role] })
                                }
                              >
                                <Trash2 />
                                删除
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        total={filtered.length}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      {selectedRows.length > 0 && (
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3 shadow-sm">
          <span className="mr-auto text-sm">
            已选择 {selectedRows.length} 个角色
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            取消选择
          </Button>
          {canWrite && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  confirm({
                    kind: "status",
                    items: selectedRows,
                    status: "active",
                  })
                }
              >
                批量启用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  confirm({
                    kind: "status",
                    items: selectedRows,
                    status: "disabled",
                  })
                }
              >
                批量停用
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirm({ kind: "delete", items: selectedRows })}
            >
              <Trash2 />
              批量删除
            </Button>
          )}
        </div>
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
