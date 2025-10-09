"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useGetProductCategoryListQuery,
} from "@/services/ppob/category.service";
import { Product } from "@/types/ppob/product";
import Image from "next/image";

// Tipe data untuk daftar kategori yang akan digunakan di dropdown
type CategoryOption = {
  id: number;
  title: string;
};

interface FormProductProps {
  form: Partial<Product>;
  setForm: (data: Partial<Product>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormProduct({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormProductProps) {
  // --- STATE LOKAL UNTUK MENGELOLA KATEGORI UTAMA YANG DIPILIH ---
  // Gunakan state untuk melacak Kategori Utama (Parent ID) yang dipilih oleh user.
  // Jika form.ppob_category_id sudah ada (saat Edit), kita perlu tahu Parent-nya.
  // Karena Product tidak memiliki parent_id, kita hanya menggunakan ppob_category_id.
  // Untuk dropdown berantai, kita asumsikan produk berada di sub-kategori.

  // 1. Ambil semua Kategori Utama (is_parent: 1)
  const { data: mainCategoryData, isLoading: isLoadingMainCategories } = useGetProductCategoryListQuery({
    page: 1,
    paginate: 1000,
    is_parent: 1, 
  });

  // 2. Tentukan ID Kategori Utama yang saat ini terpilih atau yang akan digunakan untuk memuat subkategori
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(
    // Logika kompleks di sini:
    // Jika sedang edit (punya form.id), kita butuh ID Parent dari form.ppob_category_id
    // Sederhananya, jika subkategori dipilih, ia memiliki parent. Kita akan cari parent_id-nya.
    // Karena API tidak menyediakan parent_id untuk subkategori, kita asumsikan
    // user akan memilih kategori utama terlebih dahulu.
    null
  );

  // Jika form.ppob_category_id sudah ada, kita harus memastikan selectedMainCategoryId diset
  // Ini memerlukan logic di luar scope query ini (misal: endpoint GetCategoryById)
  // Untuk saat ini, kita akan inisialisasi berdasarkan data yang tersedia.
  useEffect(() => {
    if (form.ppob_category_id && mainCategoryData?.data) {
        // Cari apakah ppob_category_id itu sendiri adalah Kategori Utama
        const isMainCategory = mainCategoryData.data.some(c => c.id === form.ppob_category_id);

        if (!isMainCategory) {
            // Jika dia subkategori, kita harus menebak parent-nya.
            // Solusi realistis: API harus menyediakan ppob_category_id (untuk sub-kategori)
            // dan ppob_main_category_id (untuk parent-nya). Karena tidak ada, kita lewati.
            // **Kita hanya akan inisialisasi `selectedMainCategoryId` ke `null` dan
            // biarkan user memilih ulang saat edit.**
        }
    }
  }, [form.ppob_category_id, mainCategoryData]);


  // 3. Ambil Subkategori berdasarkan selectedMainCategoryId
  const { data: subCategoryData, isLoading: isLoadingSubCategories } = useGetProductCategoryListQuery(
    {
        page: 1,
        paginate: 1000,
        // Query hanya dijalankan jika selectedMainCategoryId ada dan > 0
        parent_id: selectedMainCategoryId || undefined,
    },
    {
        // Skip query jika tidak ada Kategori Utama yang dipilih
        skip: !selectedMainCategoryId, 
    }
  );

  // --- OPSI DROPDOWN ---

  // Opsi Kategori Utama (Parent Category)
  const mainCategoryOptions: CategoryOption[] = (mainCategoryData?.data || [])
    .map(cat => ({
      id: cat.id,
      title: cat.title,
    }));
  
  const mainCategoryDropdownOptions = [
    { id: 0, title: "Pilih Kategori Utama" },
    ...mainCategoryOptions,
  ];

  // Opsi Subkategori (Product Category)
  const subCategoryOptions: CategoryOption[] = (subCategoryData?.data || [])
    .map(cat => ({
      id: cat.id,
      title: cat.title,
    }));
  
  const subCategoryDropdownOptions = [
    { id: 0, title: "Pilih Subkategori Produk" },
    ...subCategoryOptions,
  ];

  // --- LOGIC EFFECT UNTUK INISIALISASI FORM ---
  useEffect(() => {
    // Inisialisasi status default
    if (!form.id && form.status === undefined) {
      setForm({
        ...form,
        status: true,
      });
    }
  }, [form.id, form.status, setForm]);

  // --- HANDLERS ---

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const newMainId = value === 0 ? null : value;
    
    // 1. Update state local untuk memicu query subkategori
    setSelectedMainCategoryId(newMainId);
    
    // 2. Reset ppob_category_id di form karena subkategori lama sudah tidak valid
    setForm({ ...form, ppob_category_id: undefined });
  };
  
  const handleProductCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    // Jika value adalah 0 (Pilih Subkategori), set ppob_category_id menjadi undefined/null
    // Jika value > 0, set ppob_category_id ke ID yang dipilih
    setForm({ ...form, ppob_category_id: value === 0 ? undefined : value });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Produk"
            : form.id
            ? "Edit Produk"
            : "Tambah Produk"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Dropdown Kategori Utama (Memilih Parent ID untuk Subkategori) */}
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="main_category_id">Kategori Utama</Label>
          <select
            id="main_category_id"
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 disabled:bg-gray-100 disabled:opacity-70"
            // Tampilkan ID Kategori Utama yang saat ini dipilih
            value={selectedMainCategoryId ?? 0}
            onChange={handleMainCategoryChange}
            disabled={readonly || isLoadingMainCategories}
          >
            {isLoadingMainCategories ? (
                <option value={0} disabled>Memuat Kategori Utama...</option>
            ) : (
                mainCategoryDropdownOptions.map((option) => (
                    <option key={`main-${option.id}`} value={option.id}>
                        {option.title}
                    </option>
                ))
            )}
          </select>
        </div>

        {/* Dropdown Kategori Produk (Subkategori, berdasarkan pilihan Parent) */}
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="ppob_category_id">Kategori Produk</Label>
          <select
            id="ppob_category_id"
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 disabled:bg-gray-100 disabled:opacity-70"
            // Tampilkan ppob_category_id dari form
            value={form.ppob_category_id ?? 0}
            onChange={handleProductCategoryChange}
            disabled={readonly || !selectedMainCategoryId || isLoadingSubCategories}
          >
            {isLoadingSubCategories ? (
                <option value={0} disabled>Memuat Subkategori...</option>
            ) : !selectedMainCategoryId ? (
                 <option value={0} disabled>Pilih Kategori Utama dahulu</option>
            ) : (
                subCategoryDropdownOptions.map((option) => (
                    <option key={`sub-${option.id}`} value={option.id}>
                        {option.title}
                    </option>
                ))
            )}
          </select>
        </div>
        
        {/* Input Nama (Title) */}
        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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

        {/* Input Harga Beli */}
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="buy_price">Harga Beli</Label>
          <Input
            id="buy_price"
            type="number"
            value={form.buy_price || ""}
            onChange={(e) => setForm({ ...form, buy_price: parseFloat(e.target.value) || 0 })}
            readOnly={readonly}
          />
        </div>

        {/* Input Harga Jual */}
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="sell_price">Harga Jual</Label>
          <Input
            id="sell_price"
            type="number"
            value={form.sell_price || ""}
            onChange={(e) => setForm({ ...form, sell_price: parseFloat(e.target.value) || 0 })}
            readOnly={readonly}
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={form.sku || ""}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
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
          <Button 
            onClick={onSubmit} 
            disabled={isLoading || isLoadingMainCategories || isLoadingSubCategories} 
            type="submit"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}