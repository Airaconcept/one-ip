import { useRef } from "react";
import { AnimatedSegmentedTabs } from "@/components/ui/animated-segmented-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SweepShine } from "@/components/ui/sweep-shine";
import { useLocalAtom } from "@/hooks/use-local-atom";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export function RefreshButton({
  refresh,
  disabled,
  className,
}: {
  refresh: () => Promise<{ isError?: boolean; error?: Error | null } | void>;
  disabled?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useLocalAtom(false);
  const locked = useRef(false);
  async function run() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    let error: unknown;
    try {
      const result = await refresh();
      if (result?.isError) error = result.error ?? new Error("请求失败");
    } catch (reason) {
      error = reason;
    }
    locked.current = false;
    setBusy(false);
    if (error)
      toast.error(
        "刷新失败：" + (error instanceof Error ? error.message : String(error)),
      );
    else toast.success("刷新完成");
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      disabled={disabled || busy}
      aria-label={busy ? "正在刷新" : "刷新列表"}
      title="刷新"
      aria-busy={busy}
      onClick={() => void run()}
    >
      <RefreshCw />
      <SweepShine active={busy || disabled}>刷新</SweepShine>
    </Button>
  );
}

export function StatusFilter({
  value,
  onChange,
  options = [
    { value: "all", label: "全部" },
    { value: "active", label: "启用" },
    { value: "disabled", label: "停用" },
  ],
}: {
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
}) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto">
      <AnimatedSegmentedTabs
        label="状态筛选"
        value={value}
        onValueChange={onChange}
        options={options}
      />
    </div>
  );
}

export function NameFilter({
  value,
  onChange,
  placeholder = "搜索名称或关键字",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-52">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={placeholder}
        placeholder={placeholder}
        className="pl-8"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
