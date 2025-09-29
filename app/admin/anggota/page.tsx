"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetAnggotaListQuery,
  useCreateAnggotaMutation,
  useUpdateAnggotaMutation,
  useDeleteAnggotaMutation,
} from "@/services/koperasi-service/anggota.service";
import type { AnggotaKoperasi } from "@/types/koperasi-types/anggota";
import { Badge } from "@/components/ui/badge";
import AnggotaForm from "@/components/form-modal/koperasi-modal/anggota-form";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { useRouter } from "next/navigation";

type AnggotaPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: "M" | "F";
  birth_date: string;
  birth_place: string;
  nik: string;
  npwp: string | null;
  nip?: string;
  unit_kerja?: string;
  jabatan?: string;
  status: 0 | 1 | 2;
  password?: string;
  password_confirmation?: string;
  ktp?: File;
  photo?: File;
  slip_gaji?: File;
};

export default function AnggotaPage() {
  const [form, setForm] = useState<
    Partial<
      AnggotaKoperasi & {
        password?: string;
        password_confirmation?: string;
        nip?: string;
        unit_kerja?: string;
        jabatan?: string;
        ktp?: File | null;
        photo?: File | null;
        slip_gaji?: File | null;
      }
    >
  >({});

  const router = useRouter();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, refetch } = useGetAnggotaListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const list = useMemo(() => data?.data ?? [], [data]);

  const filteredList = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((item) => {
      const fields = [
        item.name,
        item.email,
        item.phone,
        item.address,
        item.nik,
        item.npwp ?? "",
      ];
      return fields.some((f) => f?.toLowerCase?.().includes?.(q));
    });
  }, [list, query]);

  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const [createAnggota, { isLoading: isCreating }] = useCreateAnggotaMutation();
  const [updateAnggota, { isLoading: isUpdating }] = useUpdateAnggotaMutation();
  const [deleteAnggota] = useDeleteAnggotaMutation();

  const handleSubmit = async () => {
    try {
      // === VALIDASI WAJIB ===
      if (!form.name || !form.email || !form.phone || !form.nik) {
        throw new Error("Nama, Email, Telepon, dan NIK wajib diisi");
      }
      if (!form.gender || !["M", "F"].includes(form.gender as string)) {
        throw new Error("Gender wajib diisi (M/F)");
      }
      if (form.status === undefined || form.status === null) {
        throw new Error("Status wajib diisi");
      }

      // Password hanya wajib saat CREATE
      if (!editingId) {
        if (!form.password || form.password.trim().length < 8) {
          throw new Error("Password minimal 8 karakter");
        }
        if (form.password !== form.password_confirmation) {
          throw new Error("Konfirmasi password tidak cocok");
        }
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('address', form.address ?? "");
      formData.append('gender', form.gender as string);
      formData.append('birth_date', form.birth_date ?? "");
      formData.append('birth_place', form.birth_place ?? "");
      formData.append('nik', form.nik);
      formData.append('npwp', form.npwp ?? "");
      formData.append('status', String(form.status));

      // Add optional fields
      if (form.nip) formData.append('nip', form.nip);
      if (form.unit_kerja) formData.append('unit_kerja', form.unit_kerja);
      if (form.jabatan) formData.append('jabatan', form.jabatan);

      // Add password fields for create
      if (!editingId && form.password && form.password_confirmation) {
        formData.append('password', form.password);
        formData.append('password_confirmation', form.password_confirmation);
      }

      // Add file uploads
      if (form.ktp) formData.append('ktp', form.ktp);
      if (form.photo) formData.append('photo', form.photo);
      if (form.slip_gaji) formData.append('slip_gaji', form.slip_gaji);

      if (editingId) {
        await updateAnggota({ id: editingId, payload: formData }).unwrap();
        Swal.fire("Sukses", "Anggota diperbarui", "success");
      } else {
        await createAnggota(formData).unwrap();
        Swal.fire("Sukses", "Anggota ditambahkan", "success");
      }

      setForm({});
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      Swal.fire("Gagal", msg, "error");
      console.error(err);
    }
  };

  const handleEdit = (item: AnggotaKoperasi) => {
    setForm({
      ...item,
      password: "",
      password_confirmation: "",
    });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: AnggotaKoperasi) => {
    setForm({
      ...item,
    });
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: AnggotaKoperasi) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Anggota?",
      text: `${item.name} (${item.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteAnggota(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Anggota dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Anggota", "error");
        console.error(error);
      }
    }
  };

  const statusBadge = (status: number) => {
    if (status === 1) return <Badge variant="success">APPROVED</Badge>;
    if (status === 2) return <Badge variant="destructive">REJECTED</Badge>;
    return <Badge variant="secondary">PENDING</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={() => {
          setForm({});
          setEditingId(null);
          setReadonly(false);
          openModal();
        }}
        onSearchChange={setQuery}
        onCategoryChange={(val) => {
          // opsional: mapping ke format API (mis. "active"|"inactive" -> 1|0)
          // const mapped = val === "active" ? "1" : val === "inactive" ? "0" : "all";
          setStatus(val);
        }}
        categories={[
          { value: "all", label: "Semua Status" },
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Tidak Aktif" },
        ]}
        onImportExcel={(file) => {
          // kirim ke service import
          // uploadImportExcel(file)
        }}
        onExportExcel={() => {
          // panggil service export (download file)
          // exportProdukExcel({ q: query, status })
        }}
        importLabel="Import Excel"
        exportLabel="Export Excel"
      />

      <Card>
        <div className="px-4">
          <Button variant="default" onClick={() => router.push("/admin/history")}>
            Lihat History
          </Button>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Telepon</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">NIK</th>
                <th className="px-4 py-2">NPWP</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDetail(item)}>
                          Detail
                        </Button>
                        <Button size="sm" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.gender}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.nik}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.npwp ?? "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {statusBadge(item.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <AnggotaForm
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({});
              setEditingId(null);
              setReadonly(false);
              closeModal();
            }}
            onSubmit={handleSubmit}
            readonly={readonly}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}
    </div>
  );
}
