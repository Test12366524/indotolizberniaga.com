"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PenarikanSimpanan } from "@/types/admin/penarikan-simpanan";
import { useGetWalletListQuery } from "@/services/admin/penarikan-simpanan.service";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";
import { formatRupiah, parseRupiah } from "@/lib/format-utils";

interface FormPinjamanCategoryProps {
  form: Partial<PenarikanSimpanan>;
  setForm: (data: Partial<PenarikanSimpanan>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormPenarikanSimpanan({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormPinjamanCategoryProps) {
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const { data: walletData } = useGetWalletListQuery({
    page: 1,
    paginate: 100,
  });
  const { data: usersData } = useGetAnggotaListQuery({
    page: 1,
    paginate: 100,
    status: 1,
  });

  const wallets = walletData?.data || [];
  const users = usersData?.data || [];

  const handleWalletChange = (walletId: number) => {
    setSelectedWallet(walletId);
    setForm({ ...form, wallet_id: walletId });
  };

  const handleUserChange = (userId: number) => {
    setSelectedUser(userId);
    setForm({ ...form, user_id: userId });
  };

  useEffect(() => {
    if (form.wallet_id) {
      setSelectedWallet(form.wallet_id);
    }
    if (form.user_id) {
      setSelectedUser(form.user_id);
    }
  }, [form.wallet_id, form.user_id]);

  useEffect(() => {
    if (!form.id && form.status === undefined) {
      setForm({
        ...form,
        status: 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, form.status]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Penarikan Simpanan"
            : form.id
            ? "Edit Penarikan Simpanan"
            : "Tambah Penarikan Simpanan"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-1">
          <Label>Wallet *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedWallet || ""}
            onChange={(e) => handleWalletChange(Number(e.target.value))}
            disabled={readonly}
            aria-label="Kategori pinjaman"
          >
            <option value="">Pilih Wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Anggota *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedUser || ""}
            onChange={(e) => handleUserChange(Number(e.target.value))}
            disabled={readonly || !!form.id}
            aria-label="Anggota"
          >
            <option value="">Pilih Anggota</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nama Bank</Label>
          <Input
            value={form.bank_name || ""}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan Nama Bank"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nama Pemilik Rekening</Label>
          <Input
            value={form.bank_account_name || ""}
            onChange={(e) =>
              setForm({ ...form, bank_account_name: e.target.value })
            }
            readOnly={readonly}
            placeholder="Masukkan nama pemilik rekening"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nomor Rekening</Label>
          <Input
            value={form.bank_account_number || ""}
            onChange={(e) =>
              setForm({ ...form, bank_account_number: e.target.value })
            }
            readOnly={readonly}
            placeholder="Masukkan nomor rekening"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nominal</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={formatRupiah(form.amount ?? "")}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = parseRupiah(raw);
              setForm({
                ...form,
                amount: raw === "" ? undefined : parsed,
              });
            }}
            readOnly={readonly}
            placeholder="Masukkan nominal simpanan"
          />
        </div>

        <div className="flex flex-col gap-y-1 md:col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi penarikan (opsional)"
            rows={3}
          />
        </div>

        {form.id && (
          <div className="flex flex-col gap-y-1">
            <Label>ID</Label>
            <Input
              value={form.id}
              readOnly
              className="bg-gray-100 dark:bg-zinc-700"
            />
          </div>
        )}

        {form.created_at && (
          <div className="flex flex-col gap-y-1">
            <Label>Dibuat</Label>
            <Input
              value={new Date(form.created_at).toLocaleString("id-ID")}
              readOnly
              className="bg-gray-100 dark:bg-zinc-700"
            />
          </div>
        )}

        {form.updated_at && (
          <div className="flex flex-col gap-y-1">
            <Label>Diperbarui</Label>
            <Input
              value={new Date(form.updated_at).toLocaleString("id-ID")}
              readOnly
              className="bg-gray-100 dark:bg-zinc-700"
            />
          </div>
        )}
      </div>

      {!readonly && (
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}
