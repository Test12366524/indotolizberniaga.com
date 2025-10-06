"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateAnggotaMeninggalRequest } from "@/services/admin/anggota-meninggal.service";
import { Combobox } from "@/components/ui/combo-box";

type Mode = "create" | "edit";

type AnggotaLite = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  mode: Mode;
  initial: CreateAnggotaMeninggalRequest;
  anggotaOptions: AnggotaLite[];
  isAnggotaLoading?: boolean;
  onAnggotaSearch?: (q: string) => void;
  onSubmit: (payload: CreateAnggotaMeninggalRequest) => Promise<void> | void;
  onCancel: () => void;
};

export default function AnggotaMeninggalForm({
  mode,
  initial,
  anggotaOptions,
  isAnggotaLoading,
  onAnggotaSearch,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] =
    React.useState<CreateAnggotaMeninggalRequest>(initial);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="anggota_id">Anggota</Label>
        <Combobox<AnggotaLite>
          value={form.anggota_id || null}
          onChange={(val) => setForm((s) => ({ ...s, anggota_id: val }))}
          onSearchChange={onAnggotaSearch}
          data={anggotaOptions}
          isLoading={isAnggotaLoading}
          placeholder="Pilih anggota"
          getOptionLabel={(item) => `${item.name} (${item.email})`}
          buttonClassName="bg-white"
        />
      </div>

      <div>
        <Label htmlFor="deceased_at">Tanggal Meninggal</Label>
        <Input
          id="deceased_at"
          type="date"
          value={form.deceased_at}
          onChange={(e) =>
            setForm((s) => ({ ...s, deceased_at: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, description: e.target.value }))
          }
          placeholder="Deskripsi (opsional)"
        />
      </div>

      <div className="col-span-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={String(form.status)}
          onValueChange={(v) => setForm((s) => ({ ...s, status: Number(v) }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Pending</SelectItem>
            <SelectItem value="1">Approved</SelectItem>
            <SelectItem value="2">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{mode === "create" ? "Tambah" : "Update"}</Button>
      </div>
    </form>
  );
}