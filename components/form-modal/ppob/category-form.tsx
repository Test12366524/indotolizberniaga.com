"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useGetProductCategoryListQuery,
} from "@/services/ppob/category.service";
import { ProductCategory } from "@/types/ppob/product-category";
import Image from "next/image";

// Tipe data untuk daftar kategori yang akan digunakan di dropdown
type CategoryOption = {
  id: number;
  title: string;
};

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

  // --- PEMANGGILAN HOOK DI TOP LEVEL ---
  // Kita hanya perlu mengambil semua data kategori untuk dropdown parent_id.
  // Gunakan page: 1, paginate: 1000 atau nilai besar lain untuk memastikan semua data terambil.
  const { data: categoryData, isLoading: isCategoriesLoading } = useGetProductCategoryListQuery({
    page: 1,
    paginate: 1000, // Mengambil jumlah besar untuk dropdown
  });

  // Data kategori untuk dropdown
  const categoryOptions: CategoryOption[] = (categoryData?.data || [])
    // Filter kategori saat ini jika sedang mengedit, agar kategori tidak bisa menjadi parent dari dirinya sendiri
    .filter(cat => cat.id !== form.id) 
    .map(cat => ({
      id: cat.id,
      title: cat.title,
    }));
  
  // Tambahkan opsi "Tidak Ada Parent" di awal
  const parentIdOptions = [
    { id: 0, title: "Tidak Ada (Kategori Utama)" },
    ...categoryOptions,
  ];
  
  // --- LOGIC EFFECT UNTUK INISIALISASI FORM ---
  useEffect(() => {
    // Tetapkan status default hanya jika formulir adalah form 'Tambah' (tidak punya ID)
    // DAN status belum ditetapkan (undefined)
    if (!form.id && form.status === undefined) {
      setForm({
        ...form,
        status: true,
        // Set default parent_id ke null atau 0 untuk "Tidak Ada Parent"
        parent_id: form.parent_id ?? 0, 
      });
    } else if (form.id) {
        // Jika sedang Edit, pastikan parent_id adalah 0 jika null/undefined
        setForm({
            ...form,
            parent_id: form.parent_id ?? 0,
        });
    }
  }, [form.id, form.status, setForm]);


  const handleParentIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    // Jika value adalah 0, set parent_id menjadi null di form (kategori utama)
    // Jika value > 0, set parent_id ke ID yang dipilih
    setForm({ ...form, parent_id: value === 0 ? null : value });
  };


  // Nilai yang akan ditampilkan di dropdown (0 jika parent_id null atau undefined)
  const dropdownValue = form.parent_id ?? 0;

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
        {/* Dropdown Parent ID */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="parent_id">Kategori Parent</Label>
          <select
            id="parent_id"
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 disabled:bg-gray-100 disabled:opacity-70"
            value={dropdownValue}
            onChange={handleParentIdChange}
            disabled={readonly || isCategoriesLoading}
          >
            {isCategoriesLoading ? (
                <option value={0} disabled>Memuat Kategori...</option>
            ) : (
                parentIdOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.title}
                    </option>
                ))
            )}
          </select>
        </div>
        
        {/* Input Judul */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Input Deskripsi */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Input Digiflazz Code */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="digiflazz_code">Digiflazz Code</Label>
          <Input
            id="digiflazz_code"
            value={form.digiflazz_code || ""}
            onChange={(e) => setForm({ ...form, digiflazz_code: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Dropdown Status */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 disabled:bg-gray-100 disabled:opacity-70"
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
          <Button variant="outline" onClick={onCancel} type="button">
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || isCategoriesLoading} type="submit">
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}