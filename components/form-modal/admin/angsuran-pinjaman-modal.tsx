"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Combobox } from "@/components/ui/combo-box";

import type { AngsuranPinjaman } from "@/types/admin/angsuran-pinjaman";
import {
  useGetPinjamanListQuery,
  useGetPinjamanDetailsQuery,
} from "@/services/admin/pinjaman.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PaymentMethodSelect } from "@/components/ui/payment-method-select";
import { PaymentChannelSelect } from "@/components/ui/payment-channel-select";

interface Props {
  form: Partial<AngsuranPinjaman>;
  setForm: (data: Partial<AngsuranPinjaman>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function AngsuranPinjamanForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: Props) {
  const { data: pinjamanResp, isLoading: isPinjamanLoading } =
    useGetPinjamanListQuery({ page: 1, paginate: 200 });

  const selectedPinjamanId = form.pinjaman_id ?? 0;
  const { data: detailResp, isLoading: isDetailLoading } =
    useGetPinjamanDetailsQuery(selectedPinjamanId || 0, {
      skip: !selectedPinjamanId,
    });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pinjamanOptions = useMemo(() => {
    const arr = pinjamanResp?.data ?? [];
    return arr.map((p) => {
      const ref = (p as unknown as { reference?: string }).reference;
      const userName = (p as unknown as { user?: { name?: string } }).user
        ?.name;
      const label = `${ref ?? `PINJ-${p.id}`} • ${userName ?? "-"}`;
      return { id: p.id, label, raw: p };
    });
  }, [pinjamanResp]);

  const detailOptions = useMemo(() => {
    const details = detailResp?.details ?? [];
    return details.map((d) => ({
      id: d.id,
      label: `Bulan ${d.month} • Jatuh tempo ${new Date(
        d.due_date
      ).toLocaleDateString("id-ID")} • Sisa ${Number(
        d.remaining
      ).toLocaleString("id-ID")}`,
      raw: d,
    }));
  }, [detailResp]);

  const selectedDetail = useMemo(
    () => detailResp?.details?.find((d) => d.id === form.pinjaman_detail_id),
    [detailResp, form.pinjaman_detail_id]
  );

  const monthlyInstallment = detailResp?.monthly_installment ?? 0;

  const isAuto = form.type === "automatic";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Angsuran"
            : form.id
            ? "Edit Angsuran"
            : "Tambah Angsuran"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!mounted ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3" />
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PINJAMAN */}
            <div className="flex flex-col gap-y-1 sm:col-span-2">
              <Label>Pinjaman</Label>
              {readonly ? (
                <Input
                  readOnly
                  value={
                    pinjamanOptions.find((o) => o.id === form.pinjaman_id)
                      ?.label ?? "-"
                  }
                />
              ) : (
                <Combobox
                  value={form.pinjaman_id ?? null}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      pinjaman_id: val ?? undefined,
                      pinjaman_detail_id: undefined,
                    })
                  }
                  data={pinjamanOptions}
                  isLoading={isPinjamanLoading}
                  getOptionLabel={(item) => item.label}
                  placeholder="Pilih Pinjaman"
                />
              )}
            </div>

            {/* DETAIL */}
            <div className="flex flex-col gap-y-1 sm:col-span-2">
              <Label>Detail Cicilan (details.id)</Label>
              {readonly ? (
                <Input
                  readOnly
                  value={
                    selectedDetail
                      ? `Bulan ${selectedDetail.month} • Jatuh tempo ${new Date(
                          selectedDetail.due_date
                        ).toLocaleDateString("id-ID")}`
                      : "-"
                  }
                />
              ) : (
                <Combobox
                  value={form.pinjaman_detail_id ?? null}
                  onChange={(val) =>
                    setForm({ ...form, pinjaman_detail_id: val ?? undefined })
                  }
                  data={detailOptions}
                  isLoading={isDetailLoading}
                  getOptionLabel={(item) => item.label}
                  placeholder={
                    selectedPinjamanId
                      ? "Pilih Detail Cicilan"
                      : "Pilih pinjaman dulu"
                  }
                />
              )}
            </div>

            {/* AMOUNT */}
            <div className="flex flex-col gap-y-1">
              <Label>Nominal Bayar</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={
                  form.amount !== undefined &&
                  form.amount !== null &&
                  Number(form.amount) > 0
                    ? Number(form.amount).toLocaleString("id-ID")
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value
                    .replace(/\./g, "")
                    .replace(/[^0-9]/g, "");
                  setForm({ ...form, amount: raw ? Number(raw) : 0 });
                }}
                readOnly={readonly}
              />
              {!readonly && monthlyInstallment > 0 && (
                <p className="text-xs text-muted-foreground">
                  Angsuran per bulan:{" "}
                  {Number(monthlyInstallment).toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* TYPE */}
            <div className="flex flex-col gap-y-1">
              <Label>Tipe Pembayaran</Label>
              {readonly ? (
                <Input readOnly value={form.type ?? "-"} />
              ) : (
                <Select
                  value={form.type ?? ""}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      type: v as "manual" | "automatic",
                      // reset payment fields saat ganti tipe
                      payment_method: undefined,
                      payment_channel: undefined,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">manual</SelectItem>
                    <SelectItem value="automatic">automatic</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* ===== Payment Method / Channel ===== */}
            {/* Automatic: pakai dropdown searchable (opsi bank_transfer/qris & bank) */}
            {isAuto && (
              <>
                <div className="flex flex-col gap-y-1">
                  <Label>Payment Method *</Label>
                  {readonly ? (
                    <Input readOnly value={form.payment_method ?? "-"} />
                  ) : (
                    <PaymentMethodSelect
                      mode="automatic"
                      value={form.payment_method}
                      onChange={(v) => {
                        if (v === "qris") {
                          setForm({
                            ...form,
                            payment_method: "qris",
                            payment_channel: "qris",
                          });
                        } else if (v === "bank_transfer") {
                          setForm({
                            ...form,
                            payment_method: "bank_transfer",
                            payment_channel: undefined,
                          });
                        } else {
                          // nilai custom tetap diperbolehkan
                          setForm({
                            ...form,
                            payment_method: v,
                            payment_channel: undefined,
                          });
                        }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-y-1">
                  <Label>Payment Channel *</Label>
                  {readonly ? (
                    <Input readOnly value={form.payment_channel ?? "-"} />
                  ) : (
                    <PaymentChannelSelect
                      mode="automatic"
                      method={form.payment_method}
                      value={form.payment_channel}
                      onChange={(v) => setForm({ ...form, payment_channel: v })}
                    />
                  )}
                </div>
              </>
            )}

            {/* Manual: dropdown searchable tapi boleh custom value */}
            {form.type === "manual" && (
              <>
                <div className="flex flex-col gap-y-1">
                  <Label>Payment Method (Manual)</Label>
                  {readonly ? (
                    <Input readOnly value={form.payment_method ?? "-"} />
                  ) : (
                    <PaymentMethodSelect
                      mode="manual"
                      value={form.payment_method}
                      onChange={(v) => {
                        if (v === "qris") {
                          setForm({
                            ...form,
                            payment_method: "qris",
                            payment_channel: "qris",
                          });
                        } else {
                          setForm({ ...form, payment_method: v });
                        }
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-y-1">
                  <Label>Payment Channel (Manual)</Label>
                  {readonly ? (
                    <Input readOnly value={form.payment_channel ?? "-"} />
                  ) : (
                    <PaymentChannelSelect
                      mode="manual"
                      method={form.payment_method}
                      value={form.payment_channel}
                      onChange={(v) => setForm({ ...form, payment_channel: v })}
                    />
                  )}
                </div>
              </>
            )}

            {/* IMAGE */}
            <div className="flex flex-col gap-y-1 sm:col-span-2">
              <Label>Bukti Pembayaran (image)</Label>
              {readonly ? (
                typeof form.image === "string" && form.image ? (
                  <Image
                    src={form.image}
                    alt="Bukti pembayaran"
                    width={300}
                    height={180}
                    className="border rounded object-contain h-40"
                  />
                ) : (
                  <span className="text-sm text-gray-500">
                    Tidak ada gambar
                  </span>
                )
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, image: file });
                    }}
                  />
                  {form.image instanceof File && (
                    <Image
                      src={URL.createObjectURL(form.image)}
                      alt="Preview"
                      width={300}
                      height={180}
                      className="mt-2 border rounded object-contain h-40"
                    />
                  )}
                </>
              )}
            </div>

            {/* READONLY INFO */}
            {readonly && (
              <>
                <div className="flex flex-col gap-y-1">
                  <Label>Status</Label>
                  <Input readOnly value={form.status ? "Sukses" : "Pending"} />
                </div>
                <div className="flex flex-col gap-y-1">
                  <Label>Paid At</Label>
                  <Input
                    readOnly
                    value={
                      form.paid_at
                        ? new Date(form.paid_at).toLocaleString()
                        : "-"
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}