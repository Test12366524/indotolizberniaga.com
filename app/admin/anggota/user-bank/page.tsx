// app/anggota/user-bank/page.tsx
"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useGetUserBankListQuery,
  useDeleteUserBankMutation,
} from "@/services/koperasi-service/user-bank.service";
import type { UserBank } from "@/types/koperasi-types/user-bank";
import UserBankForm from "@/components/form-modal/koperasi-modal/user-bank-form";
import { Badge } from "@/components/ui/badge";
import { displayDate } from "@/lib/format-utils";

function InnerPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const urlUserId = sp.get("user_id");
  const presetUserId = urlUserId ? Number(urlUserId) : undefined;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  // Wajib ada user_id dari URL
  const { data, isLoading, refetch } = useGetUserBankListQuery(
    {
      page: currentPage,
      paginate: 10,
      search,
      user_id: presetUserId,
    },
    {
      skip: !presetUserId, // jangan fetch sebelum user_id tersedia
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const list = useMemo<UserBank[]>(() => data?.data ?? [], [data]);
  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const [openForm, setOpenForm] = useState<{
    open: boolean;
    mode: "add" | "edit";
    initial?: UserBank | undefined;
  }>({ open: false, mode: "add", initial: undefined });

  const [deleteUserBank] = useDeleteUserBankMutation();

  const handleDelete = async (item: UserBank) => {
    const confirm = await Swal.fire({
      title: "Hapus Rekening?",
      text: `${item.bank} - ${item.account_number} (${item.account_name})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteUserBank({ id: item.id }).unwrap();
      await refetch();
      Swal.fire("Berhasil", "Rekening dihapus", "success");
    } catch (e) {
      Swal.fire("Gagal", "Tidak dapat menghapus rekening", "error");
    }
  };

  // Guard UX jika user_id tidak ada
  if (!presetUserId) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-base">
          Parameter <b>user_id</b> tidak ditemukan. Silakan kembali ke halaman
          Anggota dan pilih tombol <i>User Bank</i> pada anggota yang
          diinginkan.
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Cari bank / nama / nomor rekening…"
            className="h-10 w-[260px]"
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              setOpenForm({ open: true, mode: "add", initial: undefined })
            }
          >
            Tambah Rekening
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Bank</th>
                <th className="px-4 py-2 whitespace-nowrap">Atas Nama</th>
                <th className="px-4 py-2 whitespace-nowrap">Nomor Rekening</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Primary</th>
                <th className="px-4 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                list.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setOpenForm({
                              open: true,
                              mode: "edit",
                              initial: it,
                            })
                          }
                        >
                          Ubah
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDelete(it)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {it.user_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{it.bank}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {it.account_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {it.account_number}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {it.description}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {Number(it.is_primary) === 1 ? (
                        <Badge variant="success">Ya</Badge>
                      ) : (
                        <Badge variant="secondary">Tidak</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {displayDate(it.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Form */}
      <UserBankForm
        open={openForm.open}
        mode={openForm.mode}
        initialData={openForm.initial}
        presetUserId={presetUserId}
        onClose={(changed) => {
          setOpenForm({ open: false, mode: "add", initial: undefined });
          if (changed) void refetch();
        }}
      />
    </div>
  );
}

export default function UserBankPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat...</div>}>
      <InnerPage />
    </Suspense>
  );
}