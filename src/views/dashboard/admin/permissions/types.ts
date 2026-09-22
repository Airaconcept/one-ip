export type Permission = {
  id: number;
  name: string;
  code: string | null;
  description: string;
  parent_id: number | null;
  order_num: number;
  path: string;
  permission_type: "M" | "C" | "F";
  visible: boolean;
  status: "active" | "disabled";
  icon: string;
};
export type PermissionInput = Omit<Permission, "id">;
export type PermissionNode = Permission & { children: PermissionNode[] };
