"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetAngsuranPinjamanListQuery,
  useCreateAngsuranPinjamanMutation,
  useUpdateAngsuranPinjamanMutation,
  useDeleteAngsuranPinjamanMutation,
} from "@/services/admin/angsuran-pinjaman.service";
import { type AngsuranPinjaman } from "@/types/admin/angsuran-pinjaman";
import { Badge } from "@/components/ui/badge";
import ActionsGroup from "@/components/admin-components/actions-group";
import AngsuranPinjamanForm from "@/components/form-modal/admin/angsuran-pinjaman-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayDate } from "@/lib/format-utils";
import { showPaymentInstruction} from "@/lib/show-payment-instructions";

type TypeFilter = "all" | "manual" | "automatic";

type WrappedCreateResp = {
  code: number;
  message: string;
  data: AngsuranPinjaman;
};
const isWrappedResp = (x: unknown): x is WrappedCreateResp =>
  typeof x === "object" && x !== null && "data" in x;

export default function AngsuranPinjamanPage() {
  const [form, setForm] = useState<Partial<AngsuranPinjaman>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [type, setType] = useState<TypeFilter>("all");
  const [pinjamanId, setPinjamanId] = useState<number | undefined>(undefined);
  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useGetAngsuranPinjamanListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    type: type === "all" ? "" : type,
    pinjaman_id: pinjamanId,
    pinjaman_detail_id: detailId,
  });

  const list = useMemo(() => data?.data ?? [], [data]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const ref = (item.reference ?? "").toLowerCase();
      const user = (item.user_name ?? "").toLowerCase();
      const amt = String(item.amount ?? "");
      const typ = (item.type ?? "").toLowerCase();

      return (
        ref.includes(q) ||
        user.includes(q) ||
        amt.includes(q) ||
        typ.includes(q)
      );
    });
  }, [list, search]);

  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createMutation, { isLoading: isCreating }] =
    useCreateAngsuranPinjamanMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateAngsuranPinjamanMutation();
  const [deleteMutation] = useDeleteAngsuranPinjamanMutation();

  const handleSubmit = async () => {
    try {
      // ===== VALIDATION =====
      if (!form.pinjaman_id) throw new Error("Pinjaman wajib dipilih");
      if (!form.pinjaman_detail_id)
        throw new Error("Detail cicilan wajib dipilih");
      if (!form.amount || Number(form.amount) <= 0)
        throw new Error("Nominal pembayaran tidak valid");
      if (!form.type) throw new Error("Tipe pembayaran wajib dipilih");

      const fd = new FormData();
      fd.append("pinjaman_id", String(form.pinjaman_id));
      fd.append("pinjaman_detail_id", String(form.pinjaman_detail_id));
      fd.append("amount", String(form.amount));
      fd.append("type", String(form.type));

      if (form.payment_method) fd.append("payment_method", form.payment_method);
      if (form.payment_channel)
        fd.append("payment_channel", form.payment_channel);

      if (form.image instanceof File) {
        fd.append("image", form.image);
      } else if (typeof form.image === "string" && form.image) {
        fd.append("image", form.image);
      }

      if (editingId) {
        fd.append("_method", "PUT");
        await updateMutation({ id: editingId, payload: fd }).unwrap();
        await Swal.fire("Sukses", "Angsuran diperbarui", "success");
      } else {
        const resp = await createMutation(fd).unwrap();
        const created: AngsuranPinjaman = isWrappedResp(resp)
          ? resp.data
          : (resp as AngsuranPinjaman);

        await Swal.fire("Sukses", "Angsuran ditambahkan", "success");

        // Jika ada instruksi pembayaran (automatic) tampilkan modal
        if (created.payment) {
          await showPaymentInstruction(created.payment);
        }
      }

      setForm({});
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (err) {
      console.error(err);
      await Swal.fire(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan",
        "error"
      );
    }
  };

  const handleDetail = (item: AngsuranPinjaman) => {
    setForm(item);
    setEditingId(item.id);
    setReadonly(true);
    openModal();
  };

  const handleEdit = (item: AngsuranPinjaman) => {
    setForm(item);
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDelete = async (item: AngsuranPinjaman) => {
    const confirm = await Swal.fire({
      title: "Hapus Angsuran?",
      text: item.reference ?? `#${item.id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteMutation(item.id).unwrap();
        await refetch();
        await Swal.fire("Berhasil", "Angsuran dihapus", "success");
      } catch (e) {
        console.error(e);
        await Swal.fire("Gagal", "Gagal menghapus angsuran", "error");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar filter */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:flex-1">
            <label className="text-xs font-medium block mb-1">Cari</label>
            <Input
              placeholder="Cari reference, user, amount, atau tipe…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="text-xs font-medium block mb-1">Tipe</label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as TypeFilter)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setType("all");
                setPinjamanId(undefined);
                setDetailId(undefined);
                setCurrentPage(1);
                refetch();
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setForm({});
                setEditingId(null);
                setReadonly(false);
                openModal();
              }}
            >
              Tambah Angsuran
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2 whitespace-nowrap">Reference</th>
                <th className="px-4 py-2 whitespace-nowrap">User</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Metode</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 whitespace-nowrap">Paid At</th>
                <th className="px-4 py-2 whitespace-nowrap">Created</th>
                <th className="px-4 py-2 whitespace-nowrap">Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item: AngsuranPinjaman) => {
                  const paid = Boolean(item.payment?.paid_at);
                  const hasPayment = Boolean(item.payment);
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.reference ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.user_name ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {Number(item.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.type}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.payment_method ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.payment_channel ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Badge
                          variant={item.status ? "success" : "destructive"}
                        >
                          {item.status ? "Sukses" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.paid_at
                          ? new Date(item.paid_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {displayDate(item.created_at)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {hasPayment ? (
                          paid ? (
                            <Badge variant="success">Lunas</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                item.payment &&
                                showPaymentInstruction(item.payment)
                              }
                            >
                              Bayar
                            </Button>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <AngsuranPinjamanForm
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({});
              setEditingId(null);
              setReadonly(false);
              closeModal();
            }}
            onSubmit={handleSubmit}
            readonly={readonly}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}
    </div>
  );
}