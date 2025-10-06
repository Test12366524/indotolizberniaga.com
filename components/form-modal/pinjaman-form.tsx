"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pinjaman } from "@/types/admin/pinjaman";
import { useGetPinjamanCategoryListQuery } from "@/services/master/pinjaman-category.service";
import { formatRupiah, parseRupiah } from "@/lib/format-utils";
import { AnggotaPicker } from "../ui/anggota-picker";

/* ===================== Anggota Picker (min 3 char, sama spt SimpananForm) ===================== */
export type Anggota = {
  id: number;
  name?: string | null;
  email?: string | null;
  status?: number | null;
};
export const MIN_CHARS = 3;
export const DEBOUNCE_MS = 350;

/* ===================== Form Utama ===================== */

type CategoryItem = { id: number; name: string; code?: string | null };

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
  const { data: categoriesData } = useGetPinjamanCategoryListQuery({
    page: 1,
    paginate: 100,
  });
  const categories: CategoryItem[] = (categoriesData?.data ??
    []) as CategoryItem[];

  // preset nominal (sama dengan SimpananForm; bebas kamu sesuaikan)
  const nominalPresets: number[] = [
    500_000, 1_000_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000,
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-4xl space-y-6 max-h-[90vh] overflow-y-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========== KATEGORI PINJAMAN (UI sama SimpananForm) ========== */}
        <div className="md:col-span-2">
          <Label className="mb-2 block">Kategori Pinjaman *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((c) => {
              const active = form.pinjaman_category_id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={readonly}
                  onClick={() =>
                    setForm({ ...form, pinjaman_category_id: c.id })
                  }
                  className={[
                    "h-12 rounded-2xl border text-sm font-semibold shadow-sm transition-all",
                    active
                      ? "border-neutral-800 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                    "disabled:opacity-60",
                  ].join(" ")}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========== NOMINAL PINJAMAN (UI sama SimpananForm) ========== */}
        <div className="md:col-span-2">
          <Label className="mb-2 block">Pilih Nominal Pinjaman</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {nominalPresets.map((n) => {
              const active = form.nominal === n;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={readonly}
                  onClick={() => setForm({ ...form, nominal: n })}
                  className={[
                    "h-12 rounded-2xl border text-sm font-semibold shadow-sm transition-all",
                    active
                      ? "border-neutral-800 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                    "disabled:opacity-60",
                  ].join(" ")}
                >
                  {n.toLocaleString("id-ID")}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <Label className="mb-2 block">Atau Masukkan Jumlah Lain</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-9 h-12 rounded-2xl"
                value={formatRupiah(form.nominal ?? "")}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = parseRupiah(raw);
                  setForm({
                    ...form,
                    nominal: raw === "" ? undefined : parsed,
                  });
                }}
                readOnly={readonly}
                placeholder="Contoh: 1.000.000"
              />
            </div>
          </div>
        </div>

        {/* ========== ANGGOTA (UI sama SimpananForm) ========== */}
        <div className="flex flex-col gap-y-2">
          <Label>Anggota *</Label>
          <AnggotaPicker
            selectedId={typeof form.user_id === "number" ? form.user_id : null}
            onChange={(u) =>
              setForm({ ...form, user_id: u ? Number(u.id) : undefined })
            }
            disabled={readonly}
          />
        </div>

        {/* ===== Field lain tetap seperti semula (tidak diminta diubah UI) ===== */}

        {/* Tanggal Pinjaman */}
        <div className="flex flex-col gap-y-2">
          <Label>Tanggal Pinjaman *</Label>
          <Input
            type="datetime-local"
            className="h-12 rounded-2xl"
            value={
              form.date ? new Date(form.date).toISOString().slice(0, 16) : ""
            }
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Tenor */}
        <div className="flex flex-col gap-y-2">
          <Label>Tenor (Bulan) *</Label>
          <Input
            type="number"
            value={form.tenor ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                tenor:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            readOnly={readonly}
            placeholder="Masukkan tenor dalam bulan"
          />
        </div>

        {/* Suku Bunga */}
        <div className="flex flex-col gap-y-2">
          <Label>Suku Bunga (%) *</Label>
          <Input
            type="number"
            step="0.01"
            value={form.interest_rate ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                interest_rate:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            readOnly={readonly}
            placeholder="Masukkan suku bunga"
          />
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-y-2 md:col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi pinjaman (opsional)"
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