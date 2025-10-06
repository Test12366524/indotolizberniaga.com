"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PinjamanCategory } from "@/types/master/pinjaman-category";

interface FormPinjamanCategoryProps {
  form: Partial<PinjamanCategory>;
  setForm: (data: Partial<PinjamanCategory>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormPinjamanCategory({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormPinjamanCategoryProps) {
  useEffect(() => {
    if (!form.id && form.status === undefined) {
      setForm({
        ...form,
        status: 1,
        type: 'admin',
        admin_fee: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, form.status]);

  // Handle type change - clear margin when switching to 'admin'
  useEffect(() => {
    if (form.type === 'admin' && form.margin !== undefined) {
      setForm({ ...form, margin: undefined });
    } else if (form.type === 'admin+margin' && form.margin === undefined) {
      setForm({ ...form, margin: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Kategori Pinjaman"
            : form.id
            ? "Edit Kategori Pinjaman"
            : "Tambah Kategori Pinjaman"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-1">
          <Label>Kode</Label>
          <Input
            value={form.code || ""}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan kode kategori"
          />
        </div>

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
          <Label>Tipe</Label>
          <Select
            value={form.type || 'admin'}
            onValueChange={(value: 'admin' | 'admin+margin') => setForm({ ...form, type: value })}
            disabled={readonly}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Biaya Admin</SelectItem>
              <SelectItem value="admin+margin">Margin + Biaya Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Biaya Admin (Rp)</Label>
          <Input
            type="number"
            value={form.admin_fee || ""}
            onChange={(e) => setForm({ ...form, admin_fee: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan biaya admin"
            min="0"
          />
        </div>

        {form.type === 'admin+margin' && (
          <div className="flex flex-col gap-y-1">
            <Label>Margin (%)</Label>
            <Input
              type="number"
              value={form.margin || ""}
              onChange={(e) => setForm({ ...form, margin: Number(e.target.value) })}
              readOnly={readonly}
              placeholder="Masukkan persentase margin"
              min="0"
              step="0.01"
            />
          </div>
        )}

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi kategori"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Status</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.status ?? 1}
            onChange={(e) => {
              const newStatus = Number(e.target.value);
              setForm({ ...form, status: newStatus });
            }}
            disabled={readonly}
            aria-label="Status kategori pinjaman"
          >
            <option value={1}>Aktif</option>
            <option value={0}>Nonaktif</option>
          </select>
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
