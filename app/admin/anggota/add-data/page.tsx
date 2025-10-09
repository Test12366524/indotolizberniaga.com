"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  useGetAnggotaByIdQuery,
  useCreateAnggotaMutation,
  useUpdateAnggotaMutation,
} from "@/services/koperasi-service/anggota.service";
import type {
  AnggotaKoperasi,
  DocumentsAnggota,
} from "@/types/koperasi-types/anggota";
import AnggotaForm from "@/components/form-modal/koperasi-modal/anggota-form";

type Mode = "add" | "edit" | "detail";

// helper untuk membuat baris dokumen kosong yg VALID dgn tipe DocumentsAnggota
const makeEmptyDoc = (anggota_id = 0): DocumentsAnggota => ({
  id: 0,
  anggota_id,
  key: "",
  document: null,
  created_at: "",
  updated_at: "",
  media: [] as unknown as DocumentsAnggota["media"],
});

export default function AnggotaAddEditPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat formulir…</div>}>
      <AnggotaAddEditPageInner />
    </Suspense>
  );
}

function AnggotaAddEditPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const mode: Mode = (sp.get("mode") as Mode) || "add";
  const idParam = sp.get("id");
  const id = idParam ? Number(idParam) : undefined;

  const isDetail = mode === "detail";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const { data: detailData, isFetching } = useGetAnggotaByIdQuery(id!, {
    skip: !(isEdit || isDetail) || !id,
  });
  const [createAnggota, { isLoading: isCreating }] = useCreateAnggotaMutation();
  const [updateAnggota, { isLoading: isUpdating }] = useUpdateAnggotaMutation();

  const [form, setForm] = useState<
    Partial<
      AnggotaKoperasi & { password?: string; password_confirmation?: string }
    >
  >({
    documents: [makeEmptyDoc()],
  });

  // isi form saat edit/detail
  useEffect(() => {
    if ((isEdit || isDetail) && detailData) {
      const docs: DocumentsAnggota[] =
        detailData.documents && detailData.documents.length > 0
          ? (detailData.documents.map((d) => ({
              ...d,
              document: null,
            })) as DocumentsAnggota[])
          : [makeEmptyDoc(detailData.id)];

      setForm((prev) => ({ ...prev, ...detailData, documents: docs }));
    }
  }, [detailData, isEdit, isDetail]);

  const readonly = isDetail;
  const isLoading = isCreating || isUpdating || isFetching;

  const handleSubmit = async () => {
    try {
      // validasi minimal
      if (!form.name || !form.email || !form.phone || !form.nik)
        throw new Error("Nama, Email, Telepon, dan NIK wajib diisi");
      if (!form.gender || !["M", "F"].includes(form.gender as string))
        throw new Error("Gender wajib diisi (M/F)");
      if (form.status === undefined || form.status === null)
        throw new Error("Status wajib diisi");

      if (isAdd) {
        if (!form.password || form.password.trim().length < 8)
          throw new Error("Password minimal 8 karakter");
        if (form.password !== form.password_confirmation)
          throw new Error("Konfirmasi password tidak cocok");
      }

      const fd = new FormData();
      fd.append("name", form.name as string);
      fd.append("email", form.email as string);
      fd.append("phone", form.phone as string);
      fd.append("address", form.address ?? "");
      fd.append("gender", form.gender as string);
      fd.append("birth_date", form.birth_date ?? "");
      fd.append("birth_place", form.birth_place ?? "");
      fd.append("nik", form.nik as string);
      fd.append("npwp", form.npwp ?? "");
      fd.append("status", String(form.status ?? 0));
      fd.append("nip", form.nip ?? "");
      fd.append("unit_kerja", form.unit_kerja ?? "");
      fd.append("jabatan", form.jabatan ?? "");

      if (isAdd && form.password && form.password_confirmation) {
        fd.append("password", form.password);
        fd.append("password_confirmation", form.password_confirmation);
      }

      // documents[index][key] & documents[index][file]
      const docs = (form.documents ?? []) as DocumentsAnggota[];
      docs.forEach((d, i) => {
        fd.append(`documents[${i}][key]`, d.key ?? "");
        if (d.document && d.document instanceof File) {
          fd.append(`documents[${i}][file]`, d.document);
        }
      });

      if (isEdit && id) {
        await updateAnggota({ id, payload: fd }).unwrap();
        Swal.fire("Sukses", "Anggota diperbarui", "success");
      } else {
        await createAnggota(fd).unwrap();
        Swal.fire("Sukses", "Anggota ditambahkan", "success");
      }
      router.push("/admin/anggota");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      Swal.fire("Gagal", msg, "error");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <AnggotaForm
        form={form}
        setForm={setForm}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        readonly={readonly}
        isLoading={isLoading}
      />
    </div>
  );
}