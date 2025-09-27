// src/components/history.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { displayDate } from "@/lib/format-utils";

export type SavingsEntry = {
  id: number;
  tanggal: string;
  jenis: string;
  nominal: number;
  keterangan?: string | null;
};

export type LoanEntry = {
  id: number;
  tanggal: string;
  nomorKontrak: string;
  pokokPinjaman: number;
  tenorBulan: number;
  bungaPersen: number;
  status: "berjalan" | "lunas" | "tunggakan";
};

export type PaymentEntry = {
  id: number;
  tanggal: string;
  nomorKontrak: string;
  cicilanKe: number;
  pokokDibayar: number;
  bungaDibayar: number;
  denda?: number;
  totalBayar: number;
};

export type BiodataSingkat = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  gender?: "M" | "F";
  nik?: string;
  npwp?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  status?: 0 | 1 | 2;
};

function formatRupiah(n: number) {
  try {
    return new Intl.NumberFormat("id-ID").format(n);
  } catch {
    return String(n);
  }
}

function StatusBadge({ status }: { status?: 0 | 1 | 2 }) {
  if (status === 1)
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
        APPROVED
      </span>
    );
  if (status === 2)
    return (
      <span className="inline-flex items-center rounded-md bg-red-100 text-red-700 px-2 py-0.5 text-xs">
        REJECTED
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
      PENDING
    </span>
  );
}

function TablePagination({
  page,
  total,
  perPage = 10,
  onChange,
}: {
  page: number;
  total: number;
  perPage?: number;
  onChange: (page: number) => void;
}) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="p-3 flex items-center justify-between bg-muted/40 border-t">
      <div className="text-xs sm:text-sm">
        Halaman <strong>{page}</strong> dari <strong>{lastPage}</strong>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

/** helper biasa (bukan hook) */
function withDummyIfEmpty<T>(arr: T[] | undefined, makeDummy: () => T[]): T[] {
  return arr && arr.length > 0 ? arr : makeDummy();
}

