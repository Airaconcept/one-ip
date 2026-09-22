import * as api from "./api";
import type { ResourceConfig } from "../types";

export const config: ResourceConfig = {
  key: "roles",
  title: "角色管理",
  description: "按岗位分配权限，控制当前应用的管理范围。",
  permission: "roles:read",
  columns: [
    {
      key: "name",
      label: "角色名称",
    },
    {
      key: "code",
      label: "角色编码",
    },
    {
      key: "description",
      label: "描述",
    },
    {
      key: "permissions",
      label: "权限",
    },
    {
      key: "is_system",
      label: "系统角色",
    },
  ],
  writePermission: "roles:write",
  deleteSuperOnly: true,
  fields: [
    {
      name: "code",
      label: "角色编码",
      required: true,
    },
    {
      name: "name",
      label: "角色名称",
      required: true,
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
    },
    {
      name: "permission_ids",
      label: "权限",
      type: "multiple",
      lookup: "permissions",
    },
  ],
  api: { list: api.listRoles, save: api.save, remove: api.remove },
};
