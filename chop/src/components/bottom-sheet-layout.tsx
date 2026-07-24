import type { ComponentProps, ReactNode } from "react";
import {
  FormSubpageBottomBar,
  FormSubpageHeader,
  type FormSubpageHeaderProps,
} from "@/components/form-subpage-layout";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SheetContentProps = ComponentProps<typeof SheetContent>;

interface BottomSheetFrameProps
  extends Omit<
    SheetContentProps,
    "children" | "hideClose" | "onEscapeKeyDown" | "onPointerDownOutside" | "side"
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  dismissDisabled?: boolean;
  hideClose?: boolean;
}

/** Shared modal behavior and accessible metadata for every bottom sheet. */
export function BottomSheetFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  dismissDisabled = false,
  hideClose = true,
  className,
  ...contentProps
}: BottomSheetFrameProps) {
  const requestOpenChange = (next: boolean) => {
    if (!next && dismissDisabled) return;
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={requestOpenChange}>
      <SheetContent
        side="bottom"
        hideClose={hideClose}
        className={cn(
          "flex flex-col gap-0 rounded-t-2xl border-border p-0",
          className
        )}
        onPointerDownOutside={(event) => {
          if (dismissDisabled) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (dismissDisabled) event.preventDefault();
        }}
        {...contentProps}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
}

interface FormBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  actions: ReactNode;
  submitting?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
  headerProps?: Omit<
    FormSubpageHeaderProps,
    | "backDisabled"
    | "onBack"
    | "title"
    | "titleAriaHidden"
    | "titleElement"
    | "variant"
  >;
}

/** Standard header, scroll region, and safe-area action bar for form sheets. */
export function FormBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  submitting = false,
  contentClassName,
  bodyClassName,
  headerProps,
}: FormBottomSheetProps) {
  return (
    <BottomSheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      dismissDisabled={submitting}
      className={cn("max-h-[min(96dvh,900px)]", contentClassName)}
    >
      <FormSubpageHeader
        variant="title-close"
        title={title}
        onBack={() => onOpenChange(false)}
        backDisabled={submitting}
        titleElement="h2"
        titleAriaHidden
        {...headerProps}
      />

      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-app flex-1 flex-col">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6",
            bodyClassName
          )}
        >
          {children}
        </div>
      </div>

      <FormSubpageBottomBar className="[&>div>button]:h-12 [&>div>button]:min-h-12 [&>div>button]:text-base">
        {actions}
      </FormSubpageBottomBar>
    </BottomSheetFrame>
  );
}

interface SelectionBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  headerContent?: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  maxHeightClassName?: string;
}

/** Compact list picker with a consistent header, scroll region, and safe area. */
export function SelectionBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  headerContent,
  contentClassName,
  headerClassName,
  maxHeightClassName = "max-h-[min(94dvh,800px)]",
}: SelectionBottomSheetProps) {
  return (
    <BottomSheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      hideClose
      className={cn(
        maxHeightClassName,
        "pb-[var(--safe-area-bottom)]",
        contentClassName
      )}
    >
      <FormSubpageHeader
        variant="title-close"
        title={title}
        onBack={() => onOpenChange(false)}
        titleElement="h2"
        titleAriaHidden
        className={headerClassName}
      />
      {headerContent ? (
        <div className="w-full shrink-0 px-4 py-4">{headerContent}</div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </BottomSheetFrame>
  );
}
