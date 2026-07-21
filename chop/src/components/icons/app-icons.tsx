import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconPlus({ className, ...props }: IconProps) {
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
        d="M12 2C12.8284 2 13.5 2.67157 13.5 3.5V10.5H20.5C21.3284 10.5 22 11.1716 22 12C22 12.8284 21.3284 13.5 20.5 13.5H13.5V20.5C13.5 21.3284 12.8284 22 12 22C11.1716 22 10.5 21.3284 10.5 20.5V13.5H3.5C2.67157 13.5 2 12.8284 2 12C2 11.1716 2.67157 10.5 3.5 10.5H10.5V3.5C10.5 2.67157 11.1716 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconBin({ className, ...props }: IconProps) {
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
        d="M19 7V20C19 21.0544 18.1841 21.9182 17.1493 21.9945L17 22H7C5.94564 22 5.08183 21.1841 5.00549 20.1493L5 20V7H19ZM15.5 9C15.2545 9 15.0504 9.17688 15.0081 9.41012L15 9.5V18.5C15 18.7761 15.2239 19 15.5 19C15.7455 19 15.9496 18.8231 15.9919 18.5899L16 18.5V9.5C16 9.22386 15.7761 9 15.5 9ZM12 9C11.7545 9 11.5504 9.17688 11.5081 9.41012L11.5 9.5V18.5C11.5 18.7761 11.7239 19 12 19C12.2455 19 12.4496 18.8231 12.4919 18.5899L12.5 18.5V9.5C12.5 9.22386 12.2761 9 12 9ZM8.5 9C8.25454 9 8.05039 9.17688 8.00806 9.41012L8 9.5V18.5C8 18.7761 8.22386 19 8.5 19C8.74546 19 8.94961 18.8231 8.99194 18.5899L9 18.5V9.5C9 9.22386 8.77614 9 8.5 9ZM14.2792 2C14.7097 2 15.0918 2.27543 15.2279 2.68377L15.666 4H20C20.5523 4 21 4.44772 21 5C21 5.55228 20.5523 6 20 6H4C3.44772 6 3 5.55228 3 5C3 4.44772 3.44772 4 4 4H8.333L8.77208 2.68377C8.90819 2.27543 9.29033 2 9.72076 2H14.2792Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCopy({ className, ...props }: IconProps) {
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
        d="M21 8C21.5523 8 22 8.44772 22 9V21C22 21.5523 21.5523 22 21 22H9C8.44772 22 8 21.5523 8 21V9C8 8.44772 8.44772 8 9 8H21ZM16 2C16.5523 2 17 2.44772 17 3V6H7.5C6.7203 6 6.07955 6.59489 6.00687 7.35554L6 7.5V17H3C2.44772 17 2 16.5523 2 16V3C2 2.44772 2.44772 2 3 2H16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconSignOut({ className, ...props }: IconProps) {
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
        d="M9 20.5C9 20.2239 8.77614 20 8.5 20H4L4 4L8.5 4C8.77614 4 9 3.77614 9 3.5V2.5C9 2.22386 8.77614 2 8.5 2L2.5 2C2.22386 2 2 2.22386 2 2.5L2 21.5C2 21.7761 2.22386 22 2.5 22H8.5C8.77614 22 9 21.7761 9 21.5V20.5ZM7 12C7 11.4477 7.44772 11 8 11L18.585 11L14.2929 6.70711C13.9324 6.34662 13.9047 5.77939 14.2097 5.3871L14.2929 5.29289C14.6534 4.93241 15.2206 4.90468 15.6129 5.2097L15.7071 5.29289L21.7071 11.2929C22.0676 11.6534 22.0953 12.2206 21.7903 12.6129L21.7071 12.7071L15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071C13.9324 18.3466 13.9047 17.7794 14.2097 17.3871L14.2929 17.2929L18.585 13L8 13C7.44772 13 7 12.5523 7 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconEdit({ className, ...props }: IconProps) {
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
        d="M11.5 3.00046C11.7761 3.00046 12 3.22432 12 3.50046V4.50046C12 4.7766 11.7761 5.00046 11.5 5.00046H5V19.0005H19V12.5005C19 12.2243 19.2239 12.0005 19.5 12.0005H20.5C20.7761 12.0005 21 12.2243 21 12.5005V20.5005C21 20.7766 20.7761 21.0005 20.5 21.0005H3.5C3.22386 21.0005 3 20.7766 3 20.5005V3.50046C3 3.22432 3.22386 3.00046 3.5 3.00046H11.5ZM19.353 2.35348L21.6459 4.64637C21.8412 4.84163 21.8412 5.15821 21.6459 5.35348L12.9716 14.0015L10 14.0005L9.97157 11.0015L18.6464 2.35294C18.8418 2.15819 19.158 2.15843 19.353 2.35348Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconBack({ className, ...props }: IconProps) {
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
        d="M12.7071 2.29289C13.0676 2.65338 13.0953 3.22061 12.7903 3.6129L12.7071 3.70711L5.415 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H5.415L12.7071 20.2929C13.0676 20.6534 13.0953 21.2206 12.7903 21.6129L12.7071 21.7071C12.3466 22.0676 11.7794 22.0953 11.3871 21.7903L11.2929 21.7071L2.29289 12.7071C1.93241 12.3466 1.90468 11.7794 2.2097 11.3871L2.29289 11.2929L11.2929 2.29289C11.6834 1.90237 12.3166 1.90237 12.7071 2.29289Z"
        fill="currentColor"
      />
    </svg>
  );
}
