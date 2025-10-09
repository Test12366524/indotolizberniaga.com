"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetProductListQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/ppob/product.service";
import { Product } from "@/types/ppob/product";
import FormProduct from "@/components/form-modal/ppob/product-form";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";

export default function ProductPage() {
  const [form, setForm] = useState<Partial<Product>>({
    status: true,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, set] = useState("all");

  const { data, isLoading, refetch } = useGetProductListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [create, { isLoading: isCreating }] =
    useCreateProductMutation();
  const [update, { isLoading: isUpdating }] =
    useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      if (form.ppob_category_id) payload.append("ppob_category_id", form.ppob_category_id.toString());
      if (form.name) payload.append("name", form.name);
      if (form.sku) payload.append("sku", form.sku);
      if (form.description) payload.append("description", form.description);
      if (form.buy_price) payload.append("buy_price", form.buy_price.toString());
      if (form.sell_price) payload.append("sell_price", form.sell_price.toString());
      if (typeof form.status === "boolean") {
        payload.append("status", form.status ? "1" : "0");
      }
      if (form.image instanceof File) {
        payload.append("image", form.image);
      }

      if (editingSlug) {
        await update({ slug: editingSlug, payload }).unwrap();
        Swal.fire("Sukses", "Produk diperbarui", "success");
      } else {
        await create(payload).unwrap();
        Swal.fire("Sukses", "Produk ditambahkan", "success");
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

  const handleEdit = (item: Product) => {
    setForm({ ...item, status: item.status === true || item.status === 1 });
    setEditingSlug(item.slug ? item.slug.toString() : "");
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Product) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Product) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus produk?",
      text: item.name ?? "",
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
        await deleteProduct(item.slug.toString()).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Produk dihapus", "success");
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
        onStatusChange={(status: string) => set(status)}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Parent</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Harga Beli</th>
                <th className="px-4 py-2">Harga Jual</th>
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
                    <td className="px-4 py-2">{item.parent_category_title}</td>
                    <td className="px-4 py-2">{item.category_title}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">{item.buy_price}</td>
                    <td className="px-4 py-2">{item.sell_price}</td>
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
          <FormProduct
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
