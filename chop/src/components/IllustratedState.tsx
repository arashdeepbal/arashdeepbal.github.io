import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IllustratedStateProps extends HTMLAttributes<HTMLElement> {
  illustration?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  as?: "div" | "header";
  titleAs?: "h1" | "h2" | "p";
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

/** Slot-based state layout for empty, error, onboarding, and success moments. */
export function IllustratedState({
  illustration,
  title,
  description,
  actions,
  as: Root = "div",
  titleAs: Title = "h2",
  className,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}: IllustratedStateProps) {
  return (
    <Root
      className={cn("flex flex-col items-center text-center", className)}
      {...props}
    >
      {illustration}
      {title ? (
        <Title
          className={cn(
            "text-2xl font-semibold tracking-tight text-foreground",
            titleClassName
          )}
        >
          {title}
        </Title>
      ) : null}
      {description ? (
        <div className={cn("text-muted-foreground", descriptionClassName)}>
          {description}
        </div>
      ) : null}
      {actions ? (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:justify-center",
            actionsClassName
          )}
        >
          {actions}
        </div>
      ) : null}
    </Root>
  );
}
