"use client";

import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Landmark, Star, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  useGetUserBankListQuery,
  useDeleteUserBankMutation,
} from "@/services/koperasi-service/user-bank.service";
import type { UserBank } from "@/types/koperasi-types/user-bank";
import UserBankProfileForm from "./user-bank-profile-form";
import { cn } from "@/lib/utils";
import { displayDate } from "@/lib/format-utils";

type Props = {
  userId?: number | null;
  userName?: string;
  userEmail?: string;
};

export default function BankAccountsTab({
  userId,
  userName,
  userEmail,
}: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useGetUserBankListQuery(
    { page, paginate: 12, search, user_id: userId ?? undefined },
    { skip: !userId, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const list = useMemo<UserBank[]>(() => data?.data ?? [], [data]);
  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const [openForm, setOpenForm] = useState<{
    open: boolean;
    mode: "add" | "edit";
    initial?: UserBank;
  }>({ open: false, mode: "add" });

  const [del] = useDeleteUserBankMutation();

  const handleDelete = async (item: UserBank) => {
    const c = await Swal.fire({
      title: "Hapus rekening?",
      text: `${item.bank} • ${item.account_number} (${item.account_name})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!c.isConfirmed) return;
    try {
      await del({ id: item.id }).unwrap();
      await refetch();
      Swal.fire("Berhasil", "Rekening dihapus", "success");
    } catch {
      Swal.fire("Gagal", "Tidak dapat menghapus rekening", "error");
    }
  };

  if (!userId) {
    return (
      <div className="text-gray-600">
        Session user belum tersedia. Silakan muat ulang halaman.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekening Bank</h2>
          <p className="text-gray-600">
            Kelola rekening bank Anda untuk keperluan pembayaran & penarikan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setOpenForm({ open: true, mode: "add" })}
            className="gap-2"
            title="Tambah rekening"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Cari bank / nama / nomor rekening…"
          className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B6B6B] focus:border-transparent"
        />
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl p-5 animate-pulse overflow-hidden"
            >
              <div className="h-6 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#6B6B6B]/10 mx-auto mb-4 flex items-center justify-center">
              <Landmark className="w-8 h-8 text-[#6B6B6B]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Belum ada rekening
            </h3>
            <p className="text-gray-600">
              Tambahkan rekening bank untuk mempermudah transaksi.
            </p>
          </div>
        ) : (
          list.map((it) => (
            <div
              key={it.id}
              className={cn(
                "border rounded-2xl p-5 transition-all overflow-hidden", // ⬅️ penting: overflow-hidden
                Number(it.is_primary) === 1
                  ? "border-[#6B6B6B] bg-[#6B6B6B]/5"
                  : "border-gray-200 hover:border-[#6B6B6B]/60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6B6B6B]/10 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{it.bank}</h3>
                      {Number(it.is_primary) === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          <Star className="w-3 h-3" />
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Dibuat {displayDate(it.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1 mb-4">
                <div className="text-sm text-gray-700">
                  Atas Nama:{" "}
                  <span className="font-semibold">{it.account_name}</span>
                </div>
                <div className="text-sm text-gray-700">
                  No. Rekening:{" "}
                  <span className="font-semibold">{it.account_number}</span>
                </div>
                {it.description ? (
                  <div className="text-sm text-gray-600 italic pt-1">
                    “{it.description}”
                  </div>
                ) : null}
              </div>

              {/* Actions (footer dalam kartu) */}
              <div className="pt-4 mt-auto border-t border-gray-200 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2 focus-visible:ring-0 focus-visible:ring-offset-0" // ⬅️ ring tidak keluar border
                  onClick={() =>
                    setOpenForm({ open: true, mode: "edit", initial: it })
                  }
                >
                  <Pencil className="w-4 h-4" />
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-9 gap-2 focus-visible:ring-0 focus-visible:ring-offset-0" // ⬅️ ring tidak keluar border
                  onClick={() => void handleDelete(it)}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            Halaman <b>{page}</b> dari <b>{lastPage}</b>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <UserBankProfileForm
        open={openForm.open}
        mode={openForm.mode}
        initialData={openForm.initial}
        presetUserId={userId ?? undefined}
        userLabel={`${userName ?? "User"}${userEmail ? ` (${userEmail})` : ""}`}
        onClose={(changed) => {
          setOpenForm({ open: false, mode: "add", initial: undefined });
          if (changed) void refetch();
        }}
      />
    </div>
  );
}