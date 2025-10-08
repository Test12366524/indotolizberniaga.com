"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetProductCategoryListQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} from "@/services/ppob/category.service";
import { ProductCategory } from "@/types/ppob/product-category";
import FormProductCategory from "@/components/form-modal/ppob/category-form";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";

export default function ProductCategoryPage() {
  const [form, setForm] = useState<Partial<ProductCategory>>({
    status: true,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading, refetch } = useGetProductCategoryListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createCategory, { isLoading: isCreating }] =
    useCreateProductCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateProductCategoryMutation();
  const [deleteCategory] = useDeleteProductCategoryMutation();

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      if (form.title) payload.append("title", form.title);
      if (form.sub_title) payload.append("sub_title", form.sub_title);
      if (form.description) payload.append("description", form.description);
      if (typeof form.status === "boolean") {
        payload.append("status", form.status ? "1" : "0");
      }
      if (form.image instanceof File) {
        payload.append("image", form.image);
      }

      if (editingSlug) {
        await updateCategory({ slug: editingSlug, payload }).unwrap();
        Swal.fire("Sukses", "Kategori diperbarui", "success");
      } else {
        await createCategory(payload).unwrap();
        Swal.fire("Sukses", "Kategori ditambahkan", "success");
      }

      setForm({ status: true });
      setEditingSlug(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleEdit = (item: ProductCategory) => {
    setForm({ ...item, status: item.status === true || item.status === 1 });
    setEditingSlug(item.slug ? item.slug.toString() : "");
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: ProductCategory) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: ProductCategory) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus kategori?",
      text: item.title ?? "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      if (!item.slug) {
        Swal.fire("Gagal", "Slug kategori tidak ditemukan", "error");
        return;
      }
      try {
        await deleteCategory(item.slug.toString()).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Kategori dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus kategori", "error");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={openModal}
        onSearchChange={(q: string) => setQuery(q)}
        enableStatusFilter
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "1", label: "Aktif" },
          { value: "0", label: "Nonaktif" },
        ]}
        initialStatus={category}
        onStatusChange={(status: string) => setCategory(status)}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : categoryList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                categoryList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <ActionsGroup
                        handleDetail={() => handleDetail(item)}
                        handleEdit={() => handleEdit(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">
                      <Badge variant={item.status ? "success" : "destructive"}>
                        {item.status ? "Aktif" : "Nonaktif"}
                      </Badge>
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
          <FormProductCategory
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({ status: true });
              setEditingSlug(null);
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
