"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetCoaListQuery,
  useCreateCoaMutation,
  useUpdateCoaMutation,
  useDeleteCoaMutation,
  type CreateCoaRequest,
  type UpdateCoaRequest,
} from "@/services/master/coa.service";
import type { CoaKoperasi } from "@/types/koperasi-types/master/coa";
import CoaForm from "@/components/form-modal/koperasi-modal/master/coa-form";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";

export default function CoaPage() {
  // ⬇️ level tidak diset default, type default "Global"
  const [form, setForm] = useState<Partial<CoaKoperasi>>({
    type: "Global",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetCoaListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    orderBy: "coas.code",
    order: "asc",
  });

  const list = useMemo(() => data?.data ?? [], [data]);
  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const [createCoa, { isLoading: isCreating }] = useCreateCoaMutation();
  const [updateCoa, { isLoading: isUpdating }] = useUpdateCoaMutation();
  const [deleteCoa] = useDeleteCoaMutation();

  const handleSubmit = async () => {
    try {
      if (!form.code || !form.name) {
        throw new Error("Kode dan Nama wajib diisi");
      }
      // ⬇️ pastikan level diisi
      if (
        form.level === undefined ||
        form.level === null ||
        Number.isNaN(Number(form.level))
      ) {
        throw new Error("Level wajib diisi");
      }

      const payload: CreateCoaRequest | UpdateCoaRequest = {
        code: form.code,
        name: form.name,
        description: form.description ?? "",
        level: Number(form.level), // ⬅️ required
        type: form.type ?? "Global", // ⬅️ default Global
      };

      if (editingId) {
        await updateCoa({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "COA diperbarui", "success");
      } else {
        await createCoa(payload).unwrap();
        Swal.fire("Sukses", "COA ditambahkan", "success");
      }

      setForm({ type: "Global" }); // ⬅️ reset tanpa level default
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Gagal",
        (error as Error).message || "Gagal menyimpan data",
        "error"
      );
    }
  };

  const handleEdit = (item: CoaKoperasi) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: CoaKoperasi) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: CoaKoperasi) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus COA?",
      text: `${item.code} - ${item.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCoa(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "COA dihapus", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Gagal menghapus COA", "error");
      }
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((it) =>
      [it.code, it.name, it.description ?? "", it.type, String(it.level)].some(
        (f) => f?.toLowerCase?.().includes?.(q)
      )
    );
  }, [list, query]);

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={() => {
          setForm({ type: "Global" }); // ⬅️ tidak set level
          setEditingId(null);
          setReadonly(false);
          openModal();
        }}
        onSearchChange={setQuery}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <ActionsGroup
                        handleDetail={() => handleDetail(item)}
                        handleEdit={() => handleEdit(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    <td className="px-4 py-2 font-mono text-sm">{item.code}</td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-2">{item.level}</td>
                    <td className="px-4 py-2">{item.type}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
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
          <CoaForm
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({ type: "Global" }); // ⬅️ reset tanpa level
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
