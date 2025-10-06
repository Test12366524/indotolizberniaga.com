import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ApiErrorPayload = {
  code?: number;
  message?: string;
  errors?: Record<string, string[] | string>;
};

function isFetchBaseQueryError(
  err: unknown
): err is FetchBaseQueryError & { data?: unknown } {
  return typeof err === "object" && err !== null && "status" in err;
}

function isSerializedError(err: unknown): err is SerializedError {
  return typeof err === "object" && err !== null && "message" in err;
}

function normalizeApiErrors(
  errors?: Record<string, string[] | string>
): string {
  if (!errors) return "";
  const lines: string[] = [];
  Object.entries(errors).forEach(([field, msgs]) => {
    if (Array.isArray(msgs)) {
      msgs.forEach((m) => lines.push(`• ${field}: ${m}`));
    } else if (typeof msgs === "string") {
      lines.push(`• ${field}: ${msgs}`);
    }
  });
  return lines.join("\n");
}

export function extractErrorMessage(err: unknown): string {
  // 1) RTK FetchBaseQueryError
  if (isFetchBaseQueryError(err)) {
    const data = (err as FetchBaseQueryError & { data?: ApiErrorPayload }).data;
    if (data && typeof data === "object") {
      const payload = data as ApiErrorPayload;
      const main = payload.message || "Terjadi kesalahan pada server.";
      const detail = normalizeApiErrors(payload.errors);
      return detail ? `${main}\n\n${detail}` : main;
    }
    // non-JSON or no data
    const statusText =
      typeof (err as FetchBaseQueryError).status === "number"
        ? `HTTP ${(err as FetchBaseQueryError).status}`
        : String((err as FetchBaseQueryError).status);
    return `Permintaan gagal (${statusText}).`;
  }

  // 2) RTK SerializedError
  if (isSerializedError(err)) {
    return err.message ?? "Terjadi kesalahan.";
  }

  // 3) Fallback
  if (err instanceof Error) {
    return err.message;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return "Terjadi kesalahan yang tidak diketahui.";
  }
}