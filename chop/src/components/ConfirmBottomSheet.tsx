import { useState, type ReactNode } from "react";
import {
  FormSubpageBottomBar,
  FormSubpageHeader,
} from "@/components/form-subpage-layout";
import { IconBin } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export interface ConfirmBottomSheetProps {
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) onOpenChange(false);
      }}
    >
      <SheetContent
        side="bottom"
        hideClose
        className="flex max-h-[min(96dvh,900px)] flex-col gap-0 rounded-t-2xl border-border p-0"
        onPointerDownOutside={(e) => {
          if (submitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
      >
        <FormSubpageHeader
          variant="title-close"
          title={title}
          onBack={handleClose}
          backDisabled={submitting}
          titleElement="h2"
          showTitleDivider={false}
          showCloseButton={visual !== "delete"}
          className={
            visual === "delete" ? "pt-6 pb-1" : undefined
          }
        />

        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-app flex-1 flex-col">
          <div
            className={
              visual === "delete"
                ? "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-0"
                : "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-1"
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
          </div>
        </div>

        <FormSubpageBottomBar>
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
        </FormSubpageBottomBar>
      </SheetContent>
    </Sheet>
  );
}
