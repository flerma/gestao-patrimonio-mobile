export type ToastKind = "success" | "error" | "info";

type Handler = (kind: ToastKind, message: string) => void;

let handler: Handler | null = null;

export function setToastHandler(fn: Handler | null) {
  handler = fn;
}

export const toast = {
  success: (message: string) => handler?.("success", message),
  error: (message: string) => handler?.("error", message),
  info: (message: string) => handler?.("info", message),
};
