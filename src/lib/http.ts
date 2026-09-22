import { request as transport } from "@/lib/network";

export { HttpRequestError as ApiError } from "@/lib/network";
export function request<T>(path: string, init: RequestInit = {}) {
  return transport<T>(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}
