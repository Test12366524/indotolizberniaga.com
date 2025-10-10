"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import PPOBOrdersTable from "./ppob-orders-table";
import usePPOBOrders from "./use-ppob-orders";
import { CreditCard } from "lucide-react";

export default function PPOBOrdersTab({ userId }: { userId?: number }) {
  const {
    page,
    setPage,
    lastPage,
    query,
    setQuery,
    isLoading,
    refetch,
    list,
    currency,
  } = usePPOBOrders({ userId, perPage: 10 });

  useEffect(() => {
    // ketika tab ini dibuka, ambil data terbaru
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#6B6B6B] rounded-2xl flex items-center justify-center text-white">
          <CreditCard className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Riwayat Pesanan PPOB
        </h2>
      </div>

      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Cari reference / order / pelanggan / produk…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <div className="text-sm text-gray-500">
            Menampilkan {list.length} entri
          </div>
        </div>
      </div>

      <PPOBOrdersTable
        data={list}
        isLoading={isLoading}
        page={page}
        lastPage={lastPage}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
        currency={currency}
      />
    </div>
  );
}