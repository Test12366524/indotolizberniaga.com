"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ChevronDown, Loader2, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COA,
  CreateKodeTransaksiRequest,
  useGetCOAListQuery,
} from "@/services/admin/kode-transaksi.service";

/** ===== COA Picker ala AnggotaPicker: fetch+show setelah 3 huruf, debounce ===== */
type CoaLite = Pick<COA, "id" | "code" | "name" | "level" | "type">;

const MIN_CHARS = 3;
const DEBOUNCE_MS = 350;

function COAPicker({
  selectedId,
  onChange,
  disabled,
  label = "COA",
}: {
  selectedId: number | null;
  onChange: (coa: CoaLite | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  /** ⬇️ Perbaikan utama: saat EDIT (ada selectedId), tetap fetch supaya label tampil */
  const shouldFetch = debounced.length >= MIN_CHARS || selectedId !== null;

  const { data, isLoading, isError, refetch } = useGetCOAListQuery(
    { page: 1, paginate: 500 },
    { skip: !shouldFetch, refetchOnMountOrArgChange: true }
  );

  const list: CoaLite[] = useMemo(() => {
    if (!shouldFetch) return [];
    return (data?.data ?? []).map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      level: c.level,
      type: c.type,
    }));
  }, [data?.data, shouldFetch]);

  const filtered: CoaLite[] = useMemo(() => {
    if (!shouldFetch) return [];
    const q = debounced.toLowerCase();
    return list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        String(c.id).includes(q)
    );
  }, [list, debounced, shouldFetch]);

  const selected = useMemo(
    () => list.find((c) => c.id === selectedId) ?? null,
    [list, selectedId]
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  const placeholder = !shouldFetch
    ? `Ketik minimal ${MIN_CHARS} karakter…`
    : isLoading
    ? "Memuat…"
    : `${filtered.length} hasil`;

  const pick = (c: CoaLite | null) => {
    onChange(c);
    setOpen(false);
    setQuery(c ? `${c.code} — ${c.name}` : "");
  };

  return (
    <div className="w-full">
      <Label className="mb-1 block">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full h-10 justify-between rounded-xl border-neutral-200 bg-white px-3 shadow-sm hover:bg-neutral-50"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="flex items-center gap-2 truncate text-left">
              {isLoading && shouldFetch ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  <span className="text-neutral-500">Memuat COA…</span>
                </>
              ) : selected ? (
                <span className="truncate">
                  {selected.code} — {selected.name}
                </span>
              ) : selectedId !== null && !isLoading ? (
                // fallback ringan saat item belum ketemu di list (mis. masih loading pertama kali)
                <span className="text-neutral-500">ID: {selectedId}</span>
              ) : (
                <>
                  <Layers className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-500">{placeholder}</span>
                </>
              )}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl"
          align="start"
          side="bottom"
        >
          {isError ? (
            <div className="p-3 text-sm">
              <div className="mb-2 text-red-600">Gagal memuat COA.</div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : (
            <Command shouldFilter={false}>
              <div className="p-2">
                <CommandInput
                  ref={inputRef}
                  value={query}
                  onValueChange={setQuery}
                  placeholder={`Cari kode/nama COA (min ${MIN_CHARS} karakter)…`}
                />
              </div>

              <CommandList className="max-h-72">
                <div className="px-3 py-2 text-xs text-neutral-500">
                  {placeholder}
                </div>

                {!shouldFetch ? (
                  <div className="px-3 pb-3 text-sm text-neutral-600">
                    Ketik minimal <b>{MIN_CHARS}</b> huruf untuk mulai mencari.
                  </div>
                ) : (
                  <>
                    <CommandEmpty>Tidak ada hasil.</CommandEmpty>

                    {!isLoading && (
                      <>
                        <CommandGroup heading="Daftar COA">
                          {filtered.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.code}
                              onSelect={() => pick(c)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {c.code} — {c.name}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  ID: {c.id} • Level: {c.level} • {c.type}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem value="none" onSelect={() => pick(null)}>
                            Kosongkan pilihan
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** ===== Form Kode Transaksi ===== */
export type FormKodeTransaksiState = CreateKodeTransaksiRequest;

interface Props {
  form: FormKodeTransaksiState;
  setForm: (next: FormKodeTransaksiState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  readonly?: boolean;
}

export default function FormKodeTransaksi({
  form,
  setForm,
  onCancel,
  onSubmit,
  isLoading = false,
  readonly = false,
}: Props) {
  const onChangeField =
    <K extends keyof FormKodeTransaksiState>(key: K) =>
    (val: FormKodeTransaksiState[K]) =>
      setForm({ ...form, [key]: val });

  const updateDebit = (
    idx: number,
    patch: Partial<FormKodeTransaksiState["debits"][number]>
  ) => {
    const next = [...form.debits];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, debits: next });
  };
  const addDebit = () =>
    setForm({
      ...form,
      debits: [...form.debits, { coa_id: 0, order: form.debits.length + 1 }],
    });
  const removeDebit = (idx: number) => {
    if (form.debits.length <= 1) return;
    setForm({ ...form, debits: form.debits.filter((_, i) => i !== idx) });
  };

  const updateCredit = (
    idx: number,
    patch: Partial<FormKodeTransaksiState["credits"][number]>
  ) => {
    const next = [...form.credits];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, credits: next });
  };
  const addCredit = () =>
    setForm({
      ...form,
      credits: [...form.credits, { coa_id: 0, order: form.credits.length + 1 }],
    });
  const removeCredit = (idx: number) => {
    if (form.credits.length <= 1) return;
    setForm({ ...form, credits: form.credits.filter((_, i) => i !== idx) });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-4xl space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Kode</Label>
          <Input
            value={form.code}
            onChange={(e) => onChangeField("code")(e.target.value)}
            readOnly={readonly}
            required
          />
        </div>
        <div>
          <Label>Module</Label>
          <Input
            value={form.module}
            onChange={(e) => onChangeField("module")(e.target.value)}
            readOnly={readonly}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label>Deskripsi</Label>
          <Input
            value={form.description}
            onChange={(e) => onChangeField("description")(e.target.value)}
            readOnly={readonly}
            required
          />
        </div>

        <div className="col-span-2">
          <Label>Status</Label>
          <Select
            value={String(form.status)}
            onValueChange={(v) => onChangeField("status")(Number(v))}
            disabled={readonly}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ===== Debits ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Debits</h3>
          {!readonly && (
            <Button type="button" size="sm" onClick={addDebit}>
              Tambah Debit
            </Button>
          )}
        </div>
        {form.debits.map((d, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr,120px,auto] items-end gap-3 border rounded-xl p-3"
          >
            <COAPicker
              selectedId={d.coa_id ? Number(d.coa_id) : null}
              onChange={(c) => updateDebit(i, { coa_id: c?.id ?? 0 })}
              disabled={readonly}
              label="COA (Debit)"
            />
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={d.order}
                onChange={(e) =>
                  updateDebit(i, { order: Number(e.target.value) })
                }
                readOnly={readonly}
              />
            </div>
            {!readonly && form.debits.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeDebit(i)}
              >
                Hapus
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* ===== Credits ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Credits</h3>
          {!readonly && (
            <Button type="button" size="sm" onClick={addCredit}>
              Tambah Credit
            </Button>
          )}
        </div>
        {form.credits.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr,120px,auto] items-end gap-3 border rounded-xl p-3"
          >
            <COAPicker
              selectedId={c.coa_id ? Number(c.coa_id) : null}
              onChange={(sel) => updateCredit(i, { coa_id: sel?.id ?? 0 })}
              disabled={readonly}
              label="COA (Credit)"
            />
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={c.order}
                onChange={(e) =>
                  updateCredit(i, { order: Number(e.target.value) })
                }
                readOnly={readonly}
              />
            </div>
            {!readonly && form.credits.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeCredit(i)}
              >
                Hapus
              </Button>
            )}
          </div>
        ))}
      </div>

      {!readonly && (
        <div className="pt-2 flex justify-end gap-2">
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