// order-detail-modal.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";
import { X, Upload, Truck, CreditCard, QrCode } from "lucide-react";
import Swal from "sweetalert2";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";
import type { Order } from "./types";
import { getStatusColor, getStatusText } from "./types";
import { displayDate } from "@/lib/format-utils";
import type {
  ApiTransactionByIdData,
  ShipmentDetail,
} from "./transaction-by-id";
import type { Payment } from "@/types/admin/simpanan";

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order;
  detail?: ApiTransactionByIdData; // dari API
  detailLoading?: boolean; // tambahan
  onOpenUploadProof: () => void;
};

// detail yang mengandung payment (beberapa API menaruhnya di root)
type PaymentLike = Payment & {
  snap_token?: string;
  redirect_url?: string;
  qr_url?: string;
  qr_base64?: string;
};
type TxnWithPayment = ApiTransactionByIdData & { payment?: PaymentLike };

const hasPayment = (d?: ApiTransactionByIdData): d is TxnWithPayment =>
  Boolean(d && "payment" in d);

export default function OrderDetailModal({
  open,
  onClose,
  order,
  detail,
  detailLoading = false,
  onOpenUploadProof,
}: Props) {
  // ---- HINDARI early return sebelum hook ----

  // -- Shipment
  const firstShop = detail?.shops?.[0];
  const ship: ShipmentDetail | undefined = useMemo(() => {
    if (!firstShop?.shipment_detail) return undefined;
    try {
      return JSON.parse(firstShop.shipment_detail) as ShipmentDetail;
    } catch {
      return undefined;
    }
  }, [firstShop?.shipment_detail]);

  // -- Produk SELALU dari detail.shops[].details[].product
  const detailItems = useMemo(() => {
    const shops = detail?.shops ?? [];
    return shops.flatMap((s) =>
      (s.details ?? []).map((det) => {
        let name = det.product?.name ?? "Produk";
        if (!det.product?.name && det.product_detail) {
          try {
            const parsed = JSON.parse(det.product_detail) as { name?: string };
            if (parsed.name) name = parsed.name;
          } catch {
            /* ignore */
          }
        }
        return {
          id: String(det.id),
          name,
          image: det.product?.image ?? "",
          quantity: det.quantity ?? 1,
          price: det.price ?? 0,
        };
      })
    );
  }, [detail?.shops]);

  // -- Flags
  const canUploadManual =
    (order.payment_method === "manual" ||
      order.payment_method === "transfer") &&
    !order.payment_proof;

  const waitingAndNoMethod =
    (order.status === "pending" || detail?.status === 0) &&
    (!order.payment_method ||
      order.payment_method === "-" ||
      order.payment_method === "");

  // -- Actions
  const handleResumePayment = async () => {
    // belum siap
    if (detailLoading || !detail) {
      await Swal.fire({
        title: "Memuat…",
        text: "Sedang mengambil detail pembayaran.",
        icon: "info",
        timer: 900,
        showConfirmButton: false,
      });
      return;
    }

    // ada payment → langsung tampilkan modal instruksi (payment:{})
    if (hasPayment(detail) && detail.payment) {
      await showPaymentInstruction(detail.payment);
      return;
    }

    // fallback: tidak ada payment → tampilkan list produk
    const listHtml =
      detailItems.length === 0
        ? `<div class="text-gray-500">Tidak ada item produk pada transaksi ini.</div>`
        : detailItems
            .map(
              (it) => `
              <div style="display:flex;gap:10px;align-items:center;margin:6px 0;">
                ${
                  it.image
                    ? `<img src="${it.image}" alt="${it.name}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />`
                    : `<div style="width:40px;height:40px;border-radius:8px;background:#f3f4f6;border:1px solid #eee;"></div>`
                }
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${
                    it.name
                  }</div>
                  <div style="font-size:12px;color:#6b7280;">Qty: ${
                    it.quantity
                  }</div>
                </div>
                <div style="font-weight:600;color:#111827;white-space:nowrap;">
                  Rp ${(it.price * it.quantity).toLocaleString("id-ID")}
                </div>
              </div>`
            )
            .join("");

    await Swal.fire({
      icon: "info",
      title: "Instruksi pembayaran belum siap",
      html: `
        <div style="text-align:left">
          <p style="margin:0 0 6px;color:#374151">Sistem belum mengembalikan <b>objek payment</b> untuk transaksi ini.</p>
          <p style="margin:0 0 12px;color:#6b7280">Silakan coba lagi beberapa saat, atau pilih metode lain.</p>
          <div style="border-top:1px dashed #e5e7eb;margin:10px 0 8px"></div>
          <div style="font-weight:700;color:#374151;margin-bottom:6px">Produk dalam pesanan</div>
          ${listHtml}
        </div>`,
      confirmButtonText: "Mengerti",
    });
  };

  // ---- Guard dipindah ke SINI (setelah semua hook terpanggil) ----
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Detail Pesanan #{order.orderNumber}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
              <span className="text-sm text-gray-500">
                {displayDate(order.date)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items dari detail */}
        <div className="space-y-4">
          {detailItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden">
                <Image
                  src={item.image || "/api/placeholder/64/64"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </div>
                <div className="text-sm text-gray-500">
                  @Rp {item.price.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 border-t border-gray-200" />

        {/* Payment & Shipping (singkat) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <CreditCard className="w-4 h-4" /> Metode Pembayaran
            </div>
            <div className="text-sm text-gray-700 capitalize">
              {order.payment_method ?? "-"}
            </div>
            {waitingAndNoMethod && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Status: <b>Menunggu pembayaran</b>. Klik{" "}
                <b>Lanjutkan Pembayaran</b> untuk membuka instruksi.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <Truck className="w-4 h-4" /> Pengiriman
            </div>
            {ship?.name && (
              <div className="text-sm text-gray-700">
                Kurir: <span className="font-medium">{ship.name}</span>
                {ship.service ? ` • ${ship.service}` : ""}
                {ship.etd ? ` • Estimasi ${ship.etd}` : ""}
              </div>
            )}
            {order.address_line_1 && (
              <div className="text-sm text-gray-700">
                Alamat:{" "}
                <span className="font-medium">
                  {order.address_line_1}
                  {order.postal_code ? `, ${order.postal_code}` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="my-6 border-t border-gray-200" />

        {/* Summary */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              Subtotal:{" "}
              <span className="font-semibold text-gray-900">
                Rp {Math.max(0, order.total).toLocaleString("id-ID")}
              </span>
            </div>
            {typeof order.shipment_cost === "number" && (
              <div>
                Ongkir:{" "}
                <span className="font-semibold text-gray-900">
                  Rp {order.shipment_cost.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {typeof order.discount_total === "number" &&
              order.discount_total > 0 && (
                <div>
                  Diskon:{" "}
                  <span className="font-semibold text-gray-900">
                    -Rp {order.discount_total.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Grand Total</div>
            <div className="text-2xl font-bold text-[#6B6B6B]">
              Rp {order.grand_total.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            Tutup
          </button>

          {canUploadManual && (
            <button
              onClick={onOpenUploadProof}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#6B6B6B] text-white rounded-xl hover:bg-[#5a5a5a] inline-flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Bukti Pembayaran
            </button>
          )}

          {waitingAndNoMethod && (
            <button
              onClick={handleResumePayment}
              disabled={detailLoading || !detail}
              aria-busy={detailLoading || !detail}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl inline-flex items-center justify-center gap-2 ${
                detailLoading || !detail
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <QrCode className="w-4 h-4" />
              {detailLoading || !detail
                ? "Menyiapkan…"
                : "Lanjutkan Pembayaran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}