export default function HistoryModal() {
  const router = useRouter();

  // ===== Dummy biodata (bisa ganti nanti dari props/store) =====
  const anggota: BiodataSingkat = useMemo(
    () => ({
      id: 1,
      name: "Siti Rahma",
      email: "siti.rahma@example.com",
      phone: "0812-1234-5678",
      address: "Jl. Melati No. 10, Bandung",
      gender: "F",
      nik: "3273xxxxxxxxxxxx",
      npwp: "12.345.678.9-012.000",
      birth_place: "Bandung",
      birth_date: "1995-06-21",
      status: 1,
    }),
    []
  );

  // ===== Dummy fallback data =====
  const simpanan = useMemo(
    () =>
      withDummyIfEmpty<SavingsEntry>(undefined, () =>
        Array.from({ length: 25 }).map((_, i) => ({
          id: i + 1,
          tanggal: `2025-09-${String((i % 30) + 1).padStart(2, "0")}`,
          jenis: i % 2 === 0 ? "Simpanan Pokok" : "Simpanan Sukarela",
          nominal: 50_000 + (i % 5) * 10_000,
          keterangan: i % 3 === 0 ? "Setoran rutin" : null,
        }))
      ),
    []
  );

  const pinjaman = useMemo(
    () =>
      withDummyIfEmpty<LoanEntry>(undefined, () =>
        Array.from({ length: 24 }).map((_, i) => ({
          id: i + 1,
          tanggal: `2025-08-${String((i % 30) + 1).padStart(2, "0")}`,
          nomorKontrak: `PKJ/2025/${String(i + 1).padStart(4, "0")}`,
          pokokPinjaman: 5_000_000 + (i % 6) * 1_000_000,
          tenorBulan: 6 + (i % 6) * 3,
          bungaPersen: 1 + (i % 3),
          status: (["berjalan", "lunas", "tunggakan"] as const)[i % 3],
        }))
      ),
    []
  );

  const pembayaran = useMemo(
    () =>
      withDummyIfEmpty<PaymentEntry>(undefined, () =>
        Array.from({ length: 33 }).map((_, i) => {
          const pokok = 300_000 + (i % 5) * 50_000;
          const bunga = 50_000 + (i % 4) * 10_000;
          const denda = i % 7 === 0 ? 15_000 : 0;
          return {
            id: i + 1,
            tanggal: `2025-09-${String((i % 30) + 1).padStart(2, "0")}`,
            nomorKontrak: `PKJ/2025/${String((i % 12) + 1).padStart(4, "0")}`,
            cicilanKe: (i % 12) + 1,
            pokokDibayar: pokok,
            bungaDibayar: bunga,
            denda,
            totalBayar: pokok + bunga + denda,
          };
        })
      ),
    []
  );

  // ===== Totals pembayaran =====
  const totalPokokTerbayar = useMemo(
    () => pembayaran.reduce((acc, it) => acc + (it.pokokDibayar ?? 0), 0),
    [pembayaran]
  );
  const totalBungaTerbayar = useMemo(
    () => pembayaran.reduce((acc, it) => acc + (it.bungaDibayar ?? 0), 0),
    [pembayaran]
  );
  const totalDenda = useMemo(
    () => pembayaran.reduce((acc, it) => acc + (it.denda ?? 0), 0),
    [pembayaran]
  );
  const totalBayar = useMemo(
    () => pembayaran.reduce((acc, it) => acc + (it.totalBayar ?? 0), 0),
    [pembayaran]
  );

  // ===== Pagination per tab =====
  const PER_PAGE = 10;
  const [tab, setTab] = useState<"simpanan" | "pinjaman" | "pembayaran">(
    "simpanan"
  );
  const [pageS, setPageS] = useState(1);
  const [pageL, setPageL] = useState(1);
  const [pageP, setPageP] = useState(1);

  const slicePaginated = <T,>(arr: T[], page: number) =>
    arr.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const viewS = useMemo(
    () => slicePaginated(simpanan, pageS),
    [simpanan, pageS]
  );
  const viewL = useMemo(
    () => slicePaginated(pinjaman, pageL),
    [pinjaman, pageL]
  );
  const viewP = useMemo(
    () => slicePaginated(pembayaran, pageP),
    [pembayaran, pageP]
  );

  const handleTabChange = (v: string) => {
    const nv = v as typeof tab;
    setTab(nv);
    if (nv === "simpanan") setPageS(1);
    if (nv === "pinjaman") setPageL(1);
    if (nv === "pembayaran") setPageP(1);
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden bg-white">
        <Tabs value={tab} onValueChange={handleTabChange}>
          {/* Sticky header + biodata + tabs list */}
          <div className="sticky top-0 z-20 bg-white border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-base font-semibold">Riwayat Anggota</h2>
              <Button variant="outline" onClick={() => router.back()}>
                Tutup
              </Button>
            </div>

            <div className="px-4 pb-3">
              <h3 className="font-semibold mb-2">Biodata Singkat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Nama</div>
                  <div className="font-medium">{anggota.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">{anggota.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Telepon</div>
                  <div className="font-medium">{anggota.phone}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gender</div>
                  <div className="font-medium">{anggota.gender ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">NIK</div>
                  <div className="font-medium">{anggota.nik ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">NPWP</div>
                  <div className="font-medium">{anggota.npwp ?? "-"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-muted-foreground">Alamat</div>
                  <div className="font-medium">{anggota.address || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    Tempat / Tgl Lahir
                  </div>
                  <div className="font-medium">
                    {(anggota.birth_place || "-") +
                      " / " +
                      (displayDate(anggota.birth_date) || "-")}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">
                    <StatusBadge status={anggota.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 border-t">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="simpanan">Riwayat Simpanan</TabsTrigger>
                <TabsTrigger value="pinjaman">Riwayat Pinjaman</TabsTrigger>
                <TabsTrigger value="pembayaran">Riwayat Pembayaran</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tabs content */}
          <div className="px-4 py-4">
            {/* SIMPANAN */}
            <TabsContent value="simpanan" className="m-0">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-2 whitespace-nowrap">Tanggal</th>
                      <th className="px-3 py-2 whitespace-nowrap">Jenis</th>
                      <th className="px-3 py-2 whitespace-nowrap">Nominal</th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewS.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-3 py-2">{row.tanggal}</td>
                        <td className="px-3 py-2">{row.jenis}</td>
                        <td className="px-3 py-2">
                          Rp {formatRupiah(row.nominal)}
                        </td>
                        <td className="px-3 py-2">{row.keterangan ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={pageS}
                total={simpanan.length}
                onChange={setPageS}
              />
            </TabsContent>

            {/* PINJAMAN */}
            <TabsContent value="pinjaman" className="m-0">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">No. Kontrak</th>
                      <th className="px-3 py-2">Pokok Pinjaman</th>
                      <th className="px-3 py-2">Tenor (bln)</th>
                      <th className="px-3 py-2">Bunga (%)</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewL.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.tanggal}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.nomorKontrak}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          Rp {formatRupiah(row.pokokPinjaman)}
                        </td>
                        <td className="px-3 py-2">{row.tenorBulan}</td>
                        <td className="px-3 py-2">{row.bungaPersen}</td>
                        <td className="px-3 py-2 capitalize">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={pageL}
                total={pinjaman.length}
                onChange={setPageL}
              />
            </TabsContent>

            {/* PEMBAYARAN */}
            <TabsContent value="pembayaran" className="m-0">
              <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                <div className="space-x-3">
                  <span>
                    Pokok:{" "}
                    <strong>Rp {formatRupiah(totalPokokTerbayar)}</strong>
                  </span>
                  <span>
                    Bunga:{" "}
                    <strong>Rp {formatRupiah(totalBungaTerbayar)}</strong>
                  </span>
                  <span>
                    Denda: <strong>Rp {formatRupiah(totalDenda)}</strong>
                  </span>
                  <span>
                    Total Bayar: <strong>Rp {formatRupiah(totalBayar)}</strong>
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">No. Kontrak</th>
                      <th className="px-3 py-2">Cicilan ke</th>
                      <th className="px-3 py-2">Pokok</th>
                      <th className="px-3 py-2">Bunga</th>
                      <th className="px-3 py-2">Denda</th>
                      <th className="px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewP.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.tanggal}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.nomorKontrak}
                        </td>
                        <td className="px-3 py-2">{row.cicilanKe}</td>
                        <td className="px-3 py-2">
                          Rp {formatRupiah(row.pokokDibayar)}
                        </td>
                        <td className="px-3 py-2">
                          Rp {formatRupiah(row.bungaDibayar)}
                        </td>
                        <td className="px-3 py-2">
                          Rp {formatRupiah(row.denda ?? 0)}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          Rp {formatRupiah(row.totalBayar)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={pageP}
                total={pembayaran.length}
                onChange={setPageP}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}