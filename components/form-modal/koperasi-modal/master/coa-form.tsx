"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { CoaKoperasi } from "@/types/koperasi-types/master/coa";

interface CoaFormProps {
  form: Partial<CoaKoperasi>;
  setForm: (data: Partial<CoaKoperasi>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function CoaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: CoaFormProps) {
  useEffect(() => {
    // default hanya untuk type (Global). Level TIDAK di-set default.
    if (!form.id && !form.type) {
      setForm({ ...form, type: "Global" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, form.type]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {readonly ? "Detail COA" : form.id ? "Edit COA" : "Tambah COA"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-1">
          <Label>Kode</Label>
          <Input
            value={form.code ?? ""}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan kode akun"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Nama</Label>
          <Input
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan nama akun"
          />
        </div>

        <div className="flex flex-col gap-y-1 sm:col-span-2">
          <Label>Deskripsi</Label>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            readOnly={readonly}
            placeholder="Masukkan deskripsi"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Level</Label>
          <Input
            type="number"
            min={1}
            // ⬇️ tidak ada default; biarkan kosong
            value={form.level ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, level: val === "" ? undefined : Number(val) });
            }}
            readOnly={readonly}
            placeholder="Masukkan level akun"
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <Label>Tipe</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800"
            value={form.type ?? "Global"}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={readonly}
            aria-label="Tipe COA"
          >
            <option value="Global">Global</option>
            <option value="Detail">Detail</option>
          </select>
        </div>
      </div>

      {!readonly && (
        <div className="pt-4 flex justify-end gap-2">
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