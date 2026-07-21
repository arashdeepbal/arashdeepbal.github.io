import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackIconProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

export function FeedbackIcon({
  active,
  children,
  className,
}: FeedbackIconProps) {
  return (
    <span
      className={cn(
        "feedback-icon relative size-5 shrink-0 [&_svg]:!size-5",
        className,
      )}
      data-success={active ? "true" : "false"}
      aria-hidden
    >
      <span className="feedback-icon-default absolute inset-0 flex items-center justify-center">
        {children}
      </span>
      <Check className="feedback-icon-success absolute inset-0 size-5 stroke-[2.5]" />
    </span>
  );
}
