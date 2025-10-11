// components/form-modal/koperasi-modal/user-bank-form.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  useCreateUserBankMutation,
  useUpdateUserBankMutation,
} from "@/services/koperasi-service/user-bank.service";
import type { UserBank } from "@/types/koperasi-types/user-bank";
import { Combobox } from "@/components/ui/combo-box"; // ⬅️ pakai combobox kamu
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2 } from "lucide-react";

/** Props */
type Props = {
  open: boolean;
  mode: "add" | "edit";
  initialData?: UserBank;
  /** Wajib: datang dari AnggotaPage lewat query user_id */
  presetUserId?: number;
  onClose: (changed?: boolean) => void;
};

/** Hardcode bank list */
const BANK_OPTIONS = [
  "BCA",
  "BNI",
  "BRI",
  "Mandiri",
  "CIMB Niaga",
  "Permata",
  "BTN",
  "BSI",
  "Maybank",
  "OCBC NISP",
];

export default function UserBankForm({
  open,
  mode,
  initialData,
  presetUserId,
  onClose,
}: Props) {
  // === Form state
  const [userId, setUserId] = useState<number | null>(null);
  const [bank, setBank] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState<boolean>(false);

  // === Bank Combobox with free input ===
  const [openBank, setOpenBank] = useState(false);
  const [bankQuery, setBankQuery] = useState<string>("");

  const filteredBanks = useMemo(() => {
    if (!bankQuery) return BANK_OPTIONS;
    const q = bankQuery.toLowerCase();
    return BANK_OPTIONS.filter((b) => b.toLowerCase().includes(q));
  }, [bankQuery]);

  // Options untuk combobox user (readonly)
  // - Saat edit: jika ada user_name dari initialData, tampilkan "Nama (email?)"
  // - Saat add: minimal tampilkan "ID: {id}" sesuai default label Combobox
  const readonlyUserOptions = useMemo(() => {
    if (!userId) return [];
    // kalau punya user_name dari initialData, lengkapi agar label lebih informatif
    if (initialData?.user_name) {
      return [{ id: userId, name: initialData.user_name, email: "" }];
    }
    // fallback: hanya id, Combobox default label => "ID: {id}"
    return [{ id: userId } as { id: number }];
  }, [userId, initialData?.user_name]);

  // === Mutations
  const [createUserBank, { isLoading: creating }] = useCreateUserBankMutation();
  const [updateUserBank, { isLoading: updating }] = useUpdateUserBankMutation();

  // === Open/initial fill
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      // user_id dikunci oleh presetUserId; fallback ke initialData.user_id bila perlu
      setUserId(presetUserId ?? initialData.user_id);
      setBank(initialData.bank ?? "");
      setAccountName(initialData.account_name ?? "");
      setAccountNumber(initialData.account_number ?? "");
      setDescription(initialData.description ?? "");
      setIsPrimary(Number(initialData.is_primary) === 1);
    } else {
      // Reset; userId wajib dari presetUserId
      setUserId(presetUserId ?? null);
      setBank("");
      setAccountName("");
      setAccountNumber("");
      setDescription("");
      setIsPrimary(false);
    }
  }, [open, mode, initialData, presetUserId]);

  const handleSubmit = async () => {
    try {
      if (!userId) {
        await Swal.fire("Validasi", "user_id wajib diisi", "warning");
        return;
      }
      if (!bank.trim()) {
        await Swal.fire("Validasi", "Nama bank wajib diisi", "warning");
        return;
      }
      if (!accountName.trim()) {
        await Swal.fire("Validasi", "Account name wajib diisi", "warning");
        return;
      }
      if (!accountNumber.trim()) {
        await Swal.fire("Validasi", "Account number wajib diisi", "warning");
        return;
      }

      if (mode === "add") {
        await createUserBank({
          user_id: userId,
          bank: bank.trim(),
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          description: description.trim() || "",
          is_primary: isPrimary ? 1 : 0,
        }).unwrap();

        // Tutup modal dulu + trigger refetch via onClose(true)
        onClose(true);
        void Swal.fire("Berhasil", "Rekening ditambahkan", "success");
      } else if (mode === "edit" && initialData) {
        await updateUserBank({
          id: initialData.id,
          body: {
            bank: bank.trim(),
            account_name: accountName.trim(),
            account_number: accountNumber.trim(),
            description: description.trim(),
            is_primary: isPrimary ? 1 : 0,
          },
        }).unwrap();

        // Tutup modal dulu + trigger refetch via onClose(true)
        onClose(true);
        void Swal.fire("Berhasil", "Rekening diperbarui", "success");
      }
    } catch {
      await Swal.fire("Gagal", "Operasi gagal diproses", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Rekening" : "Ubah Rekening"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>User</Label>
            <Combobox
              value={userId}
              onChange={() => {
                /* readonly: no-op */
              }}
              data={readonlyUserOptions}
              disabled
              placeholder="User"
              buttonClassName="h-10"
            />
          </div>

          {/* bank */}
          <div className="grid gap-2">
            <Label>Bank</Label>

            <Popover open={openBank} onOpenChange={setOpenBank}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between w-full h-10"
                >
                  <span className="truncate">
                    {bank || "Pilih / ketik bank…"}
                  </span>
                  <svg
                    className="ms-2 h-4 w-4 shrink-0 opacity-60"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      d="M5.25 7.5L10 12.25L14.75 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder="Cari / ketik nama bank…"
                    value={bankQuery}
                    onValueChange={setBankQuery}
                  />
                  <CommandList>
                    {false && (
                      <CommandItem disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Memuat...
                      </CommandItem>
                    )}
                    <CommandEmpty>
                      {bankQuery ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Tidak ada di daftar. Pilih “Gunakan: {bankQuery}”
                        </div>
                      ) : (
                        "Tidak ditemukan"
                      )}
                    </CommandEmpty>

                    {/* Daftar bank yang terfilter */}
                    {filteredBanks.map((b) => (
                      <CommandItem
                        key={b}
                        value={b}
                        onSelect={() => {
                          setBank(b);
                          setBankQuery("");
                          setOpenBank(false);
                        }}
                        className="truncate"
                      >
                        {b}
                      </CommandItem>
                    ))}

                    {/* Free text / bank custom */}
                    {bankQuery && (
                      <CommandItem
                        value={`__use:${bankQuery}`}
                        onSelect={() => {
                          setBank(bankQuery);
                          setOpenBank(false);
                        }}
                        className="truncate"
                      >
                        Gunakan:{" "}
                        <span className="ml-1 font-semibold">{bankQuery}</span>
                      </CommandItem>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* account_name */}
          <div className="grid gap-2">
            <Label>Account Name</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Asep"
              className="h-10"
            />
          </div>

          {/* account_number */}
          <div className="grid gap-2">
            <Label>Account Number</Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="55992323"
              className="h-10"
              inputMode="numeric"
            />
          </div>

          {/* description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bank Pertama"
              className="h-10"
            />
          </div>

          {/* is_primary */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_primary">Primary</Label>
            <Switch
              id="is_primary"
              checked={isPrimary}
              onCheckedChange={(v) => setIsPrimary(v)}
            />
          </div>

          {/* actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onClose(false)}>
              Batal
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={creating || updating}
            >
              {mode === "add"
                ? creating
                  ? "Menyimpan..."
                  : "Simpan"
                : updating
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}