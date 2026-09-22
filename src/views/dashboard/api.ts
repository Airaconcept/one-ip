import { request } from "@/lib/http";

export type MenuItem = {
  id: number;
  parent_id: number | null;
  name: string;
  path: string;
  code: string | null;
  permission_type: string;
  order_num: number;
};
export const getMenu = () => request<{ items: MenuItem[] }>("/api/admin/menu");
