import { Navigate, useSearchParams, useOutletContext } from "react-router-dom";
import { routes } from "@/lib/navigation";
import { can, type User } from "@/views/login/api";

export default function Admin() {
  const user = useOutletContext<User>();
  const [params] = useSearchParams();
  const section = params.get("section");
  const route = routes.find(({ config }) => config.key === section);
  if (!section) {
    const first = routes.find(({ config }) => can(user, config.permission));
    if (first)
      return (
        <Navigate replace to={`/dashboard/admin?section=${first.config.key}`} />
      );
  }
  if (!route || !can(user, route.config.permission))
    return (
      <div className="p-6 text-sm text-muted-foreground">
        暂无访问权限，请联系管理员分配应用角色。
      </div>
    );
  const Page = route.Page;
  return <Page key={route.config.key} user={user} />;
}
