import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h2" | "h3";
};

export function SectionHeading({
  as: Heading = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <Heading
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
        className
      )}
      {...props}
    />
  );
}
