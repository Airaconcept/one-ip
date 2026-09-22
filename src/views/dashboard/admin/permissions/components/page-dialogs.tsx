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
import { PermissionEditor } from "@/views/dashboard/admin/permissions/components/editor-dialog";
import { usePermissions } from "@/views/dashboard/admin/permissions/use-permissions";

export function PageDialogs({
  state,
}: {
  state: ReturnType<typeof usePermissions>;
}) {
  const {
    query,
    editor,
    setEditor,
    confirmation,
    setConfirmation,
    refresh,
    hiding,
    setHiding,
    visibilityMutation,
    mutation,
  } = state;
  return (
    <>
      {" "}
      <ResponsiveDialog
        open={Boolean(hiding)}
        onOpenChange={(open) => {
          if (!open && !visibilityMutation.isPending) setHiding(null);
        }}
      >
        <ResponsiveDialogContent
          className="sm:max-w-[25rem]"
          showCloseButton={!visibilityMutation.isPending}
        >
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>隐藏权限</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <ResponsiveDialogDescription>
              确认隐藏“{hiding?.name}
              ”？隐藏后将不在导航中显示，访问权限保持不变。
            </ResponsiveDialogDescription>
            {visibilityMutation.error && (
              <p role="alert" className="text-sm text-destructive">
                {visibilityMutation.error.message}
              </p>
            )}
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <DialogActionButton
              action="cancel"
              variant="outline"
              disabled={visibilityMutation.isPending}
              onClick={() => setHiding(null)}
            >
              取消
            </DialogActionButton>
            <DialogActionButton
              action="confirm"
              disabled={visibilityMutation.isPending}
              onClick={() =>
                hiding &&
                visibilityMutation.mutate({ item: hiding, visible: false })
              }
            >
              <SweepShine active={visibilityMutation.isPending}>
                {visibilityMutation.isPending ? "保存中…" : "确认隐藏"}
              </SweepShine>
            </DialogActionButton>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
      {editor && (
        <PermissionEditor
          key={editor.editing?.id ?? `new-${editor.parent?.id ?? "root"}`}
          items={query.data ?? []}
          editing={editor.editing}
          parent={editor.parent}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
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
          className="sm:max-w-[25rem]"
          showCloseButton={!mutation.isPending}
        >
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {confirmation?.kind === "delete" ? "删除权限" : "修改权限状态"}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <ResponsiveDialogDescription>
              {confirmation?.kind === "delete"
                ? `确认删除“${confirmation.item.name}”？此操作无法撤销。`
                : `确认${confirmation?.status === "active" ? "启用" : "停用"}“${confirmation?.item.name ?? ""}”？停用后，其下级权限也将失效。`}
            </ResponsiveDialogDescription>
            {mutation.isError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {mutation.error.message}
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
                confirmation?.kind === "delete" ||
                confirmation?.status === "disabled"
                  ? "destructive"
                  : "default"
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
