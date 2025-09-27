"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Pinjaman } from "@/types/admin/pinjaman";
import { useGetPinjamanCategoryListQuery } from "@/services/master/pinjaman-category.service";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";

interface FormPinjamanProps {
  form: Partial<Pinjaman>;
  setForm: (data: Partial<Pinjaman>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormPinjaman({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormPinjamanProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // Get categories and users for dropdowns
  const { data: categoriesData } = useGetPinjamanCategoryListQuery({
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
    if (form.pinjaman_category_id) {
      setSelectedCategory(form.pinjaman_category_id);
    }
    if (form.user_id) {
      setSelectedUser(form.user_id);
    }
  }, [form.pinjaman_category_id, form.user_id]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setForm({ ...form, pinjaman_category_id: categoryId });
  };

  const handleUserChange = (userId: number) => {
    setSelectedUser(userId);
    setForm({ ...form, user_id: userId });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-4xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Pinjaman"
            : form.id
            ? "Edit Pinjaman"
            : "Tambah Pinjaman"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kategori Pinjaman */}
        <div className="flex flex-col gap-y-1">
          <Label>Kategori Pinjaman *</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={selectedCategory || ""}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            disabled={readonly}
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
            disabled={readonly}
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
          <Label>Tanggal Pinjaman *</Label>
          <Input
            type="datetime-local"
            value={form.date ? new Date(form.date).toISOString().slice(0, 16) : ""}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Nominal */}
        <div className="flex flex-col gap-y-1">
          <Label>Nominal Pinjaman *</Label>
          <Input
            type="number"
            value={form.nominal || ""}
            onChange={(e) => setForm({ ...form, nominal: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan nominal pinjaman"
          />
        </div>

        {/* Tenor */}
        <div className="flex flex-col gap-y-1">
          <Label>Tenor (Bulan) *</Label>
          <Input
            type="number"
            value={form.tenor || ""}
            onChange={(e) => setForm({ ...form, tenor: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan tenor dalam bulan"
          />
        </div>

        {/* Suku Bunga */}
        <div className="flex flex-col gap-y-1">
          <Label>Suku Bunga (%) *</Label>
          <Input
            type="number"
            step="0.01"
            value={form.interest_rate || ""}
            onChange={(e) => setForm({ ...form, interest_rate: Number(e.target.value) })}
            readOnly={readonly}
            placeholder="Masukkan suku bunga"
          />
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-y-1 md:col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi pinjaman (opsional)"
            rows={3}
          />
        </div>

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
