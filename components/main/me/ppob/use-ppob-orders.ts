"use client";

import { useMemo, useState } from "react";
import { useGetTransaksiListQuery } from "@/services/ppob/transaksi.service";
import type { Transaksi } from "@/types/ppob/transaksi";

export type UsePPOBOrdersOpts = {
  userId?: number; // hanya untuk filter client-side
  perPage?: number;
};

export default function usePPOBOrders({
  userId,
  perPage = 10,
}: UsePPOBOrdersOpts) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetTransaksiListQuery(
    { page, paginate: perPage, search: query || undefined },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // list dasar dari server (sudah pasti array Transaksi)
  const baseList: Transaksi[] = useMemo(() => data?.data ?? [], [data]);

  // (opsional) filter per user di client
  const userFiltered: Transaksi[] = useMemo(() => {
    if (!userId) return baseList;
    return baseList.filter((t) => t.user_id === userId);
  }, [baseList, userId]);

  // (tambahan) filter lokal ringan (kalau mau tetap ada meski sudah kirim search ke server)
  const list: Transaksi[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return userFiltered;
    return userFiltered.filter((it) =>
      [
        it.reference,
        it.order_id,
        it.customer_no,
        it.customer_name ?? "",
        it.product_details?.name ?? it.product?.name ?? "",
      ]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [userFiltered, query]);

  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const currency = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return {
    page,
    setPage,
    lastPage,
    query,
    setQuery,
    isLoading,
    refetch,
    list,
    rawList: baseList,
    currency,
  };
}