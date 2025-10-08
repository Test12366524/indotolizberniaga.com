"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProductCategory } from "@/types/ppob/product-category";
import Image from "next/image";

interface FormProductCategoryProps {
  form: Partial<ProductCategory>;
  setForm: (data: Partial<ProductCategory>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormProductCategory({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormProductCategoryProps) {
  useEffect(() => {
    if (!form.id && (form.status === undefined)) {
      setForm({
        ...form,
        status: form.status ?? true,
      });
    }
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Kategori Produk"
            : form.id
            ? "Edit Kategori Produk"
            : "Tambah Kategori Produk"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Judul</Label>
          <Input
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            readOnly={readonly}
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Digiflazz Code</Label>
          <Input
            value={form.digiflazz_code || ""}
            onChange={(e) => setForm({ ...form, digiflazz_code: e.target.value })}
            readOnly={readonly}
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Status</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.status ? "1" : "0"}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value === "1" })
            }
            disabled={readonly}
          >
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
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