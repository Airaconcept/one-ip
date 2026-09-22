import { Button } from "@/components/ui/button";
import pkg from "../../../package.json";

export default function Login() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-muted px-4 py-10">
      <section
        aria-labelledby="login-title"
        className="flex min-h-72 w-full max-w-md flex-col rounded-2xl bg-card p-6 text-left text-card-foreground sm:p-7"
      >
        <div className="flex items-center gap-3">
          <img
            src="/icon.svg"
            width="48"
            height="48"
            className="size-12 shrink-0"
            alt=""
          />
          <div>
            <h1
              id="login-title"
              className="text-xl font-semibold tracking-tight"
            >
              One IP
            </h1>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              v{pkg.version}
            </p>
          </div>
        </div>
        <div className="mt-9 mb-6 space-y-2">
          <p className="text-base font-medium">看清网络，管理你的诊断工作。</p>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            使用 One User 账号登录，访问应用与管理功能。
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-auto h-11 min-w-32 self-end rounded-md px-5"
        >
          <a href="/api/auth/oidc/start">现在开始</a>
        </Button>
      </section>
    </main>
  );
}
