import * as api from "./api";
import { isBuiltinPermission } from "./constants";
import type { ResourceConfig } from "../types";

export const config: ResourceConfig = {
  key: "permissions",
  title: "权限管理",
  description: "维护用户、角色、日志与通知业务的权限目录。",
  permission: "permissions:read",
  columns: [
    { key: "is_builtin", label: "系统权限" },
    {
      key: "name",
      label: "权限名称",
    },
    {
      key: "code",
      label: "权限编码",
    },
    {
      key: "description",
      label: "描述",
    },
  ],
  writePermission: "permissions:write",
  writeSuperOnly: true,
  canRemove: (row) => !isBuiltinPermission(row.code),
  fields: [
    {
      name: "code",
      readOnly: (row) => isBuiltinPermission(row.code),
      label: "权限编码",
      required: true,
    },
    {
      name: "name",
      label: "权限名称",
      required: true,
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
    },
  ],
  api: { list: api.listPermissions, save: api.save, remove: api.remove },
};
