"use client";

import React from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, ShoppingCart } from "lucide-react";

import { Combobox } from "@/components/ui/combo-box";
import { useGetSupplierListQuery } from "@/services/master/supplier.service";
import { Supplier } from "@/types/master/supplier";

import type {
  PurchaseOrder,
  PurchaseOrderDetail,
  CreatePurchaseOrderRequest,
} from "@/types/admin/pengadaan";
import { formatRupiah, parseRupiah } from "@/lib/format-utils";

type MinimalShop = { id: number; name: string };
type MeData = { id: number; name: string; shop?: MinimalShop } | null;

type ProductLite = {
  id: number;
  name: string;
  category_name?: string;
  merk_name?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PurchaseOrder | null;
  meData: MeData;
  products: ProductLite[];
  onSubmit: (
    payload: CreatePurchaseOrderRequest | PurchaseOrder
  ) => Promise<void> | void;
  isLoadingFromServer?: boolean; // optional indicator saat fetch by-id
};

export default function PurchaseOrderForm({
  open,
  onOpenChange,
  initialData,
  meData,
  products,
  onSubmit,
  isLoadingFromServer,
}: Props) {
  const isEdit = Boolean(initialData);

  // Gabungkan produk global dengan produk dari details.product (by-id response)
  const productsFromPO: ProductLite[] = React.useMemo(() => {
    const arr = initialData?.details?.map((d) => d.product)?.filter(Boolean) as
      | ProductLite[]
      | undefined;
    return arr ?? [];
  }, [initialData]);

  const productsDisplay: ProductLite[] = React.useMemo(() => {
    const map = new Map<number, ProductLite>();
    for (const p of products) map.set(p.id, p);
    for (const p of productsFromPO) map.set(p.id, p); // ensure ada
    return Array.from(map.values());
  }, [products, productsFromPO]);

  function buildFormState(
    init: PurchaseOrder | null,
    me: MeData
  ): PurchaseOrder {
    return {
      id: init?.id ?? 0,
      user_id: init?.user_id ?? me?.id ?? 0,
      shop_id: init?.shop_id ?? me?.shop?.id ?? 0,
      supplier: init?.supplier ?? "",
      supplier_id: init?.supplier_id ?? 0,
      supplier_name: init?.supplier_name ?? "",
      date: init?.date ?? "",
      notes: init?.notes ?? "",
      total: init?.total ?? 0,
      paid: init?.paid ?? 0,
      due: init?.due ?? 0,
      status: init?.status ?? true,
      created_at: init?.created_at ?? "",
      updated_at: init?.updated_at ?? "",
      details:
        init?.details?.map((d) => ({
          id: d.id,
          product_id: d.product_id,
          quantity: d.quantity,
          price: d.price,
          discount: d.discount,
          tax: d.tax,
          total: d.total,
          product: d.product
            ? {
                id: d.product.id,
                name: d.product.name,
                slug: d.product.slug,
              }
            : undefined,
        })) ?? [],
    };
  }

  const [form, setForm] = React.useState<PurchaseOrder>(() =>
    buildFormState(initialData, meData)
  );

  // Paid input (rupiah)
  const [paidInput, setPaidInput] = React.useState<string>(
    formatRupiah(form.paid || 0)
  );

  // Price inputs per detail (rupiah)
  const [priceInputs, setPriceInputs] = React.useState<string[]>(() =>
    form.details.map((d) => formatRupiah(d.price || 0))
  );

  // Reset form ketika dialog dibuka (ambil data terbaru by-id dari parent)
  React.useEffect(() => {
    if (open) {
      const next = buildFormState(initialData, meData);
      setForm(next);
      setPaidInput(formatRupiah(next.paid || 0));
      setPriceInputs(next.details.map((d) => formatRupiah(d.price || 0)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, meData]);

  // Supplier combobox
  const [supplierSearch, setSupplierSearch] = React.useState("");
  const { data: supplierResp, isLoading: supplierLoading } =
    useGetSupplierListQuery({
      page: 1,
      paginate: 50,
      search: supplierSearch || undefined,
    });
  const suppliers: Supplier[] = supplierResp?.data ?? [];

  // Sync display paid saat nilai paid berubah dari form
  React.useEffect(() => {
    setPaidInput(formatRupiah(form.paid || 0));
  }, [form.paid]);

  // Hitung total & due otomatis
  React.useEffect(() => {
    const total = form.details.reduce((sum, d) => sum + (d.total || 0), 0);
    const due = total - (form.paid || 0);
    setForm((prev) => ({ ...prev, total, due }));
  }, [form.details, form.paid]);

  const updateDetail = (
    index: number,
    field: keyof PurchaseOrderDetail,
    value: number
  ) => {
    const details = [...form.details];
    const current = { ...details[index], [field]: value };

    const subtotal =
      (current.quantity || 0) * (current.price || 0) - (current.discount || 0);
    current.tax = Math.round(subtotal * 0.11);
    current.total = subtotal + current.tax;

    details[index] = current;
    setForm((prev) => ({ ...prev, details }));
  };

  const addDetail = () => {
    const newDetail: PurchaseOrderDetail = {
      product_id: 0,
      quantity: 0,
      price: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
    setForm((prev) => ({ ...prev, details: [...prev.details, newDetail] }));
    setPriceInputs((prev) => [...prev, ""]); // input tampilan baru
  };

  const removeDetail = (index: number) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
    setPriceInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp");

  const handleClose = () => onOpenChange(false);

  // ====== Harga (Price) berformat rupiah per baris ======
  React.useEffect(() => {
    // jaga-jaga jika jumlah details berubah (add/remove)
    setPriceInputs((prev) => {
      const next = form.details.map((d, i) =>
        prev[i] !== undefined ? prev[i] : formatRupiah(d.price || 0)
      );
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.details.length]);

  const handlePriceChange = (idx: number, raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    const normalized = priceInputs[idx] === "0" ? digitsOnly : raw;

    const value = parseRupiah(normalized); // number murni
    const display = formatRupiah(normalized);

    setPriceInputs((arr) => {
      const copy = [...arr];
      copy[idx] = display;
      return copy;
    });

    updateDetail(idx, "price", value);
  };

  const handlePriceFocus = (idx: number) => {
    if (parseRupiah(priceInputs[idx] || "0") === 0) {
      setPriceInputs((arr) => {
        const copy = [...arr];
        copy[idx] = "";
        return copy;
      });
    }
  };

  const handlePriceBlur = (idx: number) => {
    const val = form.details[idx]?.price || 0;
    setPriceInputs((arr) => {
      const copy = [...arr];
      copy[idx] = formatRupiah(val);
      return copy;
    });
  };

  // ====== Submit ======
  const handleSubmit = async () => {
    if (!form.user_id || !form.shop_id || !form.supplier_id || !form.date) {
      Swal.fire(
        "Error",
        "User, Shop, Supplier, dan Tanggal wajib diisi",
        "error"
      );
      return;
    }
    if (form.details.length === 0) {
      Swal.fire("Error", "Minimal 1 detail produk harus ditambahkan", "error");
      return;
    }

    const basePayload = {
      user_id: form.user_id,
      shop_id: form.shop_id,
      supplier: form.supplier_name || form.supplier, // kompatibel dengan create lama
      date: form.date,
      notes: form.notes,
      total: form.total,
      paid: form.paid,
      due: form.due,
      status: form.status,
      details: form.details.map((d) => ({
        product_id: d.product_id,
        quantity: d.quantity,
        price: d.price,
        discount: d.discount,
        tax: d.tax,
        total: d.total,
      })),
    };

    if (isEdit && form.id) {
      const updatePayload: PurchaseOrder = {
        ...form,
        ...basePayload,
        supplier_id: form.supplier_id,
        supplier_name: form.supplier_name,
        id: form.id,
      };
      await onSubmit(updatePayload);
    } else {
      const createPayload: CreatePurchaseOrderRequest = { ...basePayload };
      await onSubmit(createPayload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-4xl min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            {isEdit ? "Edit Purchase Order" : "Tambah Purchase Order"}
          </DialogTitle>
        </DialogHeader>

        {/* Optional: indikator loading data by-id */}
        {isLoadingFromServer && (
          <div className="mb-2 text-sm text-gray-500">
            Memuat data terbaru...
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">User</Label>
              <Select
                value={form.user_id ? String(form.user_id) : undefined}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, user_id: Number(v) }))
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="👤 Pilih User..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {meData ? (
                    <SelectItem value={String(meData.id)}>
                      {meData.name}
                    </SelectItem>
                  ) : (
                    <SelectItem value="no-user" disabled>
                      Tidak ada user
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Shop */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Shop</Label>
              <Select
                value={form.shop_id ? String(form.shop_id) : undefined}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, shop_id: Number(v) }))
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="🏪 Pilih Shop..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {meData?.shop ? (
                    <SelectItem value={String(meData.shop.id)}>
                      {meData.shop.name}
                    </SelectItem>
                  ) : (
                    <SelectItem value="no-shop" disabled>
                      Tidak ada shop
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier (Combobox) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Supplier
              </Label>
              <Combobox<Supplier>
                value={form.supplier_id || null}
                onChange={(id) => {
                  const s = suppliers.find((x) => x.id === id);
                  setForm((prev) => ({
                    ...prev,
                    supplier_id: id,
                    supplier_name: s?.name ?? "",
                    supplier: s?.name ?? prev.supplier,
                  }));
                }}
                onSearchChange={setSupplierSearch}
                data={suppliers}
                isLoading={supplierLoading}
                placeholder="Pilih Supplier"
                getOptionLabel={(s) => s.name}
                buttonClassName="h-11"
              />
              {(!form.supplier_id || !form.supplier_name) && (
                <p className="text-xs text-gray-500">Wajib pilih supplier</p>
              )}
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Tanggal
              </Label>
              <Input
                type="date"
                value={form.date ? formatDateForInput(form.date) : ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="h-11"
              />
            </div>

            {/* Dibayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Jumlah Dibayar
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={paidInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  const paid = parseRupiah(raw);
                  setPaidInput(formatRupiah(raw));
                  setForm((p) => ({ ...p, paid, due: (p.total || 0) - paid }));
                }}
                onFocus={() => {
                  if (parseRupiah(paidInput || "0") === 0) setPaidInput("");
                }}
                onBlur={() => {
                  setPaidInput(formatRupiah(form.paid || 0));
                }}
                className="h-11"
                placeholder="0"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <select
                value={form.status ? "1" : "0"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value === "1" }))
                }
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Lunas</option>
                <option value="0">Belum Lunas</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Catatan</Label>
            <Textarea
              rows={3}
              value={form.notes || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Masukkan catatan (opsional)"
            />
          </div>

          {/* Detail Produk */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Detail Produk
              </Label>
              <Button
                size="sm"
                onClick={addDetail}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>

            {form.details.map((detail, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Produk #{idx + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeDetail(idx)}
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Minus className="h-4 w-4" />
                    Hapus
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Product */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Product
                    </Label>
                    <Select
                      value={
                        detail.product_id
                          ? String(detail.product_id)
                          : undefined
                      }
                      onValueChange={(v) =>
                        updateDetail(idx, "product_id", Number(v))
                      }
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="📦 Pilih Product..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {productsDisplay.length === 0 ? (
                          <SelectItem value="no-products" disabled>
                            Tidak ada product
                          </SelectItem>
                        ) : (
                          productsDisplay.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{p.name}</span>
                                {p.category_name && (
                                  <span className="text-xs text-gray-500">
                                    - {p.category_name}
                                  </span>
                                )}
                                {p.merk_name && (
                                  <span className="text-xs text-blue-500">
                                    ({p.merk_name})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      value={detail.quantity || 0}
                      onChange={(e) =>
                        updateDetail(idx, "quantity", Number(e.target.value))
                      }
                      className="h-10"
                      placeholder="Quantity"
                    />
                  </div>

                  {/* Price (formatted rupiah) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Price
                    </Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={
                        priceInputs[idx] ?? formatRupiah(detail.price || 0)
                      }
                      onChange={(e) => handlePriceChange(idx, e.target.value)}
                      onFocus={() => handlePriceFocus(idx)}
                      onBlur={() => handlePriceBlur(idx)}
                      className="h-10"
                      placeholder="0"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Discount
                    </Label>
                    <Input
                      type="number"
                      value={detail.discount || 0}
                      onChange={(e) =>
                        updateDetail(idx, "discount", Number(e.target.value))
                      }
                      className="h-10"
                      placeholder="Discount"
                    />
                  </div>

                  {/* Tax */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Tax (11%)
                    </Label>
                    <Input
                      type="number"
                      value={detail.tax || 0}
                      disabled
                      className="h-10 bg-gray-100"
                    />
                  </div>

                  {/* Total */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Total
                    </Label>
                    <Input
                      type="number"
                      value={detail.total || 0}
                      disabled
                      className="h-10 bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            {form.details.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Purchase Order:</span>
                  <span className="text-green-600">
                    {formatCurrency(form.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Due Amount:</span>
                  <span className="text-orange-600">
                    {formatCurrency(form.due)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} className="h-10 px-6">
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !form.user_id ||
              !form.shop_id ||
              !form.supplier_id ||
              !form.date ||
              form.details.length === 0
            }
            className="h-10 px-6"
          >
            {isEdit ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}