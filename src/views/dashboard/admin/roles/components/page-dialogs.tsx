import { DialogActionButton } from "@/components/ui/dialog-action-button";
import {
  ResponsiveDialogRoot as ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { SweepShine } from "@/components/ui/sweep-shine";
import {
  RoleEditor,
  RolePermissions,
} from "@/views/dashboard/admin/roles/components/dialogs";
import { useRoles } from "@/views/dashboard/admin/roles/use-roles";

export function PageDialogs({ state }: { state: ReturnType<typeof useRoles> }) {
  const {
    editor,
    setEditor,
    permissionRole,
    setPermissionRole,
    confirmation,
    setConfirmation,
    error,
    refresh,
    mutation,
  } = state;
  return (
    <>
      {" "}
      {editor && (
        <RoleEditor
          key={editor.role?.id ?? "new"}
          role={editor.role}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            refresh();
          }}
        />
      )}
      {permissionRole && (
        <RolePermissions
          key={permissionRole.id}
          role={permissionRole}
          onClose={() => setPermissionRole(null)}
          onSaved={() => {
            setPermissionRole(null);
            refresh();
          }}
        />
      )}
      <ResponsiveDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setConfirmation(null);
        }}
      >
        <ResponsiveDialogContent
          className="sm:max-w-md"
          showCloseButton={!mutation.isPending}
        >
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {confirmation?.kind === "delete" ? "删除角色" : "修改角色状态"}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <ResponsiveDialogDescription>
              {confirmation?.kind === "delete"
                ? `确认删除选中的 ${confirmation.items.length} 个角色？角色授权关联将一并移除，无法撤销。`
                : `确认${confirmation?.status === "active" ? "启用" : "停用"}选中的 ${confirmation?.items.length ?? 0} 个角色？停用后对应角色的业务权限将失效。`}
            </ResponsiveDialogDescription>
            <ul className="mt-3 max-h-32 overflow-auto text-sm text-muted-foreground">
              {confirmation?.items.map((role) => (
                <li key={role.id}>{role.name}</li>
              ))}
            </ul>
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <DialogActionButton
              action="cancel"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setConfirmation(null)}
            >
              取消
            </DialogActionButton>
            <DialogActionButton
              action="confirm"
              variant={
                confirmation?.kind === "delete" ? "destructive" : "default"
              }
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <SweepShine active={mutation.isPending}>
                {mutation.isPending ? "处理中…" : "确认"}
              </SweepShine>
            </DialogActionButton>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
