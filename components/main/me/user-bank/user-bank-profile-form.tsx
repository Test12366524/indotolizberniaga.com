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
import { Combobox } from "@/components/ui/combo-box";
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

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initialData?: UserBank;
  presetUserId?: number; // dari sessionId / anggota
  userLabel?: string; // tampilkan nama/email di combobox user
  onClose: (changed?: boolean) => void;
};

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

export default function UserBankProfileForm({
  open,
  mode,
  initialData,
  presetUserId,
  userLabel,
  onClose,
}: Props) {
  const [userId, setUserId] = useState<number | null>(null);
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  // Bank combobox with free text
  const [openBank, setOpenBank] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const filteredBanks = useMemo(() => {
    if (!bankQuery) return BANK_OPTIONS;
    const q = bankQuery.toLowerCase();
    return BANK_OPTIONS.filter((b) => b.toLowerCase().includes(q));
  }, [bankQuery]);

  // Combobox user (readonly)
  const userOptions = useMemo(() => {
    if (!presetUserId) return [];
    if (userLabel) {
      // tampilkan "name (email)"
      return [{ id: presetUserId, name: userLabel, email: "" }];
    }
    return [{ id: presetUserId } as { id: number }];
  }, [presetUserId, userLabel]);

  const [createUserBank, { isLoading: creating }] = useCreateUserBankMutation();
  const [updateUserBank, { isLoading: updating }] = useUpdateUserBankMutation();

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      setUserId(presetUserId ?? initialData.user_id);
      setBank(initialData.bank ?? "");
      setAccountName(initialData.account_name ?? "");
      setAccountNumber(initialData.account_number ?? "");
      setDescription(initialData.description ?? "");
      setIsPrimary(Number(initialData.is_primary) === 1);
    } else {
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
          description: description.trim(),
          is_primary: isPrimary ? 1 : 0,
        }).unwrap();
        onClose(true); // tutup dulu
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
        onClose(true); // tutup dulu
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
          {/* user_id: Combobox readonly */}
          <div className="grid gap-2">
            <Label>Pengguna</Label>
            <Combobox
              value={userId}
              onChange={() => {}}
              data={userOptions}
              disabled
              placeholder="User"
              buttonClassName="h-10"
              getOptionLabel={(it: {
                id: number;
                name?: string;
                email?: string;
              }) => (it.name ? it.name : `ID: ${it.id}`)}
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
                    <CommandEmpty>
                      {bankQuery ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Tidak ada di daftar. Pilih “Gunakan: {bankQuery}”
                        </div>
                      ) : (
                        "Tidak ditemukan"
                      )}
                    </CommandEmpty>

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
            <Label>Atas Nama</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Nama pemilik rekening"
              className="h-10"
            />
          </div>

          {/* account_number */}
          <div className="grid gap-2">
            <Label>Nomor Rekening</Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 55992323"
              inputMode="numeric"
              className="h-10"
            />
          </div>

          {/* description */}
          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opsional"
              className="h-10"
            />
          </div>

          {/* is_primary */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_primary">Jadikan Rekening Utama</Label>
            <Switch
              id="is_primary"
              checked={isPrimary}
              onCheckedChange={(v) => setIsPrimary(v)}
            />
          </div>

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