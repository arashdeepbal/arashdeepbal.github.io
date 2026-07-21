import { useState, type ReactNode } from "react";
import { FormBottomSheet } from "@/components/bottom-sheet-layout";
import { IconBin } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";

interface ConfirmBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  onConfirm: () => void | Promise<void>;
  /**
   * `delete`: destructive confirm, bin on confirm; compact header, no close control (use Cancel).
   */
  visual?: "default" | "delete";
}

export function ConfirmBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "destructive",
  onConfirm,
  visual = "default",
}: ConfirmBottomSheetProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (!submitting) onOpenChange(false);
  };

  const runConfirm = async () => {
    setSubmitting(true);
    try {
      await Promise.resolve(onConfirm());
      onOpenChange(false);
    } catch {
      // Caller may toast or rethrow
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        typeof description === "string"
          ? description
          : `Review the details and choose ${confirmLabel} or ${cancelLabel}.`
      }
      submitting={submitting}
      headerProps={{
        showTitleDivider: false,
        showCloseButton: visual !== "delete",
        className: visual === "delete" ? "pt-6 pb-1" : undefined,
      }}
      bodyClassName={
        visual === "delete" ? "pb-6 pt-0" : "pb-6 pt-1"
      }
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2 font-medium [&_svg]:!h-5 [&_svg]:!w-5"
            onClick={handleClose}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={visual === "delete" ? "destructive" : confirmVariant}
            className="flex-1 gap-2 font-medium [&_svg]:!h-5 [&_svg]:!w-5"
            onClick={() => void runConfirm()}
            disabled={submitting}
          >
            {visual === "delete" && !submitting ? (
              <IconBin className="size-5 shrink-0" />
            ) : null}
            {submitting ? "Please wait…" : confirmLabel}
          </Button>
        </>
      }
    >
      <div
        className={
          visual === "delete"
            ? "space-y-1 text-left text-base leading-snug text-muted-foreground"
            : "space-y-2 text-left text-base leading-relaxed text-muted-foreground"
        }
      >
        {description}
      </div>
    </FormBottomSheet>
  );
}
