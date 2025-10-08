"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X, Upload, Truck, CreditCard, QrCode } from "lucide-react";
import type { Order } from "./types";
import { getStatusColor, getStatusText } from "./types";
import { displayDate } from "@/lib/format-utils";
import type {
  ApiTransactionByIdData,
  ShipmentDetail,
} from "./transaction-by-id";
import Swal from "sweetalert2";
import buildPaymentFromDetail from "@/utils/build-payment-detail";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order;
  detail?: ApiTransactionByIdData;
  onOpenUploadProof: () => void;
};

export default function OrderDetailModal({
  open,
  onClose,
  order,
  detail,
  onOpenUploadProof,
}: Props) {
  // ==== Hooks must be called unconditionally (di atas early return) ====
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const firstShop = detail?.shops?.[0];
  const ship: ShipmentDetail | undefined = useMemo(() => {
    if (!firstShop?.shipment_detail) return undefined;
    try {
      return JSON.parse(firstShop.shipment_detail) as ShipmentDetail;
    } catch {
      return undefined;
    }
  }, [firstShop?.shipment_detail]);

  // ==== Derived flags ====
  const canUploadManual =
    (order.payment_method === "manual" ||
      order.payment_method === "transfer") &&
    !order.payment_proof;

  const waitingAndNoMethod =
    (order.status === "pending" || detail?.status === 0) &&
    (!order.payment_method ||
      order.payment_method === "-" ||
      order.payment_method === "");

  // ==== Early return setelah hooks ====
  if (!open) return null;

  const handleResumePayment = async () => {
    const token = detail?.payment?.snap_token;
    const redirect = detail?.payment?.redirect_url;

    // 1) Kalau ada Snap token & script sudah ter-load → langsung pay
    const w = window as unknown as { snap?: { pay: (t: string) => void } };
    if (token && w.snap?.pay) {
      w.snap.pay(token);
      return;
    }

    // 2) Kalau ada redirect URL → buka tab baru ke gateway
    if (redirect) {
      window.open(redirect, "_blank");
      return;
    }

    // 3) Kalau ada data QR (qr_base64/qr_url) → tampilkan modal instruksi pembayaran (QRIS)
    const paymentPayload = buildPaymentFromDetail(detail);
    if (paymentPayload) {
      await showPaymentInstruction(paymentPayload);
      return;
    }

    // 4) Fallback: BELUM ADA payment dari API → tampilkan SweetAlert + daftar produk
    const items = (detail?.shops ?? [])
      .flatMap((s) => s.details ?? [])
      .map((det) => {
        const p = det.product;
        const parsedName =
          !p && det.product_detail
            ? (() => {
                try {
                  return JSON.parse(det.product_detail).name as
                    | string
                    | undefined;
                } catch {
                  return undefined;
                }
              })()
            : undefined;
        return {
          id: det.id,
          name: p?.name ?? parsedName ?? "Produk",
          img: p?.image || "",
          qty: det.quantity ?? 1,
          price: det.price ?? 0,
        };
      });

    const listHtml =
      items.length === 0
        ? `<div class="text-gray-500">Tidak ada item produk pada transaksi ini.</div>`
        : items
            .map(
              (it) => `
            <div style="display:flex;gap:10px;align-items:center;margin:6px 0;">
              ${
                it.img
                  ? `<img src="${it.img}" alt="${it.name}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />`
                  : `<div style="width:40px;height:40px;border-radius:8px;background:#f3f4f6;border:1px solid #eee;"></div>`
              }
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${
                  it.name
                }</div>
                <div style="font-size:12px;color:#6b7280;">Qty: ${it.qty}</div>
              </div>
              <div style="font-weight:600;color:#111827;white-space:nowrap;">
                Rp ${(it.price * it.qty).toLocaleString("id-ID")}
              </div>
            </div>`
            )
            .join("");

    await Swal.fire({
      icon: "info",
      title: "Instruksi pembayaran belum siap",
      html: `
      <div style="text-align:left">
        <p style="margin:0 0 6px;color:#374151">Sistem belum menerima <b>token/URL pembayaran</b> dari gateway.</p>
        <p style="margin:0 0 12px;color:#6b7280">Silakan coba lagi beberapa saat, atau pilih metode lain.</p>
        <div style="border-top:1px dashed #e5e7eb;margin:10px 0 8px"></div>
        <div style="font-weight:700;color:#374151;margin-bottom:6px">Produk dalam pesanan</div>
        ${listHtml}
      </div>`,
      confirmButtonText: "Mengerti",
    });
  };

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

        {/* Items */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden">
                <Image
                  src={item.image}
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

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* Payment & Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <CreditCard className="w-4 h-4" />
              Metode Pembayaran
            </div>
            <div className="text-sm text-gray-700 capitalize">
              {order.payment_method ?? "-"}
            </div>

            {/* Info bayar manual (jika ada di detail) */}
            {detail?.bank_name && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                <div className="font-semibold text-gray-800 mb-1">Bayar ke</div>
                <div className="text-gray-700">
                  Bank: <span className="font-medium">{detail.bank_name}</span>
                </div>
                {detail.account_number && (
                  <div className="text-gray-700">
                    No. Rekening:{" "}
                    <span className="font-medium">{detail.account_number}</span>
                  </div>
                )}
                {detail.account_name && (
                  <div className="text-gray-700">
                    Atas Nama:{" "}
                    <span className="font-medium">{detail.account_name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Hint jika lagi menunggu & belum ada metode */}
            {waitingAndNoMethod && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Status: <b>Menunggu pembayaran</b>. Klik{" "}
                <b>Lanjutkan Pembayaran</b> di bawah untuk membuka halaman/QR
                pembayaran.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <Truck className="w-4 h-4" />
              Pengiriman
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

        {/* Divider */}
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

        {/* QR Preview (jika ada) */}
        {qrSrc && (
          <div className="mt-6 rounded-2xl border border-gray-200 p-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
              <QrCode className="w-5 h-5" />
              QRIS / Kode Pembayaran
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR Pembayaran"
              className="w-56 h-56 object-contain"
            />
            <div className="text-xs text-gray-500 mt-2">
              Scan dengan aplikasi pembayaran Anda.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>

          {canUploadManual && (
            <button
              onClick={onOpenUploadProof}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#6B6B6B] text-white rounded-xl hover:bg-[#5a5a5a] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Bukti Pembayaran
            </button>
          )}

          {waitingAndNoMethod && (
            <button
              onClick={handleResumePayment}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Lanjutkan Pembayaran
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
