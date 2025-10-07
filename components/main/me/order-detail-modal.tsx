"use client";

import Image from "next/image";
import { X, CheckCircle, FileText } from "lucide-react";
import { getStatusColor, getStatusText, Order } from "./types";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";
import type { TxnDetailExtra, TxnPayment } from "@/types/admin/payment";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedOrder: Order;
  orderDetail?: TxnDetailExtra;
  onOpenPaymentProofModal: () => void;
}

export default function OrderDetailModal({
  open,
  onClose,
  selectedOrder,
  orderDetail,
  onOpenPaymentProofModal,
}: Props) {
  if (!open) return null;

  const paymentObj: TxnPayment | undefined = orderDetail?.payment ?? undefined;
  const paymentLink: string | null = orderDetail?.payment_link ?? null;

  const isPaid: boolean =
    Boolean(orderDetail?.paid_at) ||
    (typeof orderDetail?.status === "number"
      ? orderDetail!.status === 1
      : typeof orderDetail?.status === "string"
      ? ["paid", "success", "completed", "settlement"].includes(
          orderDetail!.status.toLowerCase()
        )
      : false);

  const isSaldo = orderDetail?.payment_type === "saldo";

  const handlePayNow = async () => {
    if (paymentObj) {
      // Cocokkan tipe parameter showPaymentInstruction TANPA any
      type ShowArg = Parameters<typeof showPaymentInstruction>[0];
      await showPaymentInstruction(paymentObj as ShowArg);
      return;
    }
    if (paymentLink) {
      window.open(paymentLink, "_blank");
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Detail Pesanan #{selectedOrder.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Informasi Pesanan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Pesanan:</span>
                  <span className="font-medium">
                    #{selectedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(selectedOrder.date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode Pembayaran:</span>
                  <span className="font-medium uppercase">
                    {selectedOrder.payment_method || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Rincian Pembayaran
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    Rp {selectedOrder.total.toLocaleString("id-ID")}
                  </span>
                </div>

                {selectedOrder.shipment_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ongkos Kirim:</span>
                    <span className="font-medium">
                      Rp {selectedOrder.shipment_cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {selectedOrder.cod && selectedOrder.cod > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee COD:</span>
                    <span className="font-medium">
                      Rp {selectedOrder.cod.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {selectedOrder.discount_total &&
                  selectedOrder.discount_total > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diskon:</span>
                      <span className="font-medium text-green-600">
                        -Rp{" "}
                        {selectedOrder.discount_total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-[#6B6B6B]">
                      Rp {selectedOrder.grand_total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {!isPaid && !isSaldo && (paymentObj || paymentLink) && (
                <button
                  onClick={handlePayNow}
                  className="mt-4 w-full bg-[#2D5BFF] text-white py-3 rounded-xl font-semibold hover:bg-[#2249cc]"
                >
                  {paymentObj
                    ? paymentObj.payment_type === "qris"
                      ? "Bayar dengan QRIS"
                      : `Bayar via ${(
                          paymentObj.channel || "VA"
                        ).toUpperCase()}`
                    : "Lanjut ke Halaman Pembayaran"}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Alamat Pengiriman
              </h4>
              <div className="text-sm">
                <p className="text-gray-800">{selectedOrder.address_line_1}</p>
                <p className="text-gray-600">{selectedOrder.postal_code}</p>
              </div>
            </div>

            {selectedOrder.payment_method === "manual" && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Bukti Pembayaran
                </h4>
                {selectedOrder.payment_proof ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Bukti pembayaran telah diupload
                      </span>
                    </div>
                    <div className="mt-2">
                      <Image
                        src={selectedOrder.payment_proof}
                        alt="Bukti Pembayaran"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Belum ada bukti pembayaran
                    </p>
                    <button
                      onClick={onOpenPaymentProofModal}
                      className="px-4 py-2 bg-[#6B6B6B] text-white rounded-lg font-medium hover:bg-[#6B6B6B]/90 transition-colors"
                    >
                      Upload Bukti
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Produk Pesanan</h4>
          <div className="space-y-4">
            {selectedOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{item.name}</h5>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
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
        </div>
      </div>
    </div>
  );
}