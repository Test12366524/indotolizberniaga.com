"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types/master/supplier";
import { formatRupiah, parseRupiah } from "@/lib/format-utils";

interface FormSupplierProps {
  form: Partial<Supplier>;
  setForm: (data: Partial<Supplier>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormSupplier({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormSupplierProps) {
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
            ? "Detail Supplier"
            : form.id
            ? "Edit Supplier"
            : "Tambah Supplier"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-1">
          <Label>Nama</Label>
          <Input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan nama kategori"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan email supplier"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Telepon</Label>
          <Input
            type="tel"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan telepon supplier"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Status</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.status ?? 1}
            onChange={(e) => {
              const newStatus = Number(e.target.value);
              setForm({ ...form, status: newStatus });
            }}
            disabled={readonly}
            aria-label="Status Supplier"
          >
            <option value={1}>Aktif</option>
            <option value={0}>Nonaktif</option>
          </select>
        </div>

        <div className="flex flex-col gap-y-1 sm:col-span-2">
          <Label>Alamat</Label>
          <Textarea
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan alamat supplier"
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
