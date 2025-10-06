"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";

import {
  useGetKodeTransaksiListQuery,
  useGetKodeTransaksiByIdQuery,
  useCreateKodeTransaksiMutation,
  useUpdateKodeTransaksiMutation,
  useDeleteKodeTransaksiMutation,
  type KodeTransaksi,
} from "@/services/admin/kode-transaksi.service";

import FormKodeTransaksi, {
  FormKodeTransaksiState,
} from "@/components/form-modal/kode-transaksi-form";
import { displayDate } from "@/lib/format-utils";

export default function KodeTransaksiPage() {
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [currentPage] = useState(1);

  const { data, isLoading, refetch } = useGetKodeTransaksiListQuery({
    page: currentPage,
    paginate: 10,
  });

  const [createKodeTransaksi, { isLoading: isCreating }] =
    useCreateKodeTransaksiMutation();
  const [updateKodeTransaksi, { isLoading: isUpdating }] =
    useUpdateKodeTransaksiMutation();
  const [deleteKodeTransaksi] = useDeleteKodeTransaksiMutation();

  // modal state
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<KodeTransaksi | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // fetch detail hanya ketika edit agar dapat lines debits/credits terbaru
  const { data: selectedData, isLoading: isLoadingSelected } =
    useGetKodeTransaksiByIdQuery(selectedId!, { skip: !selectedId });

  // state form yang dikirim ke FormKodeTransaksi
  const [form, setForm] = useState<FormKodeTransaksiState>({
    code: "",
    module: "",
    description: "",
    status: 1,
    debits: [{ coa_id: 0, order: 1 }],
    credits: [{ coa_id: 0, order: 1 }],
  });

  // sinkronkan form saat data detail loaded (mode edit)
  useEffect(() => {
    if (selectedData && openForm && selected) {
      setForm({
        code: selectedData.code,
        module: selectedData.module,
        description: selectedData.description,
        status: selectedData.status,
        debits: selectedData.debits?.map((d, i) => ({
          coa_id: d.coa_id,
          order: d.order ?? i + 1,
        })) ?? [{ coa_id: 0, order: 1 }],
        credits: selectedData.credits?.map((c, i) => ({
          coa_id: c.coa_id,
          order: c.order ?? i + 1,
        })) ?? [{ coa_id: 0, order: 1 }],
      });
    }
  }, [selectedData, openForm, selected]);

  const filtered = useMemo(() => {
    const list = data?.data ?? [];
    const q = filters.search.trim().toLowerCase();
    return list.filter((item) => {
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchStatus =
        filters.status === "all" || String(item.status) === filters.status;
      return matchSearch && matchStatus;
    });
  }, [data?.data, filters]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 0:
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setSelectedId(null);
    setForm({
      code: "",
      module: "",
      description: "",
      status: 1,
      debits: [{ coa_id: 0, order: 1 }],
      credits: [{ coa_id: 0, order: 1 }],
    });
    setOpenForm(true);
  };

  const handleEdit = (item: KodeTransaksi) => {
    setSelected(item);
    setSelectedId(item.id);
    setOpenForm(true);
  };

  const handleDetail = (item: KodeTransaksi) => {
    setSelected(item);
    setOpenDetail(true);
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;
    try {
      await deleteKodeTransaksi(id).unwrap();
      await refetch();
      Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
    } catch {
      Swal.fire("Error!", "Gagal menghapus data.", "error");
    }
  };

  const submit = async () => {
    try {
      if (selected) {
        await updateKodeTransaksi({ id: selected.id, data: form }).unwrap();
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
      } else {
        await createKodeTransaksi(form).unwrap();
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      }
      setOpenForm(false);
      setSelected(null);
      setSelectedId(null);
      await refetch();
    } catch {
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const lastPage = data?.last_page ?? 1;

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        addButtonLabel="Tambah Kode Transaksi"
        openModal={handleCreate}
        onSearchChange={(search: string) =>
          setFilters((s) => ({ ...s, search }))
        }
        enableStatusFilter
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "1", label: "Active" },
          { value: "0", label: "Inactive" },
        ]}
        initialStatus={filters.status}
        onStatusChange={(status: string) =>
          setFilters((s) => ({ ...s, status }))
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Dibuat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Loading...</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.module}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination simple (opsional; currentPage masih fixed 1) */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Halaman <b>{currentPage}</b> dari <b>{lastPage}</b>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Sebelumnya
          </Button>
          <Button variant="outline" disabled>
            Berikutnya
          </Button>
        </div>
      </div>

      {/* Create/Edit Modal -> pakai Form terpisah */}
      <Dialog
        open={openForm}
        onOpenChange={(o) => {
          if (!o) {
            setOpenForm(false);
            setSelected(null);
            setSelectedId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selected ? "Edit Kode Transaksi" : "Tambah Kode Transaksi"}
            </DialogTitle>
          </DialogHeader>

          {selected && isLoadingSelected ? (
            <div className="py-10 text-center">Loading…</div>
          ) : (
            <FormKodeTransaksi
              form={form}
              setForm={setForm}
              onCancel={() => {
                setOpenForm(false);
                setSelected(null);
                setSelectedId(null);
              }}
              onSubmit={submit}
              isLoading={isCreating || isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Kode Transaksi</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Kode</Label>
                  <p className="text-sm text-gray-600">{selected.code}</p>
                </div>
                <div>
                  <Label className="font-medium">Module</Label>
                  <p className="text-sm text-gray-600">{selected.module}</p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">Deskripsi</Label>
                  <p className="text-sm text-gray-600">
                    {selected.description}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selected.status)}</div>
                </div>
                <div>
                  <Label className="font-medium">Tanggal Dibuat</Label>
                  <p className="text-sm text-gray-600">
                    {displayDate(selected.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}