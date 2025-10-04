"use client";

// ✨ FIX: Impor useState
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { News } from "@/types/admin/news";
import { toDatetimeLocalInput } from "@/lib/format";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/RichTextEditor"),
  {
    ssr: false, 
    loading: () => <p className="p-4 border rounded-md bg-gray-100">Memuat editor...</p>,
  }
);

interface FormNewsProps {
  form: Partial<News> | undefined;
  setForm: (data: Partial<News>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function FormNews({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: FormNewsProps) {
  // ✨ FIX 1: Tambahkan state 'mounted' untuk mencegah hydration mismatch
  const [mounted, setMounted] = useState(false);

  // ✨ FIX 2: Gunakan useEffect untuk menandai komponen sudah siap di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✨ FIX 3: Pindahkan logika inisialisasi form ke sini
  useEffect(() => {
    // Hanya inisialisasi jika form belum ada (mode tambah) dan komponen sudah mounted
    if (mounted && !form) {
      setForm({
        title: "",
        content: "",
        published_at: "",
        image: "",
      });
    }
  }, [mounted, form, setForm]);

  // ✨ FIX 4: Jangan render apapun jika belum siap di client atau form belum ada
  // Ini memastikan server dan render pertama client identik
  if (!mounted || !form) {
    // Anda bisa menampilkan skeleton loader di sini jika mau
    return <div className="p-8 text-center text-gray-400">Memuat formulir...</div>; 
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly ? "Detail News" : form.id ? "Edit News" : "Tambah News"}
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
            placeholder="Masukkan judul news"
          />
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Konten</Label>
          {readonly ? (
            <div
              className="prose max-w-none p-3 border rounded-md bg-gray-50 min-h-[150px]"
              dangerouslySetInnerHTML={{ __html: form.content || "<em>Tidak ada konten.</em>" }}
            />
          ) : (
            <RichTextEditor
              value={form.content || ""}
              onChange={(html) => {
                setForm({ ...form, content: html });
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-y-1 col-span-2">
          <Label>Published At</Label>
          <Input
            type="datetime-local"
            value={toDatetimeLocalInput(form.published_at)}
            onChange={(e) => setForm({ ...form, published_at: e.target.value })}
            readOnly={readonly}
          />
        </div>

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

      {!readonly && (
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
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