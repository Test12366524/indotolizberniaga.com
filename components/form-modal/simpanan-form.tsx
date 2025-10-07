"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {  UploadCloud, X } from "lucide-react";

import { Simpanan } from "@/types/admin/simpanan";
import { useGetSimpananCategoryListQuery } from "@/services/master/simpanan-category.service";
import { formatRupiah, parseRupiah } from "@/lib/format-utils";
import { AnggotaPicker } from "../ui/anggota-picker";

type CategoryItem = { id: number; name: string; code?: string | null };

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
  const [dragActive, setDragActive] = useState(false); // untuk dropzone

  const { data: categoriesData } = useGetSimpananCategoryListQuery({
    page: 1,
    paginate: 100,
  });
  const categories: CategoryItem[] = (categoriesData?.data ??
    []) as CategoryItem[];

  const SimpananTypes = [
    { id: "automatic", label: "AUTOMATIC", value: "automatic" as const },
    { id: "manual", label: "MANUAL", value: "manual" as const },
  ];

  // nominal presets seperti desain (50k, 120k, 500k, 1M, 5M, 10M)
  const nominalPresets: number[] = [
    50000, 120000, 500000, 1_000_000, 5_000_000, 10_000_000,
  ];

  const selectedMethod =
    (form.type as "automatic" | "manual" | undefined) ?? undefined;

  // helper dropzone
  const onPickFile = (file: File | null) => {
    if (!file) return;
    // batas 5MB (sesuai teks desain)
    const over = file.size > 5 * 1024 * 1024;
    if (over) {
      alert("Ukuran file melebihi 5MB.");
      return;
    }
    setForm({ ...form, image: file });
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) onPickFile(f);
  };

  const SimpananStatus = {
    "0": "MENUNGGU",
    "1": "DITERIMA",
    "2": "DITOLAK",
  } as const;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-4xl space-y-6 max-h-[90vh] overflow-y-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========== KATEGORI (TERPISAH) ========== */}
        <div className="md:col-span-2">
          <Label className="mb-2 block">Kategori Simpanan *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((c) => {
              const active = form.simpanan_category_id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={readonly}
                  onClick={() =>
                    setForm({ ...form, simpanan_category_id: c.id })
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

        {/* ========== NOMINAL DEPOSIT (MIRIP DESAIN) ========== */}
        <div className="md:col-span-2">
          <Label className="mb-2 block">Pilih Nominal Simpanan</Label>
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
                placeholder="Contoh: 60000"
              />
            </div>
          </div>
        </div>

        {/* Anggota */}
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

        {/* Tanggal */}
        <div className="flex flex-col gap-y-2">
          <Label>Tanggal Simpanan *</Label>
          <Input
            type="datetime-local"
            className="h-12 rounded-2xl" // ⬅️ tambah ini
            value={
              form.date ? new Date(form.date).toISOString().slice(0, 16) : ""
            }
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            readOnly={readonly}
          />
        </div>

        {/* Metode Pembayaran */}
        <div>
          <Label className="mb-2 block">Metode Pembayaran</Label>
          <RadioGroup
            className="grid grid-cols-2 gap-3 w-full"
            value={selectedMethod ?? ""}
            onValueChange={(val: "automatic" | "manual") =>
              setForm({ ...form, type: val })
            }
            disabled={readonly}
          >
            {SimpananTypes.map((t) => (
              <label
                key={t.id}
                className="w-full flex items-center gap-2 rounded-2xl border border-neutral-200
                   bg-white px-4 py-3 shadow-sm"
              >
                <RadioGroupItem value={t.value} id={t.id} />
                <span className="text-sm font-medium">{t.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Deskripsi */}
        <div>
          <Label className="mb-2">Deskripsi (Opsional)</Label>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            rows={3}
          />
        </div>

        {/* Upload Bukti Transfer - Drag & Drop (hidden jika automatic) */}
        {form.type !== "automatic" && (
          <div className="md:col-span-2">
            <Label className="mb-2 block">
              Upload Bukti Transfer (Opsional)
            </Label>

            {readonly ? (
              form.image && typeof form.image === "string" ? (
                <div className="border rounded-xl p-2">
                  <Image
                    src={form.image}
                    alt="Bukti transfer"
                    className="h-32 w-auto object-contain mx-auto"
                    width={300}
                    height={128}
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500 p-2 border rounded-xl inline-block">
                  Tidak ada gambar
                </span>
              )
            ) : (
              <>
                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  className={[
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition",
                    dragActive
                      ? "border-neutral-800 bg-neutral-50"
                      : "border-neutral-300",
                  ].join(" ")}
                >
                  <UploadCloud className="h-6 w-6" />
                  <p className="text-sm font-medium">
                    Tarik & letakkan gambar di sini
                  </p>
                  <p className="text-xs text-neutral-500">
                    atau klik tombol di bawah • Maksimal 5MB
                  </p>
                  <div className="mt-3">
                    <input
                      id="bukti-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("bukti-input")?.click()
                      }
                    >
                      Pilih gambar
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {form.image && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border p-3">
                    {typeof form.image === "string" ? (
                      <Image
                        src={form.image}
                        alt="Bukti"
                        width={72}
                        height={72}
                        className="h-18 w-18 rounded-lg object-contain bg-white"
                      />
                    ) : (
                      <span className="text-sm">{form.image.name}</span>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => setForm({ ...form, image: undefined })}
                      aria-label="Hapus bukti"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* readonly info */}
        {form.status !== undefined && (
          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Status</Label>
            <Input
              value={
                SimpananStatus[
                  String(form.status) as keyof typeof SimpananStatus
                ]
              }
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
