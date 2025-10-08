"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, User, Wallet, Clock, CheckCircle } from "lucide-react";
import type { PaymentChannel, PaymentMethod } from "@/types/admin/pos-kasir";

type Anggota = {
  user_id: number;
  reference: string;
  name: string;
  email: string;
  id: number; // wallet id
  wallet_name: string;
  balance: number;
};

type FormDataShape = {
  payment_type: "automatic" | "manual" | "saldo";
  payment_method: PaymentMethod | undefined;
  payment_channel: PaymentChannel | undefined;
  user_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  wallet_id: string;
  status: number;
  voucher: number[];
};

export default function PaymentForm(props: {
  formData: FormDataShape;
  setFormData: React.Dispatch<React.SetStateAction<FormDataShape>>;
  anggota: Anggota[];
  disabled: boolean;
  onSubmit: () => void;
}) {
  const { formData, setFormData, anggota, disabled, onSubmit } = props;

  const paymentMethodOptions: { label: string; value: PaymentMethod }[] =
    useMemo(
      () => [
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "QRIS", value: "qris" },
      ],
      []
    );

  const paymentChannelOptions: { label: string; value: PaymentChannel }[] =
    useMemo(
      () => [
        { label: "BCA", value: "bca" },
        { label: "BNI", value: "bni" },
        { label: "BRI", value: "bri" },
        { label: "CIMB", value: "cimb" },
        { label: "QRIS", value: "qris" }, // khusus method qris
      ],
      []
    );

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Pembayaran
        </h2>

        <div className="space-y-4">
          {/* Payment Type Quick Buttons */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipe Pembayaran
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={
                  formData.payment_type === "manual" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    payment_type: "manual",
                    payment_method: undefined,
                    payment_channel: undefined,
                  }))
                }
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" /> Manual
              </Button>
              <Button
                variant={
                  formData.payment_type === "automatic" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setFormData((p) => ({ ...p, payment_type: "automatic" }))
                }
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" /> Auto
              </Button>
              <Button
                variant={
                  formData.payment_type === "saldo" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    payment_type: "saldo",
                    payment_method: undefined,
                    payment_channel: undefined,
                  }))
                }
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" /> Saldo
              </Button>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Status Transaksi
            </Label>
            <Select
              value={formData.status.toString()}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, status: parseInt(v) }))
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    PENDING
                  </div>
                </SelectItem>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    CAPTURED
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    SETTLEMENT
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anggota (saldo) */}
          {formData.payment_type === "saldo" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Pilih Anggota
              </Label>
              <Select
                value={formData.user_id}
                onValueChange={(val) => {
                  const a = anggota.find((x) => x.user_id.toString() === val);
                  setFormData((p) => ({
                    ...p,
                    user_id: val,
                    wallet_id: a?.id?.toString() || "",
                  }));
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Pilih anggota" />
                </SelectTrigger>
                <SelectContent>
                  {anggota.map((a) => (
                    <SelectItem key={a.id} value={a.user_id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-xs text-gray-500">
                          {a.reference} • Saldo: Rp{" "}
                          {a.balance?.toLocaleString("id-ID") ?? "0"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Automatic: Method & Channel */}
          {formData.payment_type === "automatic" && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Method
                </Label>
                <Select
                  value={formData.payment_method ?? undefined}
                  onValueChange={(v: PaymentMethod) =>
                    setFormData((p) => ({
                      ...p,
                      payment_method: v,
                      // Jika method = qris → channel otomatis "qris"
                      payment_channel:
                        v === "qris"
                          ? "qris"
                          : p.payment_channel && p.payment_channel !== "qris"
                          ? p.payment_channel
                          : undefined,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Pilih method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Channel
                </Label>
                <Select
                  value={formData.payment_channel ?? undefined}
                  onValueChange={(v: PaymentChannel) =>
                    setFormData((p) => ({ ...p, payment_channel: v }))
                  }
                  disabled={!formData.payment_method}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Pilih channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentChannelOptions
                      .filter((c) =>
                        formData.payment_method === "qris"
                          ? c.value === "qris"
                          : c.value !== "qris"
                      )
                      .map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  • bank_transfer: bca, bni, bri, cimb • qris: qris
                </p>
              </div>
            </>
          )}

          {/* Guest info */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Nama Guest
              </Label>
              <Input
                value={formData.guest_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, guest_name: e.target.value }))
                }
                placeholder="Nama guest (opsional)"
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Email Guest
              </Label>
              <Input
                type="email"
                value={formData.guest_email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, guest_email: e.target.value }))
                }
                placeholder="Email guest (opsional)"
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Telepon Guest
              </Label>
              <Input
                value={formData.guest_phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, guest_phone: e.target.value }))
                }
                placeholder="Telepon guest (opsional)"
                className="h-10"
              />
            </div>
          </div>

          {/* Voucher */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Voucher (Opsional)
            </Label>
            <Input
              placeholder="ID voucher (pisahkan dengan koma)"
              value={formData.voucher.join(", ")}
              onChange={(e) => {
                const ids = e.target.value
                  .split(",")
                  .map((s) => parseInt(s.trim()))
                  .filter((n) => !Number.isNaN(n));
                setFormData((p) => ({ ...p, voucher: ids }));
              }}
              className="h-10"
            />
            <p className="text-xs text-gray-500 mt-1">Contoh: 1, 2, 3</p>
          </div>

          {/* Submit */}
          <Button
            onClick={onSubmit}
            disabled={disabled}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            {disabled ? "Menunggu Pembayaran" : "Proses Transaksi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}