"use client";

import { useEffect, useMemo } from "react";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Package } from "lucide-react";

import type { StockOpname } from "@/types/admin/stock-opname";
import type { Seller } from "@/services/admin/seller.service";
import type { Product } from "@/types/admin/product";
import { formatDateForInput } from "@/lib/format-utils";

// ===== Helper type guards (tanpa any) =====
type MaybeStockFields = { stock?: number; qty?: number; quantity?: number };
type MaybeOwnerFields = { user_id?: number; shop_id?: number };

function readProductStock(p: Product): number {
  const x = p as unknown as MaybeStockFields;
  return (
    (typeof x.stock === "number" ? x.stock : undefined) ??
    (typeof x.qty === "number" ? x.qty : undefined) ??
    (typeof x.quantity === "number" ? x.quantity : undefined) ??
    0
  );
}

function productBelongsToOwner(
  p: Product,
  selectedUserId: number | null,
  selectedShopId: number | null
): boolean {
  const o = p as unknown as MaybeOwnerFields;
  const matchByUser =
    typeof o.user_id === "number" &&
    selectedUserId !== null &&
    o.user_id === selectedUserId;
  const matchByShop =
    typeof o.shop_id === "number" &&
    selectedShopId !== null &&
    o.shop_id === selectedShopId;
  return matchByUser || matchByShop;
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isEditMode: boolean;
  isSubmitting: boolean;
  form: StockOpname;
  setForm: (f: StockOpname | ((prev: StockOpname) => StockOpname)) => void;

  // data
  meData:
    | {
        id: number;
        name: string;
        email: string;
        shop?: { id: number; name: string; email?: string };
      }
    | undefined;
  sellers: Seller[];
  productsList: Product[];

  // seller yang dipilih (disatukan user+shop)
  selectedSellerId: number | null;
  setSelectedSellerId: (id: number | null) => void;
  selectedSellerShopId: number | null;

  onSubmit: () => Promise<void> | void;
};

export default function StockOpnameFormModal({
  open,
  onOpenChange,
  isEditMode,
  isSubmitting,
  form,
  setForm,
  meData,
  sellers,
  productsList,
  selectedSellerId,
  setSelectedSellerId,
  selectedSellerShopId,
  onSubmit,
}: Props) {
  // ===== Filter produk by seller/shop =====
  const filteredProducts = useMemo(() => {
    if (selectedSellerId === null && selectedSellerShopId === null) return [];
    return productsList.filter((p) =>
      productBelongsToOwner(p, selectedSellerId, selectedSellerShopId)
    );
  }, [productsList, selectedSellerId, selectedSellerShopId]);

  // ===== Saat seller dipilih: set user_id & shop_id bersamaan + reset product =====
  useEffect(() => {
    if (selectedSellerId === null) return;
    const seller = sellers.find((s) => s.id === selectedSellerId);
    const shopId = seller?.shop?.id ?? null;

    setForm((prev) => ({
      ...prev,
      user_id: selectedSellerId ?? 0,
      shop_id: shopId ?? 0,
      product_id: 0, // reset product agar user pilih ulang sesuai filter
      initial_stock: 0,
      difference: 0,
    }));
  }, [selectedSellerId, sellers, setForm]);

  // ===== Saat product dipilih: auto isi stok awal dari data produk =====
  useEffect(() => {
    if (!form.product_id) return;
    const prod = filteredProducts.find((p) => p.id === form.product_id);
    const init = prod ? readProductStock(prod) : 0;
    setForm((prev) => ({
      ...prev,
      initial_stock: init,
      // Selisih = Stok Awal - Stok Terhitung
      difference: init - (prev.counted_stock || 0),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.product_id]); // hanya saat ganti product

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            {isEditMode ? "Edit Stock Opname" : "Tambah Stock Opname"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ======= Seller/Shop (disatukan) ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Seller / Shop
              </Label>
              <Select
                value={
                  selectedSellerId !== null
                    ? String(selectedSellerId)
                    : undefined
                }
                onValueChange={(v) => setSelectedSellerId(Number(v))}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="👤🏪 Pilih Seller/Shop..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="placeholder-seller" disabled>
                    <span className="text-gray-400 italic">
                      👤🏪 Pilih Seller/Shop...
                    </span>
                  </SelectItem>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        {s.shop?.name && (
                          <span className="text-sm text-gray-500">
                            — {s.shop.name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {!sellers.length && meData?.shop && (
                    <SelectItem value={meData.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{meData.name}</span>
                        <span className="text-sm text-gray-500">
                          — {meData.shop.name}
                        </span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ======= Product (terfilter by seller/shop) ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Product
              </Label>
              <Select
                value={form.product_id ? String(form.product_id) : undefined}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    product_id: Number(v),
                  }))
                }
                disabled={!selectedSellerId && !selectedSellerShopId}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="📦 Pilih Product (by Seller)..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredProducts.length === 0 ? (
                    <SelectItem value="no-products" disabled>
                      <span className="text-gray-500">
                        Tidak ada product untuk seller ini
                      </span>
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="placeholder-product" disabled>
                        <span className="text-gray-400 italic">
                          📦 Pilih Product...
                        </span>
                      </SelectItem>
                      {filteredProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            {"category_name" in p && (
                              <span className="text-sm text-gray-500">
                                -{" "}
                                {(p as unknown as { category_name?: string })
                                  .category_name ?? ""}
                              </span>
                            )}
                            {"merk_name" in p && (
                              <span className="text-xs text-blue-500">
                                (
                                {(p as unknown as { merk_name?: string })
                                  .merk_name ?? ""}
                                )
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              • Stok: {readProductStock(p)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ======= Tanggal ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Tanggal
              </Label>
              <Input
                type="date"
                value={form.date ? formatDateForInput(form.date) : ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="h-11"
              />
            </div>

            {/* ======= Stok Awal (auto dari product, masih bisa disunting) ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Stok Awal
              </Label>
              <Input
                type="number"
                placeholder="Masukkan stok awal..."
                value={form.initial_stock ?? 0} // jika mau tampil 0, pakai ?? 0
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    initial_stock: val,
                    difference: val - (prev.counted_stock || 0), // Selisih = Awal - Terhitung
                  }));
                }}
                readOnly
                className="h-11"
              />
            </div>

            {/* ======= Stok Terhitung (input manual lapangan) ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Stok Terhitung
              </Label>
              <Input
                type="number"
                placeholder="📊"
                value={form.counted_stock || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    counted_stock: val,
                    // Selisih = Stok Awal - Stok Terhitung
                    difference: (prev.initial_stock || 0) - val,
                  }));
                }}
                className="h-11"
              />
            </div>

            {/* ======= Selisih (read only) ======= */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Selisih
              </Label>
              <Input
                type="number"
                value={form.difference || 0}
                disabled
                placeholder="⚡ Selisih dihitung otomatis"
                className="h-11 bg-gray-100"
              />
            </div>
          </div>

          {/* ======= Catatan ======= */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Catatan</Label>
            <Textarea
              placeholder="📝 Masukkan catatan (opsional)..."
              value={form.notes || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 px-6"
          >
            Batal
          </Button>
          <Button
            onClick={() => void onSubmit()}
            disabled={
              isSubmitting ||
              !form.user_id ||
              !form.shop_id ||
              !form.product_id ||
              !form.date
            }
            className="h-10 px-6"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditMode ? "Memperbarui..." : "Menyimpan..."}
              </div>
            ) : isEditMode ? (
              "Perbarui"
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}