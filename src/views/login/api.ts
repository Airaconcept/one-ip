import { ApiError, request } from "@/lib/http";

export type User = {
  id: number;
  sub: string;
  name: string | null;
  email: string | null;
  picture?: string | null;
  preferred_username?: string | null;
  status: string;
  permissions: string[];
  role_ids: number[];
  identity_roles: string[];
};
export async function getSession(): Promise<User | null> {
  try {
    return (await request<{ user: User }>("/api/auth/me")).user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
export const logout = () =>
  request<void>("/api/auth/logout", { method: "POST" });
export const can = (user: User, permission: string) =>
  user.permissions.includes("*") || user.permissions.includes(permission);
