import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Close control for sheet/modal headers (uses `currentColor`). */
export function IconModalClose({ className, ...props }: IconProps) {
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
        d="M21.5816 2.41842C22.1046 2.94144 22.1373 3.76912 21.6796 4.33023L21.5816 4.43872L14.02 12L21.5816 19.5613C22.1395 20.1192 22.1395 21.0237 21.5816 21.5816C21.0586 22.1046 20.2309 22.1373 19.6698 21.6796L19.5613 21.5816L12 14.02L4.43872 21.5816C3.88083 22.1395 2.97631 22.1395 2.41842 21.5816C1.8954 21.0586 1.86271 20.2309 2.32035 19.6698L2.41842 19.5613L9.98 12L2.41842 4.43872C1.86053 3.88083 1.86053 2.97631 2.41842 2.41842C2.94144 1.8954 3.76912 1.86271 4.33023 2.32035L4.43872 2.41842L12 9.98L19.5613 2.41842C20.1192 1.86053 21.0237 1.86053 21.5816 2.41842Z"
        fill="currentColor"
      />
    </svg>
  );
}
