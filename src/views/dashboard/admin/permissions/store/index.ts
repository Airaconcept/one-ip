import { atom } from "jotai";
import type { Permission } from "../types";

export const hidingAtom = atom<Permission | null>(null);
export const hiddenColumnsAtom = atom<string[]>([]);
export const confirmationAtom = atom<{
  kind: "delete" | "status";
  item: Permission;
  status?: "active" | "disabled";
} | null>(null);
export const editorAtom = atom<{
  editing: Permission | null;
  parent: Permission | null;
} | null>(null);
export const expandedAtom = atom<Set<number>>(new Set<number>());
export const statusAtom = atom("all");
export const searchAtom = atom("");
