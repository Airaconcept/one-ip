import * as api from "./api";
import type { ResourceConfig } from "../types";

export const config: ResourceConfig = {
  key: "users",
  title: "用户管理",
  description: "管理 One User 账号在当前应用中的访问权限。",
  permission: "users:read",
  columns: [
    {
      key: "name",
      label: "用户",
    },
    {
      key: "email",
      label: "邮箱",
    },
    {
      key: "status",
      label: "状态",
    },
    {
      key: "roles",
      label: "角色",
    },
    {
      key: "last_login_at",
      label: "最近登录",
    },
  ],
  writePermission: "users:write",
  fields: [
    {
      name: "subject",
      label: "One User Subject",
      required: true,
      createOnly: true,
      hint: "填写统一身份平台的用户 Subject。",
    },
    {
      name: "name",
      label: "姓名",
      required: true,
    },
    {
      name: "email",
      label: "邮箱",
      type: "email",
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        {
          value: "active",
          label: "启用",
        },
        {
          value: "disabled",
          label: "停用",
        },
      ],
    },
    {
      name: "role_ids",
      label: "角色",
      type: "multiple",
      lookup: "roles",
    },
  ],
  api: { list: api.listUsers, save: api.save },
};
