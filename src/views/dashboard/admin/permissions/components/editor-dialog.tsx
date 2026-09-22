import { useMemo } from "react";
import { MenuIconSelect } from "@/components/menu-icon-select";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialogRoot as ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocalAtom } from "@/hooks/use-local-atom";
import { savePermission } from "@/views/dashboard/admin/permissions/api";
import { isBuiltinPermission } from "@/views/dashboard/admin/permissions/constants";
import {
  buildTree,
  descendantIds,
  flattenTree,
  typeLabels,
} from "@/views/dashboard/admin/permissions/tree";
import type {
  Permission,
  PermissionInput,
} from "@/views/dashboard/admin/permissions/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch, type UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const permissionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "请填写权限名称")
      .max(64, "权限名称最多 64 个字符"),
    code: z.string().trim().max(100).nullable(),
    description: z.string().max(2000),
    parent_id: z.number().nullable(),
    order_num: z.number().int().min(0),
    path: z.string().max(512),
    permission_type: z.enum(["M", "C", "F"]),
    visible: z.boolean(),
    status: z.enum(["active", "disabled"]),
    icon: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.permission_type === "F") {
      if (!value.code)
        ctx.addIssue({
          code: "custom",
          path: ["code"],
          message: "按钮必须填写权限标识",
        });
      if (value.parent_id === null)
        ctx.addIssue({
          code: "custom",
          path: ["parent_id"],
          message: "按钮必须选择上级权限",
        });
    }
  });

