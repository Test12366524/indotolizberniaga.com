"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { value: string; label: string };

type ExtraSelect = {
  id: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
};

type Props = {
  openModal?: () => void;
  onSearchChange?: (q: string) => void;
  onCategoryChange?: (category: string) => void;
  categories?: Option[];
  initialSearch?: string;
  initialCategory?: string;
  extraSelects?: ExtraSelect[];
  extraNodes?: ReactNode;
  addButtonLabel?: string; // Custom label for add button

  /** ===== Excel actions (opsional) ===== */
  onImportExcel?: (file: File) => void;
  onExportExcel?: () => void;
  importAccept?: string; // default: ".xlsx,.xls,.csv"
  importLabel?: string; // default: "Import Excel"
  exportLabel?: string; // default: "Export Excel"
  exportDisabled?: boolean;
};

export function ProdukToolbar({
  openModal,
  onSearchChange,
  onCategoryChange,
  categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "elektronik", label: "Elektronik" },
    { value: "fashion", label: "Fashion" },
    { value: "rumah-tangga", label: "Rumah Tangga" },
  ],
  initialSearch = "",
  initialCategory,
  extraSelects = [],
  extraNodes,
  addButtonLabel = "Tambah Stock Opname",

  onImportExcel,
  onExportExcel,
  importAccept = ".xlsx,.xls,.csv",
  importLabel = "Import Excel",
  exportLabel = "Export Excel",
  exportDisabled,
}: Props) {
  const defaultCategory = initialCategory ?? categories[0]?.value ?? "all";
  const [search, setSearch] = useState<string>(initialSearch);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [uncontrolledExtraValues, setUncontrolledExtraValues] = useState<
    Record<string, string>
  >(() =>
    extraSelects.reduce<Record<string, string>>((acc, s) => {
      acc[s.id] = s.defaultValue ?? s.value ?? "";
      return acc;
    }, {})
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onSearchChange?.(initialSearch);
    onCategoryChange?.(defaultCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Kiri: filter */}
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => {
              const q = e.target.value;
              setSearch(q);
              onSearchChange?.(q);
            }}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              onCategoryChange?.(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {extraSelects.map((s) => {
            const currentVal =
              s.value ?? uncontrolledExtraValues[s.id] ?? s.defaultValue ?? "";
            return (
              <Select
                key={s.id}
                value={currentVal}
                onValueChange={(val) => {
                  if (s.value === undefined) {
                    setUncontrolledExtraValues((prev) => ({
                      ...prev,
                      [s.id]: val,
                    }));
                  }
                  s.onChange?.(val);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={s.label} aria-label={s.label} />
                </SelectTrigger>
                <SelectContent>
                  {s.options.map((opt) => (
                    <SelectItem key={`${s.id}-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}

          {extraNodes}
        </div>

        {/* Kanan: aksi */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {/* Import Excel (opsional) */}
          {onImportExcel && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={importAccept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportExcel(file);
                    // reset agar bisa pilih file yang sama dua kali berturut-turut
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
              >
                {importLabel}
              </Button>
            </>
          )}

          {/* Export Excel (opsional) */}
          {onExportExcel && (
            <Button onClick={onExportExcel} disabled={exportDisabled}>
              {exportLabel}
            </Button>
          )}

          {/* Tambah data (opsional) */}
          {openModal && <Button onClick={openModal}>{addButtonLabel}</Button>}
        </div>
      </div>
    </div>
  );
}