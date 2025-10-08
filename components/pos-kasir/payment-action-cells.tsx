"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetPosTransactionByIdQuery } from "@/services/pos-kasir.service";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";

type PaymentActionCellProps = {
  id: number;
  status: number; // 0 pending, 1 captured, 2 settlement, -1 deny, -2 expired, -3 cancel
  payment_type: "automatic" | "manual" | "saldo";
  payment_link?: string | null;
};

export default function PaymentActionCell({
  id,
  status,
  payment_type,
  payment_link,
}: PaymentActionCellProps) {
  const [payId, setPayId] = useState<number | null>(null);
  const [hasShown, setHasShown] = useState(false);

  const { data, isFetching } = useGetPosTransactionByIdQuery(payId as number, {
    skip: payId === null,
    pollingInterval: payId ? 1200 : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // Guard: hentikan polling otomatis setelah 15s
  useEffect(() => {
    if (!payId) return;
    const t = setTimeout(() => setPayId(null), 15000);
    return () => clearTimeout(t);
  }, [payId]);

  // Saat payment tersedia → tampilkan instruksi sekali
  useEffect(() => {
    if (!payId) return;
    const payment = data?.data?.payment;
    if (payment && !hasShown) {
      (async () => {
        await showPaymentInstruction(payment);
        setHasShown(true);
        setPayId(null);
      })();
    }
  }, [data?.data?.payment, payId, hasShown]);

  // PENDING + automatic → tampilkan tombol Bayar (modal instruksi)
  if (status === 0 && payment_type === "automatic") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-xs px-2 py-1 h-auto"
        onClick={() => {
          setHasShown(false);
          setPayId(id);
        }}
        disabled={isFetching}
      >
        {isFetching ? "Menyiapkan..." : "Bayar"}
      </Button>
    );
  }

  // Jika ada payment_link → tampilkan tombol buka link
  if (payment_link) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-xs px-2 py-1 h-auto"
        onClick={() =>
          window.open(payment_link, "_blank", "noopener,noreferrer")
        }
      >
        Buka Link
      </Button>
    );
  }

  // Fallback
  return <span className="text-muted-foreground text-xs">Tidak ada link</span>;
}