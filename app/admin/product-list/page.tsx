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
} from "@/services/admin/product.service";
import { useGetProductMerkListQuery } from "@/services/master/product-merk.service";
import { Product } from "@/types/admin/product";
import FormProduct from "@/components/form-modal/admin/product-form";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Seller, useGetSellerListQuery } from "@/services/admin/seller.service";
import { useGetProductCategoryListQuery } from "@/services/master/product-category.service";
import { formatRupiahWithRp } from "@/lib/format-utils";

type CategoryFilter = "all" | string;

export default function ProductPage() {
  const [form, setForm] = useState<Partial<Product>>({
    status: 1,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sellerId, setSellerId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useGetProductListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const { data: catData, isLoading: isCatLoading } =
    useGetProductCategoryListQuery({
      page: 1,
      paginate: 200,
    });

  // sellers (untuk filter seller)
  const { data: sellerResp, isLoading: isSellerLoading } =
    useGetSellerListQuery({
      page: 1,
      paginate: 200,
    });
  const sellers: Seller[] = useMemo(() => sellerResp?.data ?? [], [sellerResp]);

  const { data: merkData } = useGetProductMerkListQuery({
    page: 1,
    paginate: 100,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);

  // helper type-guard
  const hasSellerId = (o: unknown): o is { seller_id: number } =>
    typeof o === "object" &&
    o !== null &&
    "seller_id" in o &&
    typeof (o as Record<"seller_id", unknown>).seller_id === "number";

  const hasShopId = (o: unknown): o is { shop_id: number } =>
    typeof o === "object" &&
    o !== null &&
    "shop_id" in o &&
    typeof (o as Record<"shop_id", unknown>).shop_id === "number";

  // ambil shop id dari seller yang dipilih (kalau ada)
  const selectedSellerShopId = useMemo(() => {
    const s = sellers.find((x) => x.id === sellerId);
    return s?.shop?.id ?? null;
  }, [sellers, sellerId]);

  const filteredList = useMemo(() => {
    let list = categoryList;

    // by category
    if (category && category !== "all") {
      list = list.filter(
        (item) =>
          item.product_category_id?.toString() === category ||
          item.category_name?.toLowerCase() === category.toLowerCase() ||
          item.category_slug?.toLowerCase?.() === category.toLowerCase?.()
      );
    }

    // ✅ by seller
    if (sellerId !== null) {
      list = list.filter((item) => {
        const matchSellerId = hasSellerId(item) && item.seller_id === sellerId;
        const matchShopId =
          selectedSellerShopId !== null &&
          hasShopId(item) &&
          item.shop_id === selectedSellerShopId;
        return matchSellerId || matchShopId;
      });
    }

    // by search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.merk_name?.toLowerCase().includes(q) ||
          item.category_name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [categoryList, category, sellerId, selectedSellerShopId, query]);

  const lastPage = useMemo(() => data?.last_page || 1, [data]);
  const merkList = useMemo(() => merkData?.data || [], [merkData]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleSubmit = async () => {
    try {
      const payload = new FormData();

      // === VALIDATION ===
      if (!form.name || form.name.trim() === "") {
        throw new Error("Nama produk wajib diisi");
      }
      if (!form.product_category_id) {
        throw new Error("Kategori produk wajib dipilih");
      }
      if (!form.product_merk_id) {
        throw new Error("Merk produk wajib dipilih");
      }

      const selectedMerk = merkList?.find((m) => m.id === form.product_merk_id);
      const isJasaMerk = selectedMerk?.name?.toLowerCase() === "jasa";

      // Jasa: harga wajib > 0
      if (isJasaMerk) {
        if (!form.price || form.price <= 0) {
          throw new Error(
            "Harga wajib diisi dan harus lebih dari 0 untuk layanan Jasa"
          );
        }
        // Durasi opsional di form, tapi jika tidak diisi set 1
        // (atau validasi sesuai kebutuhanmu)
      } else {
        // Barang: stock wajib diisi (>= 0)
        const stockNum =
          typeof form.stock === "number"
            ? form.stock
            : parseInt(String(form.stock ?? "0"), 10);
        if (Number.isNaN(stockNum) || stockNum < 0) {
          throw new Error("Stok wajib diisi dan tidak boleh negatif");
        }
      }

      // === REQUIRED FIELDS ===
      payload.append("shop_id", "1");

      // price (jangan dobel lagi)
      const priceValue =
        form.price !== undefined && form.price !== null
          ? Number(form.price)
          : 0;
      payload.append("price", String(priceValue));

      // stock: WAJIB ADA untuk backend (isi 0 jika jasa)
      const stockValue = isJasaMerk
        ? 0
        : (() => {
            const n =
              typeof form.stock === "number"
                ? form.stock
                : parseInt(String(form.stock ?? "0"), 10);
            return Number.isNaN(n) ? 0 : n;
          })();
      payload.append("stock", String(stockValue));

      // dimension/weight (tetap aman string angka)
      payload.append("weight", form.weight ? String(form.weight) : "0");
      payload.append("length", form.length ? String(form.length) : "0");
      payload.append("width", form.width ? String(form.width) : "0");
      payload.append("height", form.height ? String(form.height) : "0");

      // duration:
      // - Jika Jasa: kirim duration dari form (default 1 jika kosong)
      // - Jika Bukan Jasa: TIDAK PERLU, jangan kirim (hindari kebingungan dgn stock)
      // if (isJasaMerk) {
      //   payload.append("duration", form.duration ? String(form.duration) : "1");
      // }

      // === OPTIONAL FIELDS ===
      if (form.name) payload.append("name", form.name);
      if (form.description) payload.append("description", form.description);
      if (form.product_category_id)
        payload.append("product_category_id", String(form.product_category_id));
      if (form.product_merk_id)
        payload.append("product_merk_id", String(form.product_merk_id));
      payload.append("status", form.status ? "1" : "0");

      console.log(payload);

      // === IMAGE HANDLING ===
      const imageFields = [
        "image",
        "image_2",
        "image_3",
        "image_4",
        "image_5",
        "image_6",
        "image_7",
      ] as const;

      if (editingSlug) {
        // EDIT
        payload.append("_method", "PUT");

        imageFields.forEach((fieldName) => {
          const imageValue = form[fieldName];
          if (imageValue && imageValue instanceof File) {
            payload.append(fieldName, imageValue);
          } else if (typeof imageValue === "string" && imageValue) {
            // pertahankan url lama (jika backend butuh)
            payload.append(fieldName, imageValue);
          }
        });

        await updateProduct({ slug: editingSlug, payload }).unwrap();
        Swal.fire("Sukses", "Produk diperbarui", "success");
      } else {
        // CREATE
        if (!form.image) {
          throw new Error("Minimal 1 gambar wajib diisi untuk produk baru");
        }
        imageFields.forEach((fieldName) => {
          const imageValue = form[fieldName];
          if (imageValue instanceof File) {
            payload.append(fieldName, imageValue);
          }
        });

        await createProduct(payload).unwrap();
        Swal.fire("Sukses", "Produk ditambahkan", "success");
      }

      setForm({ status: 1 });
      setEditingSlug(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire(
        "Gagal",
        error instanceof Error ? error.message : "Terjadi kesalahan",
        "error"
      );
    }
  };

  const handleEdit = (item: Product) => {
    setForm({ ...item, status: item.status });
    setEditingSlug(item.slug);
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
      title: "Yakin hapus Produk?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProduct(item.slug.toString()).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Produk dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Produk", "error");
        console.error(error);
      }
    }
  };

  const categoryOptions = useMemo(() => {
    const arr = catData?.data ?? [];
    if (arr.length > 0) {
      return [
        { value: "all", label: "Semua Kategori" },
        ...arr.map((c: { id: number; name: string }) => ({
          value: String(c.id),
          label: c.name,
        })),
      ];
    }

    // ✅ fallback: kalau master belum ada/masih loading, pakai derivasi dari list produk (versi lamamu)
    const set = new Set<string>();
    (data?.data ?? []).forEach((p) => {
      if (p.product_category_id) set.add(String(p.product_category_id));
      else if (p.category_name) set.add(p.category_name.toLowerCase());
    });
    const labelMap = new Map<string, string>();
    (data?.data ?? []).forEach((p) => {
      const key = p.product_category_id
        ? String(p.product_category_id)
        : (p.category_name ?? "").toLowerCase();
      if (key) labelMap.set(key, p.category_name ?? key);
    });

    return [
      { value: "all", label: "Semua Kategori" },
      ...Array.from(set).map((v) => ({
        value: v,
        label: labelMap.get(v) ?? v,
      })),
    ];
  }, [catData, data]);

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={openModal}
        onSearchChange={(q) => setQuery(q)}
        enableStatusFilter
        statusOptions={categoryOptions}
        initialStatus={category}
        onStatusChange={(val) => setCategory(val as CategoryFilter)}
        enableSellerFilter
        isSuperAdmin={true}
        sellers={sellers}
        selectedSellerId={sellerId}
        onSellerChange={setSellerId}
        isSellerLoading={isSellerLoading}
        onResetAllFilters={() => {
          setQuery("");
          setCategory("all");
          setSellerId(null);
          setCurrentPage(1);
          refetch();
        }}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Merk</th>
                <th className="px-4 py-2">Produk</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Stok</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2 whitespace-nowrap">T. Views</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <ActionsGroup
                        handleDetail={() => handleDetail(item)}
                        handleEdit={() => handleEdit(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.category_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.merk_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatRupiahWithRp(item.price)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.stock}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.rating}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.total_reviews}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
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
              setForm({ status: 1 });
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