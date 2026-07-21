import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";
import { SUCCESS_TOAST_DURATION } from "@/lib/app-toast";

const Toaster = ({ className, icons, toastOptions, ...rest }: ToasterProps) => {
  return (
    <Sonner
      {...rest}
      theme="light"
      className={cn(
        "toaster group !z-[110] w-full px-4",
        className
      )}
      position="top-center"
      closeButton
      offset="calc(1rem + env(safe-area-inset-top, 0px))"
      gap={12}
      duration={SUCCESS_TOAST_DURATION}
      richColors={false}
      visibleToasts={2}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: cn(
            "group w-full !items-start !gap-3",
            "rounded-xl border p-4 pr-12",
            "border-border/90 bg-card/95 text-foreground shadow-lg",
            "text-left !shadow-[0_10px_40px_-12px_rgba(0,0,0,0.2),0_0_0_1px_hsl(var(--border)/0.5)]",
            "backdrop-blur-sm supports-[backdrop-filter]:bg-card/90",
            toastOptions?.classNames?.toast
          ),
          title: cn(
            "text-[0.9375rem] font-semibold leading-snug text-foreground",
            toastOptions?.classNames?.title
          ),
          description: cn(
            "text-[0.8125rem] font-normal leading-relaxed text-muted-foreground",
            "mt-0.5",
            toastOptions?.classNames?.description
          ),
          content: cn("!items-start !gap-2", toastOptions?.classNames?.content),
          icon: cn("!mt-0.5 !size-5 !shrink-0", toastOptions?.classNames?.icon),
          closeButton: cn(
            "!left-auto !right-2 !top-2 !flex !h-10 !w-10 !transform-none !items-center !justify-center !border-0 !bg-transparent !p-0",
            "text-muted-foreground opacity-80",
            "rounded-md transition-colors hover:opacity-100 active:opacity-100",
            "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "[&_svg]:!h-[18px] [&_svg]:!w-[18px] [&_svg]:!shrink-0 [&_svg]:stroke-[2]",
            toastOptions?.classNames?.closeButton
          ),
          success: cn("!border-emerald-200/90 !bg-emerald-50/95", toastOptions?.classNames?.success),
          error: cn("!border-destructive/30 !bg-destructive/10", toastOptions?.classNames?.error),
          warning: cn("!border-amber-200/90 !bg-amber-50/95", toastOptions?.classNames?.warning),
          info: cn("!border-primary/20 !bg-primary/5", toastOptions?.classNames?.info),
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-5 text-emerald-600" strokeWidth={2} aria-hidden />,
        error: <AlertCircle className="size-5 text-destructive" strokeWidth={2} aria-hidden />,
        warning: <AlertCircle className="size-5 text-amber-600" strokeWidth={2} aria-hidden />,
        info: <Info className="size-5 text-primary" strokeWidth={2} aria-hidden />,
        loading: <Loader2 className="size-5 animate-spin text-primary" strokeWidth={2} aria-hidden />,
        ...icons,
      }}
    />
  );
};

export { Toaster };
