import type { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export const SUCCESS_TOAST_DURATION = 2400;
const ERROR_TOAST_DURATION = 4000;

const withDefaultDuration = (
  type: "success" | "error" | "info" | "warning",
  message: ReactNode,
  duration: number,
  options?: ExternalToast,
): ExternalToast => ({
  ...options,
  id:
    options?.id ??
    (typeof message === "string" ? `${type}:${message}` : undefined),
  duration: options?.duration ?? duration,
});

export const toast = {
  success(message: ReactNode, options?: ExternalToast) {
    return sonnerToast.success(
      message,
      withDefaultDuration("success", message, SUCCESS_TOAST_DURATION, options),
    );
  },
  error(message: ReactNode, options?: ExternalToast) {
    return sonnerToast.error(
      message,
      withDefaultDuration("error", message, ERROR_TOAST_DURATION, options),
    );
  },
  info(message: ReactNode, options?: ExternalToast) {
    return sonnerToast.info(
      message,
      withDefaultDuration("info", message, SUCCESS_TOAST_DURATION, options),
    );
  },
  warning(message: ReactNode, options?: ExternalToast) {
    return sonnerToast.warning(
      message,
      withDefaultDuration("warning", message, ERROR_TOAST_DURATION, options),
    );
  },
  dismiss: sonnerToast.dismiss,
};
