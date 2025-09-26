"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combo-box";
import type { AnggotaKoperasi } from "@/types/koperasi-types/anggota";
import { useGetUsersListQuery } from "@/services/koperasi-service/users-management.service";

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

type UsersPayload = {
  data: UserItem[];
  last_page?: number;
  current_page?: number;
  total?: number;
};

interface AnggotaFormProps {
  form: Partial<
    AnggotaKoperasi & {
      user_id?: number | null;
      password?: string;
      password_confirmation?: string;
    }
  >;
  setForm: (
    data: Partial<
      AnggotaKoperasi & {
        user_id?: number | null;
        password?: string;
        password_confirmation?: string;
      }
    >
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function AnggotaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: AnggotaFormProps) {
  // ---- Semua hooks diletakkan di atas sebelum kemungkinan early return ----
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Users combobox state + query
  const [userQuery, setUserQuery] = useState("");
  const { data: usersResp, isLoading: isUsersLoading } = useGetUsersListQuery({
    search: userQuery,
    paginate: 10,
    page: 1,
  });

  // Ambil array user dari payload: { data: UserItem[], last_page, ... }
  const users: UserItem[] = useMemo(() => {
    const payload = usersResp as { data?: UsersPayload } | undefined;
    return payload?.data?.data ?? [];
  }, [usersResp]);

  // Temukan user terpilih dengan aman (tanpa ?? unreachable)
  const selectedUser = useMemo(() => {
    return typeof form.user_id === "number"
      ? users.find((u) => u.id === form.user_id) ?? null
      : null;
  }, [users, form.user_id]);

  const statusOptions: Array<{ value: 0 | 1 | 2; label: string }> = [
    { value: 0, label: "PENDING" },
    { value: 1, label: "APPROVED" },
    { value: 2, label: "REJECTED" },
  ];

  // ---- Early skeleton (bukan memanggil hooks setelah ini) ----
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <Button variant="ghost" onClick={onCancel}>
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Anggota"
            : form.id
            ? "Edit Anggota"
            : "Tambah Anggota"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* USER (Combobox) – hanya tampil saat form editable */}
          {!readonly && (
            <div className="flex flex-col gap-y-1 sm:col-span-2">
              <Label>User</Label>
              <Combobox<UserItem>
                value={typeof form.user_id === "number" ? form.user_id : null}
                onChange={(userId) => {
                  const u = users.find((x) => x.id === userId);
                  setForm({
                    ...form,
                    user_id: userId,
                    name: u?.name ?? "",
                    email: u?.email ?? "",
                    phone: u?.phone ?? "",
                  });
                }}
                onSearchChange={(q) => setUserQuery(q)}
                data={users}
                isLoading={isUsersLoading}
                placeholder="Pilih user…"
                getOptionLabel={(u) =>
                  `${u.name} (${u.email}${u.phone ? ` • ${u.phone}` : ""})`
                }
              />
              {selectedUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  Terpilih: {selectedUser.name} — {selectedUser.email}
                  {selectedUser.phone ? ` — ${selectedUser.phone}` : ""}
                </p>
              )}
            </div>
          )}

          {/* Nama */}
          <div className="flex flex-col gap-y-1">
            <Label>Nama</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon</Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Password & Confirmation */}
          {!readonly && (
            <>
              <div className="flex flex-col gap-y-1">
                <Label>Password{!form.id && " (wajib saat tambah)"}</Label>
                <Input
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password_confirmation: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          {/* Gender */}
          <div className="flex flex-col gap-y-1">
            <Label>Gender</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.gender ?? ""}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as "M" | "F" })
              }
              disabled={readonly}
            >
              <option value="">Pilih Gender</option>
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>
          </div>

          {/* Tempat Lahir */}
          <div className="flex flex-col gap-y-1">
            <Label>Tempat Lahir</Label>
            <Input
              value={form.birth_place ?? ""}
              onChange={(e) =>
                setForm({ ...form, birth_place: e.target.value })
              }
              readOnly={readonly}
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="flex flex-col gap-y-1">
            <Label>Tanggal Lahir</Label>
            <Input
              type="date"
              value={form.birth_date ?? ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* NIK */}
          <div className="flex flex-col gap-y-1">
            <Label>NIK</Label>
            <Input
              value={form.nik ?? ""}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* NPWP */}
          <div className="flex flex-col gap-y-1">
            <Label>NPWP</Label>
            <Input
              value={form.npwp ?? ""}
              onChange={(e) => setForm({ ...form, npwp: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Alamat (full width) */}
          <div className="flex flex-col gap-y-1 sm:col-span-2">
            <Label>Alamat</Label>
            <Textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Status</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={
                form.status !== undefined && form.status !== null
                  ? String(form.status)
                  : ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  status: Number(e.target.value) as 0 | 1 | 2,
                })
              }
              disabled={readonly}
            >
              <option value="">Pilih Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
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
