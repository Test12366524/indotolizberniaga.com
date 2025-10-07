"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethodSelect } from "./payment-method-select";
import { PaymentChannelSelect } from "./payment-channel-select";

type PayType = "automatic" | "saldo";

type Props = {
  type: PayType;
  onTypeChange: (t: PayType) => void;

  method?: string;
  onMethodChange: (v: string | undefined) => void;

  channel?: string;
  onChannelChange: (v: string | undefined) => void;

  disabled?: boolean;
  readonly?: boolean;
};

export default function PaymentControls({
  type,
  onTypeChange,
  method,
  onMethodChange,
  channel,
  onChannelChange,
  disabled,
  readonly,
}: Props) {
  const isAuto = type === "automatic";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="font-bold text-gray-900 mb-4">Metode Pembayaran</h3>

      {/* Tipe (automatic/manual) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <Label>Tipe Pembayaran</Label>
          {readonly ? (
            <Input readOnly value={type} />
          ) : (
            <Select
              value={type}
              onValueChange={(v) => {
                const next = v as PayType;
                onTypeChange(next);
                // reset payment fields ketika ganti tipe
                onMethodChange(undefined);
                onChannelChange(undefined);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tipe pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">automatic</SelectItem>
                <SelectItem value="saldo">manual</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Method & Channel */}
      {isAuto ? (
        // AUTOMATIC
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Payment Method *</Label>
            {readonly ? (
              <Input readOnly value={method ?? "-"} />
            ) : (
              <PaymentMethodSelect
                mode="automatic"
                value={method}
                onChange={(v) => {
                  if (v === "qris") {
                    onMethodChange("qris");
                    onChannelChange("qris");
                  } else if (v === "bank_transfer") {
                    onMethodChange("bank_transfer");
                    onChannelChange(undefined);
                  } else {
                    onMethodChange(v);
                    onChannelChange(undefined);
                  }
                }}
                disabled={disabled}
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Payment Channel *</Label>
            {readonly ? (
              <Input readOnly value={channel ?? "-"} />
            ) : (
              <PaymentChannelSelect
                mode="automatic"
                method={method}
                value={channel}
                onChange={(v) => onChannelChange(v)}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      ) : (
        // MANUAL
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Payment Method (Manual)</Label>
            {readonly ? (
              <Input readOnly value={method ?? "-"} />
            ) : (
              <PaymentMethodSelect
                mode="manual"
                value={method}
                onChange={(v) => {
                  // manual tetap boleh pilih qris/tunai/bank_transfer/custom
                  if (v === "qris") {
                    onMethodChange("qris");
                    onChannelChange("qris");
                  } else {
                    onMethodChange(v);
                  }
                }}
                disabled={disabled}
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Payment Channel (Manual)</Label>
            {readonly ? (
              <Input readOnly value={channel ?? "-"} />
            ) : (
              <PaymentChannelSelect
                mode="manual"
                method={method}
                value={channel}
                onChange={(v) => onChannelChange(v)}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}