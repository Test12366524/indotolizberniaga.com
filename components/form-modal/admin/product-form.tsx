"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/admin/product";
import { Combobox } from "@/components/ui/combo-box";
import { useGetProductCategoryListQuery } from "@/services/master/product-category.service";
import { useGetProductMerkListQuery } from "@/services/master/product-merk.service";
import Image from "next/image";
import { formatNumber } from "@/lib/format";

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
  // ✅ Gunakan lazy initial state untuk menghindari hydration mismatch
  const [isInitialized, setIsInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Pastikan komponen hanya render setelah mounted di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Inisialisasi form hanya sekali setelah komponen mounted
  useEffect(() => {
    if (mounted && !isInitialized) {
      // Set default values hanya jika form kosong (mode tambah)
      if (!form.id) {
        setForm({
          ...form,
          status: form.status ?? true, // Default status true jika belum ada
        });
      }
      setIsInitialized(true);
    }
  }, [mounted, form, setForm, isInitialized]);

  // ✅ Cleanup URL objects untuk menghindari memory leak
  useEffect(() => {
    return () => {
      // Cleanup semua URL objects yang dibuat
      const imageFields = ['image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7'];
      imageFields.forEach(field => {
        const value = form[field as keyof Product];
        if (value && typeof value !== "string" && value instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(value));
        }
      });
    };
  }, [form]);

  const { data: categoryResponse, isLoading: categoryLoading } =
    useGetProductCategoryListQuery({
      page: 1,
      paginate: 100,
    });

  const { data: merkResponse, isLoading: merkLoading } =
    useGetProductMerkListQuery({
      page: 1,
      paginate: 100,
    });

  const categoryData = categoryResponse?.data ?? [];
  const merkData = merkResponse?.data ?? [];

  // Check if selected merk is "Jasa"
  const selectedMerk = merkData.find((m) => m.id === form.product_merk_id);
  const isJasaMerk = selectedMerk?.name?.toLowerCase() === "jasa";

  // ✅ Jangan render komponen sebelum mounted untuk menghindari hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <Button variant="ghost" onClick={onCancel}>
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header - Fixed */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
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

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <Label>Kategori Produk</Label>
            {readonly ? (
              <Input
                readOnly
                value={
                  categoryData.find((c) => c.id === form.product_category_id)
                    ?.name ?? "-"
                }
              />
            ) : (
              // ✅ Pastikan nilai yang dikirim ke Combobox konsisten
              <Combobox
                value={form.product_category_id ?? null}
                onChange={(val) =>
                  setForm({ ...form, product_category_id: val })
                }
                data={categoryData}
                isLoading={categoryLoading}
                getOptionLabel={(item) => item.name}
                placeholder="Pilih Kategori Produk"
                key={`category-${mounted}`} // ✅ Key untuk memastikan re-render setelah mounted
              />
            )}
          </div>

          <div className="flex flex-col gap-y-1">
            <Label>Merk Produk</Label>
            {readonly ? (
              <Input
                readOnly
                value={
                  merkData.find((m) => m.id === form.product_merk_id)?.name ??
                  "-"
                }
              />
            ) : (
              // ✅ Pastikan nilai yang dikirim ke Combobox konsisten
              <Combobox
                value={form.product_merk_id ?? null}
                onChange={(val) => setForm({ ...form, product_merk_id: val })}
                data={merkData}
                isLoading={merkLoading}
                getOptionLabel={(item) => item.name}
                placeholder="Pilih Merk Produk"
                key={`merk-${mounted}`} // ✅ Key untuk memastikan re-render setelah mounted
              />
            )}
          </div>

          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Nama</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
            />
          </div>

          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              readOnly={readonly}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Label>
              Harga {isJasaMerk && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              value={
                form.price !== undefined && form.price !== null && form.price > 0
                  ? formatNumber(form.price)
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, ""); // hapus titik
                const numberValue = Number(raw);

                setForm({
                  ...form,
                  price: raw === "" ? 0 : numberValue, // Use 0 instead of undefined
                });
              }}
              readOnly={readonly}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Label>{isJasaMerk ? "Durasi" : "Stok"}</Label>
            <Input
              type="number"
              value={form.duration ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              readOnly={readonly}
            />
          </div>

          {/* Physical product fields - only show for non-Jasa merks */}
          {!isJasaMerk && (
            <>
              <div className="flex flex-col gap-y-1">
                <Label>Berat</Label>
                <Input
                  type="number"
                  value={form.weight ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weight: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  readOnly={readonly}
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <Label>Panjang</Label>
                <Input
                  type="number"
                  value={form.length ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      length: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  readOnly={readonly}
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <Label>Width</Label>
                <Input
                  type="number"
                  value={form.width ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      width: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  readOnly={readonly}
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <Label>Height</Label>
                <Input
                  type="number"
                  value={form.height ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      height: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  readOnly={readonly}
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <Label>Diameter</Label>
                <Input
                  type="number"
                  value={form.diameter ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      diameter: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  readOnly={readonly}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-y-1">
            <Label>Status</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
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

          {/* Image Upload Fields */}
          {[1, 2, 3, 4, 5, 6, 7].map((imageNum) => {
            const imageKey = imageNum === 1 ? 'image' : `image_${imageNum}` as keyof Product;
            const imageValue = form[imageKey];
            const isRequired = imageNum === 1; // Only first image is required
            
            return (
              <div key={imageKey} className="flex flex-col gap-y-1 col-span-1">
                <Label>
                  Gambar {imageNum} {isRequired && <span className="text-red-500">*</span>}
                </Label>
                {readonly ? (
                  imageValue && typeof imageValue === "string" ? (
                    <Image
                      src={imageValue}
                      alt="Preview"
                      className="h-20 object-contain border rounded"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Tidak ada gambar</span>
                  )
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, [imageKey]: file });
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer/Actions - Fixed */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
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