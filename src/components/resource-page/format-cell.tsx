import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/relative-time";

export const labels: Record<string, string> = {
  active: "启用",
  disabled: "停用",
  succeeded: "成功",
  success: "成功",
  failed: "失败",
  failure: "失败",
  denied: "拒绝",
  revoked: "已撤销",
  error: "异常",
};
export function formatCell(key: string, value: unknown) {
  if (value === null || value === undefined || value === "")
    return <span className="text-muted-foreground">—</span>;
  if (key === "status")
    return (
      <Badge
        variant="secondary"
        className={
          String(value) === "failure" || String(value) === "disabled"
            ? "text-destructive"
            : ""
        }
      >
        {labels[String(value)] ?? String(value)}
      </Badge>
    );
  if (key.endsWith("_at"))
    return (
      <span className="tabular-nums text-muted-foreground">
        {formatRelativeTime(String(value))}
      </span>
    );
  if (typeof value === "boolean")
    return <Badge variant="outline">{value ? "是" : "否"}</Badge>;
  if (Array.isArray(value))
    return value.length ? (
      <div className="flex max-w-96 flex-wrap gap-1">
        {value.map((entry, index) => (
          <Badge
            key={String(entry?.id ?? entry?.code ?? index)}
            variant={
              entry?.code === "super_admin" || entry?.code === "*"
                ? "default"
                : "secondary"
            }
            title={
              typeof entry === "object" ? String(entry.code ?? "") : undefined
            }
          >
            {typeof entry === "object"
              ? String(entry.name ?? entry.code ?? entry.id)
              : String(entry)}
          </Badge>
        ))}
      </div>
    ) : (
      <span className="text-muted-foreground">未分配</span>
    );
  return (
    <span className="block max-w-72 truncate" title={String(value)}>
      {String(value)}
    </span>
  );
}
