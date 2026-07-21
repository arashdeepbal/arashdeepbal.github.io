import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Filled circle with check (settled state), from `circle-check.svg`; uses `currentColor`. */
export function IconCircleCheck({ className, ...props }: IconProps) {
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
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM17.4528 7.98701C17.2738 7.81914 17.0039 7.80856 16.8135 7.94979L16.7461 8.00986L10.471 14.704L7.2374 11.4697L7.16815 11.4118C6.99764 11.2937 6.77005 11.2937 6.59957 11.4118L6.53033 11.4697L5.46967 12.5303C5.2961 12.7039 5.27682 12.9733 5.41181 13.1682L5.46967 13.2374L9.61612 17.3839L9.71998 17.4769C10.1866 17.8505 10.8568 17.8397 11.3111 17.4513L11.4119 17.3549L18.57 9.71969C18.7378 9.54062 18.7484 9.27072 18.6072 9.0803L18.5472 9.01296L17.4528 7.98701Z"
        fill="currentColor"
      />
    </svg>
  );
}
