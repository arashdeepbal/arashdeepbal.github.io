import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function NavSvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={cn("h-6 w-6 shrink-0", className)}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Bill — home */
export function NavIconHome({ className }: { className?: string }) {
  return (
    <NavSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5177 2.14539L21.5177 7.59063C21.8171 7.77179 22 8.09628 22 8.44622V20.9998C22 21.5521 21.5523 21.9998 21 21.9998H15V14.9327C15 14.4199 14.614 13.9972 14.1166 13.9395L14 13.9327H10C9.48716 13.9327 9.06449 14.3188 9.00673 14.8161L9 14.9327V21.9998H3C2.44772 21.9998 2 21.5521 2 20.9998V8.44622C2 8.09628 2.18293 7.77179 2.48234 7.59063L11.4823 2.14539C11.8006 1.95284 12.1994 1.95284 12.5177 2.14539Z"
      />
    </NavSvg>
  );
}

/** Summary — document */
export function NavIconDocument({ className }: { className?: string }) {
  return (
    <NavSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 2C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20ZM10.5 15H5.5C5.25454 15 5.05039 15.1769 5.00806 15.4101L5 15.5V16.5C5 16.7455 5.17688 16.9496 5.41012 16.9919L5.5 17H10.5C10.7455 17 10.9496 16.8231 10.9919 16.5899L11 16.5V15.5C11 15.2545 10.8231 15.0504 10.5899 15.0081L10.5 15ZM18.5 10H5.5C5.25454 10 5.05039 10.1769 5.00806 10.4101L5 10.5V11.5C5 11.7455 5.17688 11.9496 5.41012 11.9919L5.5 12H18.5C18.7455 12 18.9496 11.8231 18.9919 11.5899L19 11.5V10.5C19 10.2545 18.8231 10.0504 18.5899 10.0081L18.5 10ZM18.5 5H5.5C5.25454 5 5.05039 5.17688 5.00806 5.41012L5 5.5V6.5C5 6.74546 5.17688 6.94961 5.41012 6.99194L5.5 7H18.5C18.7455 7 18.9496 6.82312 18.9919 6.58988L19 6.5V5.5C19 5.25454 18.8231 5.05039 18.5899 5.00806L18.5 5Z"
      />
    </NavSvg>
  );
}

/** Participants — users */
export function NavIconUsers({ className }: { className?: string }) {
  return (
    <NavSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4997 14C20.0895 14 22.9997 16.9101 22.9997 20.5V22H16.9996L16.9997 19C16.9997 17.1804 16.4597 15.487 15.5312 14.0711C15.8468 14.0245 16.1704 14 16.4997 14ZM8 12C11.866 12 15 15.134 15 19V22H1V19C1 15.134 4.13401 12 8 12ZM16.5 5C18.433 5 20 6.567 20 8.5C20 10.433 18.433 12 16.5 12C14.567 12 13 10.433 13 8.5C13 6.567 14.567 5 16.5 5ZM8 2C10.2091 2 12 3.79086 12 6C12 8.20914 10.2091 10 8 10C5.79086 10 4 8.20914 4 6C4 3.79086 5.79086 2 8 2Z"
      />
    </NavSvg>
  );
}

/** History — time */
export function NavIconTime({ className }: { className?: string }) {
  return (
    <NavSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM13 5H11.5C11.2545 5 11.0504 5.17688 11.0081 5.41012L11 5.5V11.5L6.93809 15.7765C6.76909 15.9545 6.75674 16.2243 6.89665 16.4157L6.95625 16.4834L8.04375 17.5166C8.22171 17.6856 8.49154 17.698 8.68288 17.558L8.75062 17.4984L13.1562 12.8609L13.2448 12.7569C13.3821 12.5764 13.4678 12.3618 13.4925 12.1364L13.5 12V5.5C13.5 5.25454 13.3231 5.05039 13.0899 5.00806L13 5Z"
      />
    </NavSvg>
  );
}

/** More — menu (hamburger) */
export function NavIconMenu({ className }: { className?: string }) {
  return (
    <NavSvg className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.75 19C21.4404 19 22 19.5596 22 20.25C22 20.9404 21.4404 21.5 20.75 21.5H3.25C2.55964 21.5 2 20.9404 2 20.25C2 19.5596 2.55964 19 3.25 19H20.75ZM20.75 11C21.4404 11 22 11.5596 22 12.25C22 12.9404 21.4404 13.5 20.75 13.5H3.25C2.55964 13.5 2 12.9404 2 12.25C2 11.5596 2.55964 11 3.25 11H20.75ZM20.75 3C21.4404 3 22 3.55964 22 4.25C22 4.94036 21.4404 5.5 20.75 5.5H3.25C2.55964 5.5 2 4.94036 2 4.25C2 3.55964 2.55964 3 3.25 3H20.75Z"
      />
    </NavSvg>
  );
}
