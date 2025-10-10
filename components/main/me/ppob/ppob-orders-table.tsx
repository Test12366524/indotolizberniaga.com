"use client";

import PPOBStatusBadge from "./ppob-status-badge";
import { Button } from "@/components/ui/button";
import { displayDate } from "@/lib/format-utils";
import type { Transaksi } from "@/types/ppob/transaksi";

export default function PPOBOrdersTable({
  data,
  isLoading,
  page,
  lastPage,
  onPrev,
  onNext,
  currency,
}: {
  data: ReadonlyArray<Transaksi>;
  isLoading: boolean;
  page: number;
  lastPage: number;
  onPrev: () => void;
  onNext: () => void;
  currency: (n: number) => string;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">No Pelanggan</th>
              <th className="px-4 py-2">Produk</th>
              <th className="px-4 py-2">Harga</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{it.reference}</td>
                  <td className="px-4 py-2">{it.order_id}</td>
                  <td className="px-4 py-2">{it.customer_no}</td>
                  <td className="px-4 py-2">
                    {it.product_details?.name ?? it.product?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2">{currency(it.amount)}</td>
                  <td className="px-4 py-2 align-top">
                    <PPOBStatusBadge
                      status={it.status}
                      statusTopup={it.status_topup}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                    {displayDate(it.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 flex items-center justify-between bg-muted rounded-xl">
        <div className="text-sm">
          Halaman <strong>{page}</strong> dari <strong>{lastPage}</strong>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={onPrev}>
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={page >= lastPage}
            onClick={onNext}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}