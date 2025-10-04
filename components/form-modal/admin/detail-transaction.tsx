"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useGetTransactionByIdQuery } from "@/services/admin/transaction.service";
import { Transaction } from "@/types/admin/transaction";

/* ===================== Helpers (tanpa any) ===================== */
type ShipmentDetail = { name?: string; service?: string };
function parseShipmentDetail(raw: unknown): ShipmentDetail {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const obj = JSON.parse(raw) as unknown;
      if (typeof obj === "object" && obj !== null) {
        const name =
          "name" in obj && typeof (obj as { name?: unknown }).name === "string"
            ? (obj as { name: string }).name
            : undefined;
        const service =
          "service" in obj &&
          typeof (obj as { service?: unknown }).service === "string"
            ? (obj as { service: string }).service
            : undefined;
        return { name, service };
      }
      return {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as { name?: string; service?: string };
    return { name: obj.name, service: obj.service };
  }
  return {};
}

type ProductDetailObj = { name?: string };
function formatProductDetail(detail: unknown): string {
  if (typeof detail === "string") {
    try {
      const parsed = JSON.parse(detail) as unknown;
      if (typeof parsed === "object" && parsed && "name" in parsed) {
        return (
          (parsed as ProductDetailObj).name ?? "Nama Produk Tidak Diketahui"
        );
      }
      return "Nama Produk Tidak Diketahui";
    } catch {
      return "Data Produk Rusak";
    }
  }
  if (typeof detail === "object" && detail && "name" in detail) {
    return (detail as ProductDetailObj).name ?? "Nama Produk Tidak Diketahui";
  }
  return "Nama Produk Tidak Diketahui";
}

type TransactionStatusKey = 0 | 1 | 2 | -1 | -2 | -3;
type TransactionStatusInfo = {
  label: string;
  variant: "secondary" | "default" | "success" | "destructive";
};
const TRANSACTION_STATUS: Record<TransactionStatusKey, TransactionStatusInfo> =
  {
    0: { label: "PENDING", variant: "secondary" },
    1: { label: "CAPTURED", variant: "default" },
    2: { label: "SETTLEMENT", variant: "success" },
    [-1]: { label: "DENY", variant: "destructive" },
    [-2]: { label: "EXPIRED", variant: "destructive" },
    [-3]: { label: "CANCEL", variant: "destructive" },
  };
function getStatusInfo(status: number): TransactionStatusInfo {
  return (
    TRANSACTION_STATUS[status as TransactionStatusKey] || {
      label: "UNKNOWN",
      variant: "secondary",
    }
  );
}
function formatRupiah(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(numAmount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numAmount)
    .replace("IDR", "Rp");
}
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    return String(error);
  }
}

/* ====== Typing detail item biar map() tidak implicit any ====== */
type StoreDetailItem = {
  product_detail: unknown;
  quantity: number;
  total: number | string;
};
function isStoreDetailItem(x: unknown): x is StoreDetailItem {
  return (
    typeof x === "object" &&
    x !== null &&
    "product_detail" in x &&
    "quantity" in x &&
    "total" in x &&
    typeof (x as { quantity: unknown }).quantity === "number"
  );
}

/* ===================== Component ===================== */
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | null;
};

export function TransactionDetailModal({
  open,
  onOpenChange,
  transactionId,
}: Props) {
  const {
    data: transactionDetail,
    isLoading,
    isError,
  } = useGetTransactionByIdQuery(
    transactionId !== null ? transactionId.toString() : "",
    { skip: !transactionId }
  );

  // Hindari error flatMap pada undefined
  const stores = Array.isArray(transactionDetail?.stores)
    ? transactionDetail!.stores
    : [];

  const detailItems: StoreDetailItem[] = stores.flatMap((s) =>
    Array.isArray(s.details) ? s.details.filter(isStoreDetailItem) : []
  );

  const firstStore = stores[0];
  const ship = parseShipmentDetail(firstStore?.shipment_detail);
  const transactionData = transactionDetail as Transaction | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>

        {!transactionId ? (
          <div className="text-center p-8 text-muted-foreground">
            Tidak ada transaksi yang dipilih.
          </div>
        ) : isLoading ? (
          <div className="text-center p-8">Memuat detail...</div>
        ) : isError || !transactionDetail ? (
          <div className="text-center p-8 text-red-500">
            Gagal memuat detail transaksi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ringkasan Transaksi</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>ID Transaksi:</strong> {transactionDetail.reference}
                </p>
                <p>
                  <strong>Nama Pelanggan:</strong> {transactionDetail.user_name}
                </p>
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {formatDateTime(transactionDetail.created_at)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={getStatusInfo(transactionDetail.status).variant}
                  >
                    {getStatusInfo(transactionDetail.status).label}
                  </Badge>
                </p>
                <p>
                  <strong>Metode Pembayaran:</strong>{" "}
                  {transactionDetail.payment_method}
                </p>
                {transactionDetail.expires_at && (
                  <p>
                    <strong>Kedaluwarsa:</strong>{" "}
                    {formatDateTime(transactionDetail.expires_at)}
                  </p>
                )}
              </div>

              {/* Payment Proof */}
              {transactionDetail.payment_proof && (
                <div className="mt-4">
                  <h4 className="text-base font-semibold">Bukti Pembayaran</h4>
                  <a
                    href={transactionDetail.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={transactionDetail.payment_proof}
                      alt="Bukti Pembayaran"
                      className="w-full h-auto mt-2 rounded-lg object-contain border"
                    />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Items and Shipping */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Produk</h3>
                <div className="space-y-2">
                  {detailItems.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Tidak ada item
                    </div>
                  ) : (
                    detailItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">
                            {formatProductDetail(item.product_detail)}
                          </p>
                          <p className="text-muted-foreground">
                            Jumlah: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatRupiah(item.total)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {stores.length > 0 && (
                <div>
                  <p>
                    <strong>Alamat:</strong> {transactionData?.address_line_1}{" "}
                    {transactionData?.postal_code}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Alamat:</strong>{" "}
                      {transactionDetail.address_line_1}{" "}
                      {transactionDetail.postal_code}
                    </p>
                    <p>
                      <strong>Kurir:</strong> {ship.name ?? "-"}
                      {ship.service ? ` (${ship.service})` : ""}
                    </p>
                    <p>
                      <strong>Biaya:</strong>{" "}
                      {formatRupiah(transactionDetail.shipment_cost)}
                    </p>
                    <p>
                      <strong>Status Pengiriman:</strong>{" "}
                      {firstStore?.shipment_status ?? "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-base font-medium">
                  <span>Total Harga:</span>
                  <span>{formatRupiah(transactionDetail.total)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-orange-600">
                  <span>Diskon:</span>
                  <span>{formatRupiah(transactionDetail.discount_total)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total Akhir:</span>
                  <span>{formatRupiah(transactionDetail.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}