// app/.../chat/pick-user-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";

// bentuk minimal yang kita pakai di UI
type AnggotaLite = { user_id: number; name: string; email?: string | null };

interface Props {
  open: boolean;
  onClose: () => void;
  onPickUser: (userId: number, name?: string) => void; // <- kirim user_id ke parent
}

export default function PickUserModal({ open, onClose, onPickUser }: Props) {
  const [query, setQuery] = useState("");

  // service sudah support ?search= (pastikan service-nya juga ditambah param search)
  const { data, isLoading } = useGetAnggotaListQuery(
    { page: 1, paginate: 50, search: query || undefined },
    { skip: !open }
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // data dari service: { data: AnggotaKoperasi[], last_page, ... }
  const users: AnggotaLite[] = useMemo(() => {
    const arr = (
      data && "data" in data ? (data.data as unknown[]) : []
    ) as Array<{
      user_id: number;
      name: string;
      email?: string | null;
    }>;
    return arr.map((a) => ({
      user_id: a.user_id,
      name: a.name,
      email: a.email ?? null,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* panel */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-base font-semibold">Tambahkan chat personal</h2>
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative mb-3">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Cari anggota…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Anggota tidak ditemukan.
                </p>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((u) => (
                    <li
                      key={u.user_id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => {
                        onPickUser(u.user_id, u.name); // <- kirim user_id ke parent
                        onClose();
                      }}
                    >
                      <Checkbox checked={false} />
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {(u.name ?? "U")[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">
                          {u.name || "Unknown User"}
                        </span>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email ?? ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shrink-0"
                      >
                        Pilih
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-4 pt-0 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}