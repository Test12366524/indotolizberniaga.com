import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ComboboxProps<T extends { id: number }> {
  value: number | null;
  onChange: (value: number) => void;
  onSearchChange?: (query: string) => void;
  data: T[];
  isLoading?: boolean;
  placeholder?: string;
  getOptionLabel?: (item: T) => string;
  disabled?: boolean;
  buttonClassName?: string;
}

export function Combobox<T extends { id: number }>({
  value,
  onChange,
  onSearchChange,
  data,
  isLoading,
  placeholder = "Pilih Data",
  getOptionLabel,
  disabled,
  buttonClassName,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const selected = data.find((item) => item.id === value);

  const defaultOptionLabel = (item: T) => {
    if ("name" in item && "email" in item) {
      return `${(item as { name: string; email: string }).name} (${
        (item as { name: string; email: string }).email
      })`;
    }
    return `ID: ${item.id}`;
  };

  const label = selected
    ? (getOptionLabel ?? defaultOptionLabel)(selected)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          // penting: min-w-0 agar truncate bisa bekerja
          className={`justify-between w-full h-10 min-w-0 ${
            buttonClassName ?? ""
          }`}
          title={typeof label === "string" ? label : undefined} // hint full text
        >
          {/* Kontainer label yang bisa di-truncate */}
          <span className="flex-1 min-w-0 text-left">
            <span className="block truncate">{label}</span>
          </span>
          {/* optional: caret/ikon di kanan, biarkan Button justify-between */}
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

      {/* Samakan lebar popover dengan trigger */}
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput
            placeholder="Cari..."
            onValueChange={(value) => {
              if (value.length >= 2 && onSearchChange) onSearchChange(value);
            }}
          />
          <CommandList>
            {isLoading && (
              <CommandItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </CommandItem>
            )}
            <CommandEmpty>Tidak ditemukan</CommandEmpty>

            {data.map((item) => {
              const text = (getOptionLabel ?? defaultOptionLabel)(item);
              return (
                <CommandItem
                  key={item.id}
                  value={text}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  // supaya item juga rapi kalau kepanjangan
                  className="truncate"
                  title={typeof text === "string" ? text : undefined}
                >
                  <span className="truncate">{text}</span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}