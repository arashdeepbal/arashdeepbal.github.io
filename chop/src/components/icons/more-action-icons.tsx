import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** User-supplied share mark, made theme-aware with currentColor. */
export function IconShare({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("shrink-0", className)} aria-hidden {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M17 2C18.6569 2 20 3.34315 20 5C20 6.65685 18.6569 8 17 8C16.2606 8 15.5836 7.73248 15.0607 7.28896L7.94747 11.4381C7.98195 11.6201 8 11.808 8 12C8 12.1924 7.98189 12.3806 7.94728 12.5629L15.0607 16.711C15.5836 16.2675 16.2606 16 17 16C18.6569 16 20 17.3431 20 19C20 20.6569 18.6569 22 17 22C15.3431 22 14 20.6569 14 19C14 18.808 14.018 18.6201 14.0525 18.4381L6.93934 14.289C6.41638 14.7325 5.73943 15 5 15C3.34315 15 2 13.6569 2 12C2 10.3431 3.34315 9 5 9C5.73943 9 6.41638 9.26752 6.93934 9.71104L14.0525 5.5619C14.018 5.37988 14 5.19205 14 5C14 3.34315 15.3431 2 17 2Z" fill="currentColor" />
    </svg>
  );
}

/** User-supplied lightbulb mark, made theme-aware with currentColor. */
export function IconLightbulb({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("shrink-0", className)} aria-hidden {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.5 20C15.5 21.1046 14.6046 22 13.5 22H10.5C9.39543 22 8.5 21.1046 8.5 20H15.5ZM15.5 17V19H8.5V17H15.5ZM12 1C16.4183 1 20 4.58172 20 9C20 12.0125 18.3349 14.6361 15.8749 16.0006H8.1251C5.66508 14.6361 4 12.0125 4 9C4 4.58172 7.58172 1 12 1ZM14.5 8L12.8944 8.80279C12.3877 9.05616 11.8002 9.0815 11.2773 8.8788L11.1056 8.80279L9.5 8V13H14.5V8Z" fill="currentColor" />
    </svg>
  );
}

/** User-supplied dropdown chevron, intentionally smaller than the action icon. */
export function IconThinDropdown({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cn("shrink-0", className)} aria-hidden {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M1.07757 5.07709C1.38131 4.77334 1.8612 4.75309 2.18842 5.01634L2.25608 5.07709L8.00016 10.8217L13.7442 5.07709C14.048 4.77334 14.5279 4.75309 14.8551 5.01634L14.9228 5.07709C15.2265 5.38083 15.2467 5.86071 14.9835 6.18793L14.9228 6.2556L8.58942 12.5889C8.28568 12.8927 7.8058 12.9129 7.47857 12.6497L7.41091 12.5889L1.07757 6.2556C0.752137 5.93016 0.752137 5.40252 1.07757 5.07709Z" fill="currentColor" />
    </svg>
  );
}
