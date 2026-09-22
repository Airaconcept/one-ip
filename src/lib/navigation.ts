import { lazy } from "react";
import { config as loginEvents } from "@/views/dashboard/admin/login-events/config";
import { config as operationLogs } from "@/views/dashboard/admin/operation-logs/config";
import { config as permissions } from "@/views/dashboard/admin/permissions/config";
import { config as roles } from "@/views/dashboard/admin/roles/config";
import { config as users } from "@/views/dashboard/admin/users/config";
import {
  Users,
  ShieldCheck,
  KeyRound,
  History,
  ScrollText,
} from "lucide-react";

export const routes = [
  {
    config: users,
    Page: lazy(() => import("@/views/dashboard/admin/users")),
    icon: Users,
    group: "系统管理",
  },
  {
    config: roles,
    Page: lazy(() => import("@/views/dashboard/admin/roles")),
    icon: ShieldCheck,
    group: "系统管理",
  },
  {
    config: permissions,
    Page: lazy(() => import("@/views/dashboard/admin/permissions")),
    icon: KeyRound,
    group: "系统管理",
  },
  {
    config: loginEvents,
    Page: lazy(() => import("@/views/dashboard/admin/login-events")),
    icon: History,
    group: "系统日志",
  },
  {
    config: operationLogs,
    Page: lazy(() => import("@/views/dashboard/admin/operation-logs")),
    icon: ScrollText,
    group: "系统日志",
  },
];
