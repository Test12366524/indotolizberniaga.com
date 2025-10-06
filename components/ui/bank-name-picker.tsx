// components/form-fields/bank-name-picker.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

type Props = {
  value: string | undefined;
  onChange: (val: string) => void;
  options?: string[]; // daftar bank (default disediakan)
  placeholder?: string;
  disabled?: boolean;
  buttonClassName?: string;
};

const DEFAULT_BANKS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "Permata",
  "BTN",
  "Danamon",
  "Maybank",
  "OCBC NISP",
  "Sinarmas",
  "BSI",
  "Panin",
  "BJB",
  "BRKS",
];

export default function BankNamePicker({
  value,
  onChange,
  options = DEFAULT_BANKS,
  placeholder = "Pilih / cari bank",
  disabled,
  buttonClassName,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // filter by search (case-insensitive)
  const normalized = (s: string) => s.toLowerCase();
  const filtered = React.useMemo(() => {
    if (!search) return options.slice(0, 10); // tampilkan 10 dulu
    return options.filter((o) => normalized(o).includes(normalized(search)));
  }, [options, search]);

  const label = value ?? placeholder;

  const selectValue = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const canCreate =
    search.trim().length > 0 &&
    !options.some((o) => normalized(o) === normalized(search));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={`justify-between w-full h-10 ${buttonClassName ?? ""}`}
          title={label}
        >
          <span className="truncate">{label}</span>
          <svg
            className="ms-2 h-4 w-4 opacity-60"
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
            placeholder="Cari bank…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {canCreate ? `Tidak ada. Gunakan "${search}"` : "Tidak ditemukan"}
            </CommandEmpty>

            {filtered.length > 0 && (
              <CommandGroup heading="Daftar Bank">
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => selectValue(opt)}
                  >
                    <span className="truncate">{opt}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreate && (
              <CommandGroup heading="Tambahkan">
                <CommandItem
                  value={search}
                  onSelect={() => selectValue(search.trim())}
                >
                  Gunakan “{search.trim()}”
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}