import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Check mark used on Settle actions (from design asset, uses `currentColor`). */
export function IconSettleCheck({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.4538 4.4868L22.5481 5.51271C22.7496 5.70158 22.7598 6.018 22.5709 6.21945L10.4129 19.188C9.96215 19.6688 9.22344 19.7123 8.72097 19.31L8.61711 19.217L1.47067 12.0705C1.2754 11.8753 1.2754 11.5587 1.47067 11.3634L2.53133 10.3028C2.70488 10.1292 2.9743 10.1099 3.16917 10.2449L3.23842 10.3028V10.3028L9.472 16.5368L20.7471 4.5096C20.915 4.33052 21.1836 4.30256 21.3828 4.4312L21.4538 4.4868V4.4868Z"
        fill="currentColor"
      />
    </svg>
  );
}
