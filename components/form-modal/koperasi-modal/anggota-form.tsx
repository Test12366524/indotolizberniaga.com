"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type {
  AnggotaKoperasi,
  DocumentsAnggota,
} from "@/types/koperasi-types/anggota";
import { formatDateForInput } from "@/lib/format-utils";

// helper dokumen kosong bertipe benar
const makeEmptyDoc = (anggota_id = 0): DocumentsAnggota => ({
  id: 0,
  anggota_id,
  key: "",
  document: null,
  created_at: "",
  updated_at: "",
  media: [] as DocumentsAnggota["media"],
});

interface AnggotaFormProps {
  form: Partial<
    AnggotaKoperasi & { password?: string; password_confirmation?: string }
  >;
  setForm: (
    data: Partial<
      AnggotaKoperasi & { password?: string; password_confirmation?: string }
    >
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

type MediaItem = DocumentsAnggota["media"][number];

export default function AnggotaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: AnggotaFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // pastikan minimal 1 row documents
  useEffect(() => {
    if (!form.documents || form.documents.length === 0) {
      setForm({
        ...form,
        documents: [makeEmptyDoc(Number(form.id) || 0)],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOptions: Array<{ value: 0 | 1 | 2; label: string }> = [
    { value: 0, label: "PENDING" },
    { value: 1, label: "APPROVED" },
    { value: 2, label: "REJECTED" },
  ];

  const addDocRow = () => {
    const docs = (
      form.documents ? [...form.documents] : []
    ) as DocumentsAnggota[];
    docs.push(makeEmptyDoc(Number(form.id) || 0));
    setForm({ ...form, documents: docs });
  };

  const removeDocRow = (idx: number) => {
    const docs = ((form.documents ?? []) as DocumentsAnggota[]).slice();
    docs.splice(idx, 1);
    setForm({
      ...form,
      documents: docs.length ? docs : [makeEmptyDoc(Number(form.id) || 0)],
    });
  };

  const updateDocKey = (idx: number, key: string) => {
    const docs = ((form.documents ?? []) as DocumentsAnggota[]).slice();
    docs[idx] = { ...(docs[idx] as DocumentsAnggota), key };
    setForm({ ...form, documents: docs });
  };

  const updateDocFile = (idx: number, file: File | null) => {
    const docs = ((form.documents ?? []) as DocumentsAnggota[]).slice();
    docs[idx] = { ...(docs[idx] as DocumentsAnggota), document: file };
    setForm({ ...form, documents: docs });
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
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
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Anggota"
            : form.id
            ? "Edit Anggota"
            : "Tambah Anggota"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama */}
          <div className="flex flex-col gap-y-1">
            <Label>Nama</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon</Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Password (hanya add) */}
          {!readonly && !form.id && (
            <>
              <div className="flex flex-col gap-y-1">
                <Label>Password (wajib saat tambah)</Label>
                <Input
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* Gender */}
          <div className="flex flex-col gap-y-1">
            <Label>Gender</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.gender ?? ""}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as "M" | "F" })
              }
              disabled={readonly}
            >
              <option value="">Pilih Gender</option>
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>
          </div>

          {/* Tempat/Tanggal Lahir */}
          <div className="flex flex-col gap-y-1">
            <Label>Tempat Lahir</Label>
            <Input
              value={form.birth_place ?? ""}
              onChange={(e) =>
                setForm({ ...form, birth_place: e.target.value })
              }
              readOnly={readonly}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Tanggal Lahir</Label>
            <Input
              type="date"
              value={formatDateForInput(form.birth_date) ?? ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* NIK / NPWP */}
          <div className="flex flex-col gap-y-1">
            <Label>NIK</Label>
            <Input
              value={form.nik ?? ""}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              readOnly={readonly}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>NPWP</Label>
            <Input
              value={form.npwp ?? ""}
              onChange={(e) => setForm({ ...form, npwp: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* NIP / Unit Kerja / Jabatan */}
          <div className="flex flex-col gap-y-1">
            <Label>NIP</Label>
            <Input
              value={form.nip ?? ""}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              readOnly={readonly}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Unit Kerja</Label>
            <Input
              value={form.unit_kerja ?? ""}
              onChange={(e) => setForm({ ...form, unit_kerja: e.target.value })}
              readOnly={readonly}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Jabatan</Label>
            <Input
              value={form.jabatan ?? ""}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Alamat (full) */}
          <div className="flex flex-col gap-y-1">
            <Label>Alamat</Label>
            <Textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-y-1 sm:col-span-2">
            <Label>Status</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={
                form.status !== undefined && form.status !== null
                  ? String(form.status)
                  : ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  status: Number(e.target.value) as 0 | 1 | 2,
                })
              }
              disabled={readonly}
            >
              <option value="">Pilih Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== Dokumen Dinamis ===== */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Dokumen</h3>
            {!readonly && (
              <Button size="sm" onClick={addDocRow}>
                + Tambah Baris
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {(form.documents as DocumentsAnggota[] | undefined)?.map(
              (doc, idx) => {
                // hindari akses properti yang tidak ada di tipe (mis. 'url')
                const firstMedia: MediaItem | undefined = doc.media?.[0];
                const existingUrl = firstMedia?.original_url ?? "";

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 border rounded-lg p-3"
                  >
                    {/* Nama File (key) */}
                    <div className="sm:col-span-5">
                      <Label>Nama File</Label>
                      <Input
                        value={doc.key ?? ""}
                        readOnly={readonly}
                        onChange={(e) => updateDocKey(idx, e.target.value)}
                      />
                    </div>

                    {/* File */}
                    <div className="sm:col-span-5">
                      <Label>File</Label>
                      <Input
                        type="file"
                        disabled={readonly}
                        onChange={(e) =>
                          updateDocFile(idx, e.target.files?.[0] || null)
                        }
                      />
                      {existingUrl && (
                        <a
                          className="text-xs text-blue-600 mt-1 inline-block"
                          href={existingUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat file lama
                        </a>
                      )}
                      {doc.document && doc.document instanceof File && (
                        <p className="text-xs text-muted-foreground mt-1">
                          File baru: {doc.document.name}
                        </p>
                      )}
                    </div>

                    {/* Hapus */}
                    <div className="sm:col-span-2 flex items-end">
                      {!readonly && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeDocRow(idx)}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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