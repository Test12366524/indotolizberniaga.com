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
import { Combobox } from "../ui/combo-box";
import BankNamePicker from "../ui/bank-name-picker";

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

  const [anggotaSearch, setAnggotaSearch] = useState<string>("");

  // ✅ Ambil anggota: default 10 dulu, status=1
  const { data: usersData, isFetching: isFetchingUsers } =
    useGetAnggotaListQuery({
      page: 1,
      paginate: 10,
      status: 1,
      ...(anggotaSearch.length >= 2 ? { search: anggotaSearch } : {}),
    });

  // ✅ Ambil wallet: terfilter by user_id anggota terpilih
  const { data: walletData, isFetching: isFetchingWallets } =
    useGetWalletListQuery(
      {
        page: 1,
        paginate: 100,
        user_id: selectedUser ?? undefined, // ⬅️ filter sesuai anggota
      },
      {
        skip: !selectedUser, // ⬅️ jangan fetch kalau belum pilih anggota
      }
    );

  const users = usersData?.data || [];
  const wallets = walletData?.data || [];

  const handleWalletChange = (walletId: number) => {
    setSelectedWallet(walletId);
    setForm({ ...form, wallet_id: walletId });
  };

  const handleUserChange = (userId: number) => {
    setSelectedUser(userId);
    // reset wallet saat ganti anggota agar tidak tercampur
    setSelectedWallet(null);
    setForm({ ...form, user_id: userId, wallet_id: undefined });
  };

  useEffect(() => {
    if (form.wallet_id) setSelectedWallet(form.wallet_id);
    if (form.user_id) setSelectedUser(form.user_id);
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
        {/* 🔽 Anggota: pakai Combobox */}
        <div className="flex flex-col gap-y-1">
          <Label>Anggota *</Label>
          <Combobox
            value={selectedUser ?? null}
            onChange={handleUserChange}
            onSearchChange={setAnggotaSearch} // ⬅️ akan refetch jika ≥ 2 huruf
            data={users}
            isLoading={isFetchingUsers}
            placeholder="Pilih Anggota"
            getOptionLabel={(item: {
              id: number;
              name?: string;
              email?: string;
            }) =>
              `${item?.name ?? `ID:${item.id}`}${
                item?.email ? ` (${item.email})` : ""
              }`
            }
            disabled={readonly}
          />
        </div>

        {/* 🔽 Wallet: otomatis terfilter berdasarkan anggota terpilih */}
        <div className="flex flex-col gap-y-1">
          <Label>Wallet *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedWallet || ""}
            onChange={(e) => handleWalletChange(Number(e.target.value))}
            disabled={readonly || !selectedUser || isFetchingWallets}
            aria-label="Wallet anggota"
          >
            <option value="">
              {!selectedUser
                ? "Pilih Anggota terlebih dahulu"
                : isFetchingWallets
                ? "Memuat wallet..."
                : "Pilih Wallet"}
            </option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nama Bank</Label>
          <BankNamePicker
            value={form.bank_name}
            onChange={(val) => setForm({ ...form, bank_name: val })}
            disabled={readonly}
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