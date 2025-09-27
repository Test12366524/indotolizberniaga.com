"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentHistory, Pinjaman } from "@/types/admin/pinjaman";
import { useGetPinjamanListQuery } from "@/services/admin/pinjaman.service";

interface FormPaymentProps {
  form: Partial<PaymentHistory>;
  setForm: (data: Partial<PaymentHistory>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormPayment({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormPaymentProps) {
  const [selectedPinjaman, setSelectedPinjaman] = useState<number | null>(null);

  // Get pinjaman list for dropdown
  const { data: pinjamanData } = useGetPinjamanListQuery({
    page: 1,
    paginate: 100,
  });

  const pinjamanList = pinjamanData?.data || [];

  useEffect(() => {
    if (form.pinjaman_id) {
      setSelectedPinjaman(form.pinjaman_id);
    }
  }, [form.pinjaman_id]);

  const handlePinjamanChange = (pinjamanId: number) => {
    setSelectedPinjaman(pinjamanId);
    setForm({ ...form, pinjaman_id: pinjamanId });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-3xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Pembayaran"
            : form.id
            ? "Edit Pembayaran"
            : "Tambah Pembayaran"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pinjaman */}
        <div className="flex flex-col gap-y-1">
          <Label>Pinjaman *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedPinjaman || ""}
            onChange={(e) => handlePinjamanChange(Number(e.target.value))}
            disabled={readonly}
            aria-label="Pinjaman"
          >
            <option value="">Pilih Pinjaman</option>
            {pinjamanList.map((pinjaman) => (
              <option key={pinjaman.id} value={pinjaman.id}>
                {pinjaman.user?.name} - Rp {pinjaman.nominal?.toLocaleString('id-ID')}
              </option>
            ))}
          </select>
        </div>

        {/* Pinjaman Detail ID */}
        <div className="flex flex-col gap-y-1">
          <Label>ID Detail Pinjaman *</Label>
          <Input
            type="number"
            value={form.pinjaman_detail_id || ""}
            onChange={(e) => setForm({ ...form, pinjaman_detail_id: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan ID detail pinjaman"
          />
        </div>

        {/* Jumlah Pembayaran */}
        <div className="flex flex-col gap-y-1">
          <Label>Jumlah Pembayaran *</Label>
          <Input
            type="number"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan jumlah pembayaran"
          />
        </div>

        {/* Tipe Pembayaran */}
        <div className="flex flex-col gap-y-1">
          <Label>Tipe Pembayaran *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.type || ""}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'manual' | 'automatic' })}
            disabled={readonly}
            aria-label="Tipe pembayaran"
          >
            <option value="">Pilih Tipe</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>

        {/* Upload Gambar (hanya untuk manual) */}
        {form.type === 'manual' && (
          <div className="flex flex-col gap-y-1 md:col-span-2">
            <Label>Upload Gambar Bukti Pembayaran</Label>
            {readonly ? (
              form.image ? (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Bukti pembayaran"
                    className="h-32 w-auto object-contain border rounded"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500">Tidak ada gambar</span>
              )
            ) : (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, image: file });
                }}
              />
            )}
          </div>
        )}

        {/* Status (readonly) */}
        {form.status && (
          <div className="flex flex-col gap-y-1">
            <Label>Status</Label>
            <Input
              value={form.status}
              readOnly
              className="bg-gray-100 dark:bg-zinc-700"
            />
          </div>
        )}

        {/* ID (readonly) */}
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

        {/* Created At (readonly) */}
        {form.created_at && (
          <div className="flex flex-col gap-y-1">
            <Label>Dibuat</Label>
            <Input
              value={new Date(form.created_at).toLocaleString('id-ID')}
              readOnly
              className="bg-gray-100 dark:bg-zinc-700"
            />
          </div>
        )}

        {/* Updated At (readonly) */}
        {form.updated_at && (
          <div className="flex flex-col gap-y-1">
            <Label>Diperbarui</Label>
            <Input
              value={new Date(form.updated_at).toLocaleString('id-ID')}
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
