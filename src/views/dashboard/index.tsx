import { Link, Outlet, useSearchParams } from "react-router-dom";
import { BuildInfo } from "@/components/build-info";
import { Button } from "@/components/ui/button";
import { SweepShine } from "@/components/ui/sweep-shine";
import { UnderlineHover } from "@/components/underline-hover";
import { useTheme } from "@/hooks/use-theme";
import { routes } from "@/lib/navigation";
import { can, logout, type User } from "@/views/login/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { getMenu } from "./api";
import { mobileMenuOpenAtom } from "./store";

export default function Dashboard({ user }: { user: User }) {
  const [params] = useSearchParams();
  const [open, setOpen] = useAtom(mobileMenuOpenAtom);
  const { resolvedTheme, setTheme } = useTheme();
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => window.location.replace("/"),
    onError: (error) => toast.error(error.message),
  });
  const menu = useQuery({ queryKey: ["menu", user.id], queryFn: getMenu });
  const visible = routes.filter(
    ({ config }) =>
      can(user, config.permission) &&
      menu.data?.items.some((item) => item.code === config.permission),
  );
  return (
    <div className="flex h-svh min-w-0 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="切换导航"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </Button>
        <UnderlineHover asChild className="mr-auto">
          <Link to="/" className="font-semibold">
            One IP
          </Link>
        </UnderlineHover>
        <span className="max-w-32 truncate text-sm text-muted-foreground">
          {user.name || user.sub}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="切换主题"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Button
          variant="ghost"
          className="min-w-20"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <LogOut />
          {mutation.isPending ? <SweepShine>退出中</SweepShine> : "退出"}
        </Button>
      </header>
      <div className="relative flex min-h-0 flex-1">
        {open && (
          <button
            className="absolute inset-0 z-10 bg-background/80 md:hidden"
            aria-label="关闭导航"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          className={`${open ? "flex" : "hidden"} absolute inset-y-0 left-0 z-20 w-52 shrink-0 flex-col border-r bg-sidebar px-2 py-3 md:static md:flex`}
        >
          <nav aria-label="主导航" className="flex-1 overflow-y-auto">
            {menu.isPending && (
              <p role="status" className="p-3 text-sm">
                <SweepShine>加载菜单…</SweepShine>
              </p>
            )}
            {menu.isError && (
              <div role="alert" className="p-3 text-sm">
                <p>{menu.error.message}</p>
                <Button
                  disabled={menu.isFetching}
                  onClick={() => void menu.refetch()}
                >
                  重试
                </Button>
              </div>
            )}
            {["系统管理", "系统日志"].map((group) => (
              <section key={group} className="mb-4">
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  {group}
                </p>
                {visible
                  .filter((route) => route.group === group)
                  .map(({ config, icon: Icon }) => (
                    <Button
                      key={config.key}
                      asChild
                      variant={
                        params.get("section") === config.key
                          ? "secondary"
                          : "ghost"
                      }
                      className="mb-1 w-full justify-start"
                    >
                      <Link
                        to={`/dashboard/admin?section=${config.key}`}
                        onClick={() => setOpen(false)}
                        aria-current={
                          params.get("section") === config.key
                            ? "page"
                            : undefined
                        }
                      >
                        <Icon />
                        {config.title}
                      </Link>
                    </Button>
                  ))}
              </section>
            ))}
          </nav>
          <BuildInfo />
        </aside>
        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet context={user} />
        </main>
      </div>
    </div>
  );
}
