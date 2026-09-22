import { atom } from "jotai";
import type { Role } from "../types";

export const hiddenColumnsAtom = atom<string[]>([]);
export const errorAtom = atom("");
export const confirmationAtom = atom<{
  kind: "delete" | "status";
  items: Role[];
  status?: "active" | "disabled";
} | null>(null);
export const permissionRoleAtom = atom<Role | null>(null);
export const editorAtom = atom<{ role: Role | null } | null>(null);
export const selectedAtom = atom<Set<number>>(new Set<number>());
export const pageSizeAtom = atom(10);
export const pageAtom = atom(1);
export const statusAtom = atom("all");
export const searchAtom = atom("");
