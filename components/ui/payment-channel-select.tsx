"use client";

import SearchableSelect, { type Option } from "./searchable-select";

type Props = {
  method: string | undefined; // bank_transfer | qris | dll
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
  mode: "automatic" | "manual";
};

export function PaymentChannelSelect({
  method,
  value,
  onChange,
  disabled,
  mode,
}: Props) {
  // default bank list
  const banks: Option[] = [
    { value: "bca", label: "BCA" },
    { value: "bni", label: "BNI" },
    { value: "bri", label: "BRI" },
    { value: "cimb", label: "CIMB" },
  ];

  // special handling:
  if (method === "qris") {
    // channel dikunci qris; tetap tampil komponen tapi disabled
    return (
      <SearchableSelect
        value={"qris"}
        onChange={() => {}}
        options={[{ value: "qris", label: "QRIS" }]}
        placeholder="QRIS"
        disabled
        allowCustom={false}
      />
    );
  }

  // automatic + bank_transfer → daftar bank; manual → boleh custom
  const allowCustom = mode === "manual";

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={banks}
      placeholder="Pilih channel/bank"
      disabled={disabled || method !== "bank_transfer"}
      allowCustom={allowCustom}
      emptyHint="Channel tidak ditemukan."
    />
  );
}