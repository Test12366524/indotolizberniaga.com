"use client";

import { useEffect, useMemo, useState } from "react";
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
  onSubmit: () => void; // dipanggil HANYA jika valid
  readonly?: boolean;
  isLoading?: boolean;
}

type MediaItem = DocumentsAnggota["media"][number];

// ===== Helper Validasi =====
const digitsOnly = (s: string) => s.replace(/\D+/g, "");
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isValidPassword = (s: string) =>
  s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);
const isValidPhoneID = (s: string) => {
  const d = digitsOnly(s);
  return d.startsWith("08") && d.length >= 10 && d.length <= 14;
};
const normalizeNPWP = (s: string) => digitsOnly(s);
const notFutureDate = (value?: string | null) => {
  if (!value) return true;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
};

type FieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "password"
    | "password_confirmation"
    | "gender"
    | "birth_place"
    | "birth_date"
    | "nik"
    | "npwp"
    | "nip"
    | "unit_kerja"
    | "jabatan"
    | "address"
    | "status",
    string
  >
>;

export default function AnggotaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: AnggotaFormProps) {
  const [mounted, setMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [docErrors, setDocErrors] = useState<string[]>([]); // error per-index dokumen

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
    const docs = [...(form.documents ?? [])] as DocumentsAnggota[];
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
    setDocErrors((prev) => {
      const cp = prev.slice();
      cp.splice(idx, 1);
      return cp;
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

  // ===== VALIDASI =====
  const validate = (): { fields: FieldErrors; docs: string[] } => {
    const errs: FieldErrors = {};
    const docErrs: string[] = [];

    const isAddMode = !form.id; // add: password wajib, edit: opsional

    // Nama
    if (!form.name || !form.name.trim()) {
      errs.name = "Nama wajib diisi.";
    } else if (form.name.trim().length < 3) {
      errs.name = "Nama minimal 3 karakter.";
    }

    // Email
    if (!form.email || !form.email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!isValidEmail(form.email.trim())) {
      errs.email = "Format email tidak valid.";
    }

    // Telepon
    if (!form.phone || !String(form.phone).trim()) {
      errs.phone = "Nomor telepon wajib diisi.";
    } else if (!isValidPhoneID(String(form.phone))) {
      errs.phone = "Nomor telepon harus 10–14 digit dan diawali 08.";
    }

    // Password
    if (isAddMode) {
      // wajib saat tambah
      if (!form.password) {
        errs.password = "Password wajib diisi.";
      } else if (!isValidPassword(form.password)) {
        errs.password = "Minimal 8 karakter dan mengandung huruf serta angka.";
      }

      if (!form.password_confirmation) {
        errs.password_confirmation = "Konfirmasi password wajib diisi.";
      } else if (form.password_confirmation !== form.password) {
        errs.password_confirmation = "Konfirmasi password tidak cocok.";
      }
    } else {
      // opsional saat edit — jika diisi salah satu, terapkan aturan & wajib cocok
      const filledAny =
        (form.password && form.password.trim() !== "") ||
        (form.password_confirmation &&
          form.password_confirmation.trim() !== "");
      if (filledAny) {
        if (!form.password || !isValidPassword(form.password)) {
          errs.password =
            "Minimal 8 karakter dan mengandung huruf serta angka.";
        }
        if (!form.password_confirmation) {
          errs.password_confirmation = "Konfirmasi password wajib diisi.";
        } else if (form.password_confirmation !== form.password) {
          errs.password_confirmation = "Konfirmasi password tidak cocok.";
        }
      }
    }

    // Gender (opsional) – jika diisi harus M/F
    if (form.gender && !["M", "F"].includes(form.gender)) {
      errs.gender = "Gender tidak valid.";
    }

    // Tempat lahir (opsional)
    if (form.birth_place && form.birth_place.trim().length < 2) {
      errs.birth_place = "Tempat lahir minimal 2 karakter.";
    }

    // Tanggal lahir (opsional, tidak boleh di masa depan)
    if (form.birth_date) {
      if (!notFutureDate(String(form.birth_date))) {
        errs.birth_date = "Tanggal lahir tidak boleh di masa depan.";
      }
    }

    // NIK (opsional tapi jika diisi 16 digit)
    if (form.nik) {
      const nikDigits = digitsOnly(String(form.nik));
      if (nikDigits.length !== 16) errs.nik = "NIK (KTP) harus 16 digit.";
    }

    // NPWP (opsional tapi jika diisi 15 digit setelah normalisasi)
    if (form.npwp) {
      const npwpDigits = normalizeNPWP(String(form.npwp));
      if (npwpDigits.length !== 15)
        errs.npwp = "NPWP harus 15 digit (tanpa tanda baca).";
    }

    // NIP (opsional 8–20 digit)
    if (form.nip) {
      const nipDigits = digitsOnly(String(form.nip));
      if (nipDigits.length < 8 || nipDigits.length > 20) {
        errs.nip = "NIP harus 8–20 digit.";
      }
    }

    // Unit kerja / jabatan (opsional)
    if (form.unit_kerja && form.unit_kerja.trim().length < 2) {
      errs.unit_kerja = "Unit kerja minimal 2 karakter.";
    }
    if (form.jabatan && form.jabatan.trim().length < 2) {
      errs.jabatan = "Jabatan minimal 2 karakter.";
    }

    // Alamat (opsional)
    if (form.address && form.address.trim().length < 10) {
      errs.address = "Alamat minimal 10 karakter.";
    }

    // Dokumen: jika ada file, key wajib
    const docs = (form.documents ?? []) as DocumentsAnggota[];
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (d?.document && !d?.key) {
        docErrs[i] = "Nama file wajib diisi saat memilih file.";
      } else {
        docErrs[i] = "";
      }
    }

    return { fields: errs, docs: docErrs };
  };

  const hasErrors = useMemo(
    () => Object.keys(fieldErrors).length > 0 || docErrors.some(Boolean),
    [fieldErrors, docErrors]
  );

  const handleSave = () => {
    const { fields, docs } = validate();
    setFieldErrors(fields);
    setDocErrors(docs);

    if (Object.keys(fields).length === 0 && !docs.some(Boolean)) {
      onSubmit(); // valid
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-h-[90vh] flex flex-col">
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
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full  max-h-[90vh] flex flex-col">
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
              aria-invalid={!!fieldErrors.name}
            />
            {!readonly && fieldErrors.name && (
              <p className="text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              readOnly={readonly}
              aria-invalid={!!fieldErrors.email}
            />
            {!readonly && fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon</Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) =>
                setForm({ ...form, phone: digitsOnly(e.target.value) })
              }
              readOnly={readonly}
              aria-invalid={!!fieldErrors.phone}
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
            />
            {!readonly && fieldErrors.phone && (
              <p className="text-xs text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password (wajib saat tambah, opsional saat edit) */}
          {!readonly && (
            <>
              <div className="flex flex-col gap-y-1">
                <Label>
                  {form.id ? "Password Baru (opsional)" : "Password (wajib)"}
                </Label>
                <Input
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  aria-invalid={!!fieldErrors.password}
                  placeholder={
                    form.id
                      ? "Kosongkan jika tidak ingin mengganti"
                      : "Minimal 8 karakter, ada huruf & angka"
                  }
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>
                  {form.id ? "Konfirmasi Password Baru" : "Konfirmasi Password"}
                </Label>
                <Input
                  type="password"
                  value={form.password_confirmation ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password_confirmation: e.target.value,
                    })
                  }
                  aria-invalid={!!fieldErrors.password_confirmation}
                  placeholder={
                    form.id
                      ? "Wajib jika mengisi password baru"
                      : "Ulangi password"
                  }
                />
                {fieldErrors.password_confirmation && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.password_confirmation}
                  </p>
                )}
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
              aria-invalid={!!fieldErrors.gender}
            >
              <option value="">Pilih Gender</option>
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>
            {!readonly && fieldErrors.gender && (
              <p className="text-xs text-red-600">{fieldErrors.gender}</p>
            )}
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
              aria-invalid={!!fieldErrors.birth_place}
            />
            {!readonly && fieldErrors.birth_place && (
              <p className="text-xs text-red-600">{fieldErrors.birth_place}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Tanggal Lahir</Label>
            <Input
              type="date"
              value={formatDateForInput(form.birth_date) ?? ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              readOnly={readonly}
              aria-invalid={!!fieldErrors.birth_date}
            />
            {!readonly && fieldErrors.birth_date && (
              <p className="text-xs text-red-600">{fieldErrors.birth_date}</p>
            )}
          </div>

          {/* NIK / NPWP */}
          <div className="flex flex-col gap-y-1">
            <Label>NIK</Label>
            <Input
              value={form.nik ?? ""}
              onChange={(e) =>
                setForm({ ...form, nik: digitsOnly(e.target.value) })
              }
              readOnly={readonly}
              inputMode="numeric"
              placeholder="16 digit"
              aria-invalid={!!fieldErrors.nik}
            />
            {!readonly && fieldErrors.nik && (
              <p className="text-xs text-red-600">{fieldErrors.nik}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>NPWP</Label>
            <Input
              value={form.npwp ?? ""}
              onChange={(e) => setForm({ ...form, npwp: e.target.value })}
              readOnly={readonly}
              placeholder="15 digit (boleh pakai titik/garis)"
              aria-invalid={!!fieldErrors.npwp}
            />
            {!readonly && fieldErrors.npwp && (
              <p className="text-xs text-red-600">{fieldErrors.npwp}</p>
            )}
          </div>

          {/* NIP / Unit Kerja / Jabatan */}
          <div className="flex flex-col gap-y-1">
            <Label>NIP</Label>
            <Input
              value={form.nip ?? ""}
              onChange={(e) =>
                setForm({ ...form, nip: digitsOnly(e.target.value) })
              }
              readOnly={readonly}
              inputMode="numeric"
              placeholder="8–20 digit"
              aria-invalid={!!fieldErrors.nip}
            />
            {!readonly && fieldErrors.nip && (
              <p className="text-xs text-red-600">{fieldErrors.nip}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Unit Kerja</Label>
            <Input
              value={form.unit_kerja ?? ""}
              onChange={(e) => setForm({ ...form, unit_kerja: e.target.value })}
              readOnly={readonly}
              aria-invalid={!!fieldErrors.unit_kerja}
            />
            {!readonly && fieldErrors.unit_kerja && (
              <p className="text-xs text-red-600">{fieldErrors.unit_kerja}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Jabatan</Label>
            <Input
              value={form.jabatan ?? ""}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              readOnly={readonly}
              aria-invalid={!!fieldErrors.jabatan}
            />
            {!readonly && fieldErrors.jabatan && (
              <p className="text-xs text-red-600">{fieldErrors.jabatan}</p>
            )}
          </div>

          {/* Alamat (full) */}
          <div className="flex flex-col gap-y-1">
            <Label>Alamat</Label>
            <Textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              readOnly={readonly}
              aria-invalid={!!fieldErrors.address}
            />
            {!readonly && fieldErrors.address && (
              <p className="text-xs text-red-600">{fieldErrors.address}</p>
            )}
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
              aria-invalid={!!fieldErrors.status}
            >
              <option value="">Pilih Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {!readonly && fieldErrors.status && (
              <p className="text-xs text-red-600">{fieldErrors.status}</p>
            )}
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
                const docErrMsg = docErrors[idx];

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
                        aria-invalid={!!docErrMsg}
                      />
                      {!readonly && docErrMsg && (
                        <p className="text-xs text-red-600 mt-1">{docErrMsg}</p>
                      )}
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

          {/* Ringkasan error umum jika ada */}
          {!readonly && hasErrors && (
            <div className="mt-2 text-xs text-red-600">
              Periksa kembali isian yang bertanda merah.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}