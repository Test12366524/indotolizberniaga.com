import { ApiTransactionByIdData } from "@/components/main/me/transaction-by-id";
import { Payment } from "@/types/admin/simpanan";

export default function buildPaymentFromDetail(
  d: ApiTransactionByIdData | undefined
): Payment | null {
  if (!d) return null;
  const qrBase64 = d.payment?.qr_base64;
  const qrUrl = d.payment?.qr_url;
  const qrSrc = qrBase64 ? `data:image/png;base64,${qrBase64}` : qrUrl || null;
  if (!qrSrc) return null;

  // Kamu bisa sesuaikan expired_at dari backend. Di sini fallback 2 jam dari created_at.
  const expired = d.created_at
    ? new Date(new Date(d.created_at).getTime() + 2 * 60 * 60 * 1000)
    : new Date(Date.now() + 2 * 60 * 60 * 1000);

  return {
    // field minimal yang dipakai showPaymentInstruction
    payment_type: "qris",
    channel: "qris",
    amount: Number(d.grand_total ?? d.total ?? 0),
    order_id: d.reference ?? String(d.id),
    account_number: qrSrc, // showPaymentInstruction pakai ini sebagai src gambar QR
    expired_at: expired.toISOString(),
  } as Payment;
}
