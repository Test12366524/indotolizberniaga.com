// components/ppob/history/PPOBStatusBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type StatusKey = -3 | -2 | -1 | 0 | 1 | 2;

const STATUS_INFO: Record<
  StatusKey,
  { label: string; desc: string; cls: string }
> = {
  0: {
    label: "PENDING",
    desc: "Menunggu pembayaran",
    cls: "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-zinc-100",
  },
  1: {
    label: "CAPTURED",
    desc: "Instruksi dibuat / menunggu bayar",
    cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
  2: {
    label: "SETTLEMENT",
    desc: "Pembayaran selesai",
    cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  },
  [-1]: {
    label: "DENY",
    desc: "Pembayaran ditolak",
    cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
  [-2]: {
    label: "EXPIRED",
    desc: "Pembayaran kedaluwarsa",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  [-3]: {
    label: "CANCEL",
    desc: "Transaksi dibatalkan",
    cls: "bg-gray-100 text-gray-700 dark:bg-zinc-800/60 dark:text-zinc-200",
  },
};

export default function PPOBStatusBadge({
  status,
  statusTopup,
}: {
  status: number;
  statusTopup?: number;
}) {
  const main = STATUS_INFO[status as StatusKey];
  return (
    <div className="whitespace-nowrap">
      {main ? (
        <>
          <Badge
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${main.cls}`}
          >
            {main.label}
          </Badge>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {main.desc}
          </div>
        </>
      ) : (
        <span className="text-xs">Unknown ({status})</span>
      )}

      {typeof statusTopup === "number" && (
        <div className="mt-2 text-[11px] text-gray-500">
          Status Topup: <strong>{statusTopup}</strong>
        </div>
      )}
    </div>
  );
}