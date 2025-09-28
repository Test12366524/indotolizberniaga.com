"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Simpanan } from "@/types/admin/simpanan";
import { useGetSimpananCategoryListQuery } from "@/services/master/simpanan-category.service";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";
import Image from "next/image";

interface FormPinjamanProps {
  form: Partial<Simpanan>;
  setForm: (data: Partial<Simpanan>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormSimpanan({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormPinjamanProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const SimpananTypes: { id: string; label: string; value: string }[] = [
    {
      id: "automatic",
      label: "AUTOMATIC",
      value: "automatic",
    },
    {
      id: "manual",
      label: "MANUAL",
      value: "manual",
    },
  ];

  // Get categories and users for dropdowns
  const { data: categoriesData } = useGetSimpananCategoryListQuery({
    page: 1,
    paginate: 100,
  });

  const { data: usersData } = useGetAnggotaListQuery({
    page: 1,
    paginate: 100,
    status: 1,
  });

  const categories = categoriesData?.data || [];
  const users = usersData?.data || [];

  useEffect(() => {
    if (form.simpanan_category_id) {
      setSelectedCategory(form.simpanan_category_id);
    }
    if (form.user_id) {
      setSelectedUser(form.user_id);
    }
  }, [form.simpanan_category_id, form.user_id]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setForm({ ...form, simpanan_category_id: categoryId });
  };

  const handleUserChange = (userId: number) => {
    setSelectedUser(userId);
    setForm({ ...form, user_id: userId });
  };

  const SimpananStatus = {
    "0": "MENUNGGU",
    "1": "DITERIMA",
    "-1": "DITOLAK",
  } as const;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-4xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Simpanan"
            : form.id
            ? "Edit Simpanan"
            : "Tambah Simpanan"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kategori Pinjaman */}
        <div className="flex flex-col gap-y-1">
          <Label>Kategori Simpanan *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedCategory || ""}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            disabled={readonly || !!form.id}
            aria-label="Kategori pinjaman"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.code})
              </option>
            ))}
          </select>
        </div>

        {/* Anggota */}
        <div className="flex flex-col gap-y-1">
          <Label>Anggota *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedUser || ""}
            onChange={(e) => handleUserChange(Number(e.target.value))}
            disabled={readonly || !!form.id}
            aria-label="Anggota"
          >
            <option value="">Pilih Anggota</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal */}
        <div className="flex flex-col gap-y-1">
          <Label>Tanggal Simpanan *</Label>
          <Input
            type="datetime-local"
            value={
              form.date ? new Date(form.date).toISOString().slice(0, 16) : ""
            }
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            readOnly={readonly || !!form.id}
          />
        </div>

        {/* Nominal */}
        <div className="flex flex-col gap-y-1">
          <Label>Nominal Simpanan *</Label>
          <Input
            type="number"
            value={form.nominal || ""}
            onChange={(e) =>
              setForm({ ...form, nominal: Number(e.target.value) })
            }
            readOnly={readonly || !!form.id}
            placeholder="Masukkan nominal simpanan"
          />
        </div>

        {/* Tipe */}
        <div className="flex flex-col gap-y-1">
          <Label>Tipe Simpanan *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.type || ""}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value as "automatic" });
            }}
            disabled={readonly || !!form.id}
            aria-label="Tipe Simpanan"
          >
            <option value="">Pilih Tipe Simpanan</option>
            {SimpananTypes.map((type) => (
              <option key={type.id} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gambar */}
        <div className="flex flex-col gap-y-1">
          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Upload Gambar</Label>
            {readonly ? (
              form.image && typeof form.image === "string" ? (
                <div className="border rounded-lg p-2">
                  <Image
                    src={form.image}
                    alt="Preview"
                    className="h-32 w-auto object-contain mx-auto"
                    width={300}
                    height={128}
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500 p-2 border rounded-lg">
                  Tidak ada gambar
                </span>
              )
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, image: file });
                  }}
                />
                {form.image && (
                  <div className="border rounded-lg p-2">
                    {typeof form.image === "string" ? (
                      <Image
                        src={form.image}
                        alt="Current image"
                        className="h-20 w-auto object-contain"
                        width={200}
                        height={80}
                      />
                    ) : (
                      <span className="text-sm text-green-600">
                        File baru dipilih: {form.image.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-y-1 md:col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi simpanan (opsional)"
            rows={3}
          />
        </div>

        {/* Status (readonly) */}
        {form.status !== undefined && (
          <div className="flex flex-col gap-y-1">
            <Label>Status</Label>
            <Input
              value={SimpananStatus[form.status as 1]}
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
              value={new Date(form.created_at).toLocaleString("id-ID")}
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
              value={new Date(form.updated_at).toLocaleString("id-ID")}
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
