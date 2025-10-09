"use client";

import { useEffect, useState } from "react";
// Asumsi komponen ini diimpor dari UI library seperti shadcn/ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Textarea tidak digunakan lagi di sini, dihapus dari import
// Import Tipe dan Utility
import { Transaksi } from "@/types/ppob/transaksi";
// PATH INI SEKARANG SUDAH TERSAJI BERKAT FILE BARU
import { formatRupiah, parseRupiah } from "@/lib/format-utils"; 
import {
  useGetProductCategoryListQuery,
} from "@/services/ppob/category.service";
import {
  useGetProductListQuery,
} from "@/services/ppob/product.service";
import { PaymentChannelSelect } from "../../ui/payment-channel-select";
import { PaymentMethodSelect } from "../../ui/payment-method-select";

type CategoryOption = {
  id: number;
  title: string;
};

interface FormTransaksiProps {
  form: Partial<Transaksi>;
  setForm: (data: Partial<Transaksi>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormTransaksi({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormTransaksiProps) {

  // Daftar bank yang tersedia untuk dipilih
  const banks = ["BCA", "MANDIRI", "BRI", "BNI"];

    // 1. Ambil semua Kategori Utama (is_parent: 1)
    const { data: mainCategoryData, isLoading: isLoadingMainCategories } = useGetProductCategoryListQuery({
      page: 1,
      paginate: 1000,
      is_parent: 1, 
    });
  
    // 2. Tentukan ID Kategori Utama yang saat ini terpilih atau yang akan digunakan untuk memuat subkategori
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(
      null
    );

    // ID Subkategori yang dipilih (untuk dropdown Subkategori)
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(
      null
    );

    // Query produk berdasarkan kategori produk (subkategori)
    const { data: productListData, isLoading: isLoadingProducts } = useGetProductListQuery(
      {
        page: 1,
        paginate: 100,
        ppob_category_id: selectedSubCategoryId || undefined,
      },
      {
        skip: !selectedSubCategoryId,
      }
    );

    // Opsi produk untuk dropdown
    const productDropdownOptions: CategoryOption[] = (productListData?.data || []).map(prod => ({
      id: prod.id,
      title: prod.name,
    }));


  
    // Jika form.ppob_category_id sudah ada, kita harus memastikan selectedMainCategoryId diset
    // Ini memerlukan logic di luar scope query ini (misal: endpoint GetCategoryById)
    // Untuk saat ini, kita akan inisialisasi berdasarkan data yang tersedia.
    useEffect(() => {
      if (form.ppob_product_id && mainCategoryData?.data) {
          // Cari apakah ppob_product_id itu sendiri adalah Kategori Utama
          const isMainCategory = mainCategoryData.data.some(c => c.id === form.ppob_product_id);

          if (!isMainCategory) {
              // Jika dia subkategori, kita harus menebak parent-nya.
              // Solusi realistis: API harus menyediakan ppob_category_id (untuk sub-kategori)
              // dan ppob_main_category_id (untuk parent-nya). Karena tidak ada, kita lewati.
              // **Kita hanya akan inisialisasi `selectedMainCategoryId` ke `null` dan
              // biarkan user memilih ulang saat edit.**
          }
      }
    }, [form.ppob_product_id, mainCategoryData]);
  
  
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

  useEffect(() => {
    if (!form.id) {
      setForm({
        ...form, // Atur status default jika ini form tambah baru
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const newMainId = value === 0 ? null : value;
    
    // 1. Update state local untuk memicu query subkategori
    setSelectedMainCategoryId(newMainId);
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const newSubId = value === 0 ? null : value;
    
    // 1. Update state local untuk memicu query produk
    setSelectedSubCategoryId(newSubId);
  }
  
  // (handleProductCategoryChange dihapus karena tidak digunakan dan mengandung pemanggilan hook tidak valid)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 w-full max-w-2xl space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {readonly
            ? "Detail Transaksi"
            : form.id
            ? "Edit Transaksi"
            : "Tambah Transaksi Baru"}
        </h2>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Button>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: PEMILIHAN PRODUK */}
        <div className="space-y-4 p-4 border rounded-xl bg-gray-50 dark:bg-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Dropdown Kategori Utama (Memilih Parent ID untuk Subkategori) */}
                {/* Button Card untuk Kategori Utama */}
                <div className="flex flex-col gap-y-1">
                    <Label htmlFor="main_category_id">Kategori Utama</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                        {isLoadingMainCategories ? (
                            <div className="col-span-full text-sm text-gray-400 italic">
                                Memuat Kategori Utama...
                            </div>
                        ) : (
                            mainCategoryOptions.length > 0 ? (
                                mainCategoryOptions.map((option) => (
                                    <button
                                        key={`main-${option.id}`}
                                        type="button"
                                        className={`border rounded-lg px-4 py-3 text-left transition
                                            ${
                                                selectedMainCategoryId === option.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-semibold shadow"
                                                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-400"
                                            }
                                            ${readonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                        `}
                                        onClick={() => {
                                            if (!readonly) setSelectedMainCategoryId(option.id);
                                        }}
                                        disabled={readonly}
                                    >
                                        {option.title}
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full text-sm text-gray-400 italic">
                                    Tidak ada kategori utama.
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Button Card untuk Subkategori */}
                <div className="flex flex-col gap-y-1">
                    <Label htmlFor="sub_category_id">Kategori Produk</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                        {!selectedMainCategoryId && (
                            <div className="col-span-full text-sm text-gray-400 italic">
                                Pilih Kategori Utama dahulu
                            </div>
                        )}
                        {isLoadingSubCategories ? (
                            <div className="col-span-full text-sm text-gray-400 italic">
                                Memuat Kategori Produk...
                            </div>
                        ) : (
                            selectedMainCategoryId && subCategoryOptions.length > 0 ? (
                                subCategoryOptions.map((option) => (
                                    <button
                                        key={`sub-${option.id}`}
                                        type="button"
                                        className={`border rounded-lg px-4 py-3 text-left transition
                                            ${
                                                selectedSubCategoryId === option.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-semibold shadow"
                                                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-400"
                                            }
                                            ${readonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                        `}
                                        onClick={() => {
                                            if (!readonly) setSelectedSubCategoryId(option.id);
                                        }}
                                        disabled={readonly}
                                    >
                                        {option.title}
                                    </button>
                                ))
                            ) : selectedMainCategoryId ? (
                                <div className="col-span-full text-sm text-gray-400 italic">
                                    Tidak ada subkategori pada kategori ini.
                                </div>
                            ) : null
                        )}
                    </div>
                </div>

                {/* Pilihan Produk sebagai Button Card */}
                <div className="flex flex-col gap-y-1">
                    <Label htmlFor="ppob_product_id">Produk</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        {!selectedMainCategoryId && (
                            <div className="col-span-full text-sm text-gray-400 italic">
                                Pilih Kategori Produk dahulu
                            </div>
                        )}
                        {isLoadingProducts ? (
                            <div className="col-span-full text-sm text-gray-400 italic">
                                Memuat Produk...
                            </div>
                        ) : (
                            selectedMainCategoryId && productDropdownOptions.length > 0 ? (
                                productDropdownOptions.map((option) => (
                                    <button
                                        key={`product-${option.id}`}
                                        type="button"
                                        className={`border rounded-lg px-4 py-3 text-left transition
                                            ${
                                                form.ppob_product_id === option.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-semibold shadow"
                                                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-400"
                                            }
                                            ${readonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                        `}
                                        onClick={() => {
                                            if (!readonly) setForm({ ...form, ppob_product_id: option.id });
                                        }}
                                        disabled={readonly}
                                    >
                                        {option.title}
                                    </button>
                                ))
                            ) : selectedMainCategoryId ? (
                                <div className="col-span-full text-sm text-gray-400 italic">
                                    Tidak ada produk pada kategori ini.
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </div>
        </div>
        {/* SECTION 2: DETAIL PELANGGAN */}
        <div className="space-y-4 p-4 border rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="customer_no" className="mb-2">Nomor Pelanggan / ID Tujuan</Label>
                    <Input
                        id="customer_no"
                        value={form.customer_no}
                        onChange={(e) => setForm({ ...form, customer_no: e.target.value })}
                        placeholder="Masukkan nomor pelanggan/ID tujuan"
                    />
                </div>
            
                {/* Customer Name (Opsional, untuk produk tertentu) */}
                <div>
                    <Label htmlFor="customer_name" className="mb-2">Nama Pelanggan</Label>
                    <Input
                        id="customer_name"
                        value={form.customer_name || ""}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        readOnly={readonly}
                        placeholder="Masukkan nama pelanggan jika diperlukan"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-4 p-4 border rounded-xl">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-2 block">Payment Method *</Label>
                    <PaymentMethodSelect
                    mode="automatic"
                    value={form.payment_method}
                    onChange={(v) => {
                        if (v === "qris") {
                        setForm({
                            ...form,
                            payment_method: "qris",
                            payment_channel: "qris",
                        });
                        } else if (v === "bank_transfer") {
                        setForm({
                            ...form,
                            payment_method: "bank_transfer",
                            payment_channel: undefined,
                        });
                        } else {
                        // custom value tetap diperbolehkan
                        setForm({
                            ...form,
                            payment_method: v,
                            payment_channel: undefined,
                        });
                        }
                    }}
                    disabled={readonly}
                    />
                </div>
    
                <div>
                    <Label className="mb-2 block">Payment Channel *</Label>
                    <PaymentChannelSelect
                    mode="automatic"
                    method={form.payment_method}
                    value={form.payment_channel}
                    onChange={(v) => setForm({ ...form, payment_channel: v })}
                    disabled={readonly}
                    />
                </div>
             </div>
        </div>

      {!readonly && (
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !form.ppob_product_id || !form.customer_no}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
        </div>
    </div>
  );
}
