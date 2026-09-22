const builtinCodes = new Set([
  "users:read",
  "users:write",
  "roles:read",
  "roles:write",
  "permissions:read",
  "permissions:write",
  "logs:read",
  "operation-logs:read",
]);
export const isBuiltinPermission = (code: unknown) =>
  typeof code === "string" && builtinCodes.has(code);
