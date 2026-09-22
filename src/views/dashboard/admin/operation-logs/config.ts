import * as api from "./api";
import type { ResourceConfig } from "../types";

export const config: ResourceConfig = {
  key: "operation-logs",
  title: "操作日志",
  description: "仅保留最近 7 天；过期记录由 PostgreSQL 函数自动清理。",
  permission: "operation-logs:read",
  columns: [
    {
      key: "name",
      label: "操作用户",
    },
    {
      key: "action",
      label: "操作",
    },
    {
      key: "resource",
      label: "资源",
    },
    {
      key: "resource_id",
      label: "资源标识",
    },
    {
      key: "status",
      label: "结果",
    },
    {
      key: "created_at",
      label: "时间",
    },
  ],
  api: { list: api.listOperationLogs },
};
