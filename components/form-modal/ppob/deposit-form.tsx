"use client";

import { useEffect } from "react";
// Asumsi komponen ini diimpor dari UI library seperti shadcn/ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Textarea tidak digunakan lagi di sini, dihapus dari import
// Import Tipe dan Utility
import { Deposit } from "@/types/ppob/deposit";
// PATH INI SEKARANG SUDAH TERSAJI BERKAT FILE BARU
import { formatRupiah, parseRupiah } from "@/lib/format-utils"; 

interface FormDepositProps {
  form: Partial<Deposit>;
  setForm: (data: Partial<Deposit>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormDeposit({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormDepositProps) {

  // Daftar bank yang tersedia untuk dipilih
  const banks = ["BCA", "MANDIRI", "BRI", "BNI"];

  useEffect(() => {
    if (!form.id) {
      setForm({
        ...form, // Atur status default jika ini form tambah baru
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 w-full max-w-2xl space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {readonly
            ? "Detail Deposit"
            : form.id
            ? "Edit Deposit"
            : "Tambah Deposit Baru"}
        </h2>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Pilihan Bank (Full Width) */}
        <div className="flex flex-col gap-y-2">
          <Label className="font-semibold text-gray-700 dark:text-gray-200">Pilih Bank Transfer</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {banks.map((bankName) => (
              <button
                key={bankName}
                onClick={() => !readonly && setForm({ ...form, bank: bankName })}
                disabled={readonly}
                type="button"
                className={`
                  p-4 border rounded-lg transition-all text-center font-semibold text-sm
                  ${readonly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer shadow-sm active:scale-[0.98]'}
                  ${form.bank === bankName
                    ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  }
                `}
              >
                {bankName}
              </button>
            ))}
          </div>
        </div>

        {/* Owner Name dan Nominal (Berada dalam 1 Baris di Layar Lebar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <Label className="text-gray-700 dark:text-gray-200">Owner Name</Label>
            <Input
              value={form.owner_name || ""}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              readOnly={readonly}
              placeholder="Masukkan nama pemilik rekening"
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Label className="text-gray-700 dark:text-gray-200">Nominal (Rp)</Label>
            <Input
              type="text" // Menggunakan text untuk menampilkan format Rupiah
              value={formatRupiah(form.amount || 0)}
              onChange={(e) => {
                // Gunakan parseRupiah untuk mendapatkan nilai angka murni
                const rawValue = parseRupiah(e.target.value);
                setForm({ ...form, amount: rawValue });
              }}
              readOnly={readonly}
              placeholder="Masukkan nominal deposit (e.g., 100.000)"
            />
          </div>
        </div>
      </div>

      {!readonly && (
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !form.bank || !form.owner_name || !form.amount}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}
