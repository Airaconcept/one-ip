export type Role = {
  id: number;
  code: string;
  name: string;
  description: string;
  status: "active" | "disabled";
  role_sort: number;
  is_system: boolean;
  permission_ids: number[];
  user_count: number;
};
export type RoleInput = Pick<
  Role,
  "code" | "name" | "description" | "status" | "role_sort" | "permission_ids"
>;
