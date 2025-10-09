"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetVoucherListQuery } from "@/services/voucher.service";

/** ===== Util tanpa any ===== */
const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const toNum = (v: unknown): number | undefined => {
  if (isNum(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};
const toStr = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const rec = (v: unknown): Record<string, unknown> =>
  (v ?? {}) as Record<string, unknown>;

/** Bentuk opsi yang ditampilkan di dropdown */
type VoucherOption = {
  id: number;
  label: string; // biasanya kode voucher / reference
  sub?: string; // deskripsi/nama (opsional)
};

function extractArray(raw: unknown): ReadonlyArray<Record<string, unknown>> {
  // Meng-cover berbagai bentuk response: [], {data: []}, {data:{data:[]}}
  if (Array.isArray(raw)) return raw as ReadonlyArray<Record<string, unknown>>;
  const t = rec(raw);
  if (Array.isArray(t.data))
    return t.data as ReadonlyArray<Record<string, unknown>>;
  const inner = rec(t.data);
  if (Array.isArray(inner.data))
    return inner.data as ReadonlyArray<Record<string, unknown>>;
  return [];
}

function normalizeVoucherList(raw: unknown): VoucherOption[] {
  return extractArray(raw).map((row, i) => {
    const r = rec(row);
    const id = toNum(r.id) ?? i + 1;
    // Cari label yang paling mungkin (kode/reference)
    const label =
      toStr(r.code) || toStr(r.reference) || toStr(r.voucher_code) || `#${id}`;
    const sub =
      toStr(r.name) || toStr(r.title) || toStr(r.description) || undefined;
    return { id, label, sub };
  });
}

export default function VoucherCombobox({
  value,
  onChange,
  placeholder = "Ketik minimal 3 huruf…",
  disabled = false,
  className,
}: {
  value: number[]; // daftar voucher terpilih (ID)
  onChange: (ids: number[]) => void; // setter ke form parent
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Cache id→label agar chip bisa menampilkan kode, walau parent cuma kirim ID
  const labelCacheRef = useRef<Map<number, string>>(new Map());

  const min3 = query.trim().length >= 3;
  const { data, isFetching } = useGetVoucherListQuery(
    // asumsi service menerima search, page, paginate
    { page: 1, paginate: 10, search: query },
    { skip: !min3 || disabled }
  );

  const options = useMemo(() => {
    const list = normalizeVoucherList(data);
    // isi cache label
    list.forEach((o) => {
      if (!labelCacheRef.current.has(o.id)) {
        labelCacheRef.current.set(o.id, o.label);
      }
    });
    // sembunyikan yang sudah dipilih
    const selected = new Set(value);
    return list.filter((o) => !selected.has(o.id));
  }, [data, value]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const isInside = target.closest?.("[data-voucher-combobox]");
      if (!isInside) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Buka dropdown hanya jika min 3 huruf
  useEffect(() => setOpen(min3), [min3]);

  const addVoucher = (id: number, label?: string) => {
    if (label) labelCacheRef.current.set(id, label);
    if (!value.includes(id)) onChange([...value, id]);
    setQuery("");
    setOpen(false);
  };

  const removeVoucher = (id: number) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className={cn("relative", className)} data-voucher-combobox>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            disabled={disabled}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(query.trim().length >= 3)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className="h-10 pl-8"
          />
          {/* Dropdown */}
          {open && (
            <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow-lg">
              {isFetching ? (
                <div className="p-3 text-sm text-muted-foreground">Memuat…</div>
              ) : options.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  {min3 ? "Tidak ada hasil" : "Ketik minimal 3 huruf"}
                </div>
              ) : (
                <ul className="max-h-64 overflow-auto py-1">
                  {options.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted/50"
                        onMouseDown={(e) => e.preventDefault()} // cegah blur duluan
                        onClick={() => addVoucher(o.id, o.label)}
                      >
                        <div className="font-medium">{o.label}</div>
                        {o.sub && (
                          <div className="text-xs text-muted-foreground">
                            {o.sub}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chips selected */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((id) => {
            const text = labelCacheRef.current.get(id) ?? `#${id}`;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
              >
                {text}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeVoucher(id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            );
          })}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Ketik minimal 3 huruf untuk mencari voucher. Klik hasil untuk menambah.
      </p>
    </div>
  );
}