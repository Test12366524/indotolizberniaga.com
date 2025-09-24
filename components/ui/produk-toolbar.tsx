import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  openModal?: () => void;
  onSearchChange?: (q: string) => void;
  onCategoryChange?: (category: string) => void;
  categories?: { value: string; label: string }[]; // opsional
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
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categories[0]?.value ?? "all");

  return (
    <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* kiri: search + filter */}
        <div className="w-full">
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => {
              const q = e.target.value;
              setSearch(q);
              onSearchChange?.(q);
            }}
          />
        </div>
        {/* kanan: tombol tambah */}
        <div className="shrink-0 flex items-center gap-2">
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
          {openModal && <Button onClick={openModal}>Tambah Produk</Button>}
        </div>
      </div>
    </div>
  );
}
