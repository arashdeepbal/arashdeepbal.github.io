import type { ReactNode } from "react";
import { IconBack } from "@/components/icons/app-icons";
import { IconModalClose } from "@/components/icons/modal-close-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Fixed bottom bar: matches participant sheet / trip edit actions. */
export const FORM_SUBPAGE_BOTTOM_ACTION_BAR =
  "border-t border-border bg-background/95 pt-3 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3";

export interface FormSubpageHeaderProps {
  title: string;
  /** Dismiss / navigate back (used for both layouts). */
  onBack: () => void;
  backDisabled?: boolean;
  /**
   * Extra classes on the title row container (`default`: the `<header>`;
   * `title-close`: the inner `max-w-app` block above the full-bleed divider).
   */
  className?: string;
  /** Use `h2` when nested inside a dialog/sheet so the page can keep a single `h1`. */
  titleElement?: "h1" | "h2";
  /**
   * `default`: Back control above title (full-page flows).
   * `title-close`: title and close icon on one row (bottom sheets / modals).
   */
  variant?: "default" | "title-close";
  /**
   * When `variant` is `title-close`, render the full-bleed hairline under the title row.
   * Set `false` for compact confirm sheets (title → description with no rule).
   * @default true
   */
  showTitleDivider?: boolean;
  /** Shown above the title row (e.g. illustration). Only used with `title-close`. */
  leadingVisual?: ReactNode;
  /** When `variant` is `title-close`, show the top-end close control. @default true */
  showCloseButton?: boolean;
  /** Hide the visual title from assistive technology when the dialog already has a SheetTitle. */
  titleAriaHidden?: boolean;
}

export function FormSubpageHeader({
  title,
  onBack,
  backDisabled = false,
  className,
  titleElement = "h1",
  variant = "default",
  showTitleDivider = true,
  leadingVisual,
  showCloseButton = true,
  titleAriaHidden = false,
}: FormSubpageHeaderProps) {
  const Heading = titleElement;

  if (variant === "title-close") {
    return (
      <header className="w-full shrink-0">
        <div
          className={cn(
            "mx-auto w-full max-w-app px-4 pt-4",
            showTitleDivider ? "pb-4" : "pb-3",
            className
          )}
        >
          {leadingVisual ? (
            <div className="mb-5 flex justify-start" aria-hidden>
              {leadingVisual}
            </div>
          ) : null}
          <div
            className={cn(
              "flex items-start gap-3",
              showCloseButton ? "justify-between" : "justify-start"
            )}
          >
            <Heading
              className="min-w-0 flex-1 text-2xl font-bold leading-tight tracking-tight text-foreground"
              aria-hidden={titleAriaHidden || undefined}
            >
              {title}
            </Heading>
            {showCloseButton ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onBack}
                disabled={backDisabled}
                aria-label="Close"
              >
                <IconModalClose className="size-6" />
              </Button>
            ) : null}
          </div>
        </div>
        {showTitleDivider ? (
          <div className="h-px w-full shrink-0 bg-border" aria-hidden />
        ) : null}
      </header>
    );
  }

  return (
    <header
      className={cn("shrink-0 border-b border-border pb-4 pt-4", className)}
    >
      <Button
        type="button"
        variant="ghost"
        className="mb-2 -ml-2 h-10 gap-1 px-2 text-muted-foreground"
        onClick={onBack}
        disabled={backDisabled}
      >
        <IconBack className="h-5 w-5 shrink-0" aria-hidden />
        Back
      </Button>
      <Heading
        className="text-2xl font-bold tracking-tight text-foreground"
        aria-hidden={titleAriaHidden || undefined}
      >
        {title}
      </Heading>
    </header>
  );
}

export function FormSubpageBottomBar({
  children,
  className,
  /** Full-page flows: pin to viewport. Sheets keep default `false`. */
  fixed = false,
}: {
  children: ReactNode;
  className?: string;
  fixed?: boolean;
}) {
  return (
    <div
      className={cn(
        FORM_SUBPAGE_BOTTOM_ACTION_BAR,
        "shrink-0",
        fixed && "fixed bottom-0 left-0 right-0 z-40",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-app gap-3 px-4">{children}</div>
    </div>
  );
}