export function PermissionEditor({
  items,
  editing,
  parent,
  onClose,
  onSaved,
}: {
  items: Permission[];
  editing: Permission | null;
  parent: Permission | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [confirmHide, setConfirmHide] = useLocalAtom(false);
  const methods = useForm<PermissionInput>({
    resolver: zodResolver(permissionSchema),
    mode: "onChange",
    defaultValues: {
      name: editing?.name ?? "",
      code: editing?.code ?? null,
      description: editing?.description ?? "",
      parent_id: editing?.parent_id ?? parent?.id ?? null,
      order_num:
        editing?.order_num ??
        Math.max(
          0,
          ...items
            .filter((item) => item.parent_id === (parent?.id ?? null))
            .map((item) => item.order_num),
        ) + 1,
      path: editing?.path ?? "",
      permission_type:
        editing?.permission_type ??
        (parent ? (parent.permission_type === "M" ? "C" : "F") : "M"),
      visible: editing?.visible ?? true,
      status: editing?.status ?? "active",
      icon: editing?.icon ?? "#",
    },
  });
  const form = useWatch({ control: methods.control }) as PermissionInput;
  const tree = useMemo(() => buildTree(items), [items]);
  const flat = useMemo(() => flattenTree(tree), [tree]);
  const editedNode = flat.find((item) => item.node.id === editing?.id)?.node;
  const blocked = new Set(editedNode ? descendantIds(editedNode) : []);
  const set: UseFormSetValue<PermissionInput> = (key, value) =>
    methods.setValue(key, value, { shouldDirty: true, shouldValidate: true });
  const mutation = useMutation({
    mutationFn: () =>
      savePermission(editing?.id, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        code: form.permission_type === "M" ? null : form.code?.trim() || null,
        path: form.permission_type === "F" ? "" : form.path,
        visible: form.permission_type === "F" ? false : form.visible,
        icon: form.permission_type === "F" ? "#" : form.icon,
      }),
    onSuccess: () => {
      toast.success("权限已保存");
      onSaved();
    },
  });
  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <ResponsiveDialogContent
        className="sm:max-w-xl"
        showCloseButton={!mutation.isPending}
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {editing ? "编辑权限" : "新增权限"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            配置目录、菜单和按钮的层级及访问权限。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <form
          noValidate
          onSubmit={methods.handleSubmit(() => mutation.mutate())}
          className="flex min-h-0 flex-col"
        >
          <ResponsiveDialogBody className="max-h-[65svh] space-y-4 overflow-y-auto">
            <fieldset disabled={mutation.isPending} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permission-type">
                    权限类型 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.permission_type}
                    onValueChange={(value) =>
                      set(
                        "permission_type",
                        value as Permission["permission_type"],
                      )
                    }
                    disabled={Boolean(
                      editing && isBuiltinPermission(editing.code),
                    )}
                  >
                    <SelectTrigger id="permission-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent">
                    上级权限{" "}
                    {form.permission_type === "F" && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Select
                    value={
                      form.parent_id === null ? "root" : String(form.parent_id)
                    }
                    onValueChange={(value) =>
                      set("parent_id", value === "root" ? null : Number(value))
                    }
                  >
                    <SelectTrigger id="parent" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">顶级权限</SelectItem>
                      {flat
                        .filter(
                          ({ node }) =>
                            node.permission_type !== "F" &&
                            !blocked.has(node.id),
                        )
                        .map(({ node, depth }) => (
                          <SelectItem key={node.id} value={String(node.id)}>
                            {"　".repeat(depth)}
                            {node.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission-name">
                  权限名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="permission-name"
                  aria-invalid={Boolean(methods.formState.errors.name)}
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              {form.permission_type !== "M" && (
                <div className="space-y-2">
                  <Label htmlFor="permission-code">
                    权限标识{" "}
                    {form.permission_type === "F" && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    id="permission-code"
                    aria-invalid={Boolean(methods.formState.errors.code)}
                    placeholder="例如 users:read"
                    value={form.code ?? ""}
                    readOnly={Boolean(
                      editing && isBuiltinPermission(editing.code),
                    )}
                    onChange={(event) => set("code", event.target.value)}
                    required={form.permission_type === "F"}
                    maxLength={128}
                  />
                  {editing && isBuiltinPermission(editing.code) && (
                    <p className="text-xs text-muted-foreground">
                      内置权限标识不可修改。
                    </p>
                  )}
                </div>
              )}
              {form.permission_type !== "F" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="permission-path">路由地址</Label>
                    <Input
                      id="permission-path"
                      value={form.path}
                      onChange={(event) => set("path", event.target.value)}
                      placeholder="/dashboard/users"
                      maxLength={512}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permission-icon">菜单图标</Label>
                    <MenuIconSelect
                      controlId="permission-icon"
                      value={form.icon}
                      onChange={(value) => set("icon", value)}
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permission-order">同级排序</Label>
                  <Input
                    id="permission-order"
                    type="number"
                    min={0}
                    value={form.order_num}
                    onChange={(event) =>
                      set("order_num", Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-3 pt-1">
                  {form.permission_type !== "F" && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="permission-visible">菜单可见</Label>
                      <Switch
                        id="permission-visible"
                        checked={form.visible}
                        onCheckedChange={(checked) =>
                          checked ? set("visible", true) : setConfirmHide(true)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission-description">备注</Label>
                <Textarea
                  id="permission-description"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  maxLength={2000}
                />
              </div>
            </fieldset>
            {Object.entries(methods.formState.errors).map(([key, error]) => (
              <p key={key} role="alert" className="text-sm text-destructive">
                {error?.message}
              </p>
            ))}
            {mutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                {mutation.error.message}
              </p>
            )}
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <DialogActionButton
              action="cancel"
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              取消
            </DialogActionButton>
            <DialogActionButton
              action="confirm"
              type="submit"
              disabled={mutation.isPending}
              loading={mutation.isPending}
              loadingText="保存中…"
            >
              保存
            </DialogActionButton>
          </ResponsiveDialogFooter>
        </form>
        <ResponsiveDialog open={confirmHide} onOpenChange={setConfirmHide}>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>隐藏权限</ResponsiveDialogTitle>
            </ResponsiveDialogHeader>
            <ResponsiveDialogBody>
              <ResponsiveDialogDescription>
                确认关闭显示？保存后该项目将不在导航中显示。
              </ResponsiveDialogDescription>
            </ResponsiveDialogBody>
            <ResponsiveDialogFooter>
              <DialogActionButton
                action="cancel"
                type="button"
                onClick={() => setConfirmHide(false)}
              >
                取消
              </DialogActionButton>
              <DialogActionButton
                type="button"
                onClick={() => {
                  set("visible", false);
                  setConfirmHide(false);
                }}
              >
                确认隐藏
              </DialogActionButton>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
