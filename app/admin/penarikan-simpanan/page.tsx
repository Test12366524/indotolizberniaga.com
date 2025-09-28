"use client";

import { useState, useMemo } from "react";
import {
  Edit,
  Eye,
  XCircle,
  CheckCircle,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetPenarikanSimpananListQuery,
  useCreatePenarikanSimpananMutation,
  useUpdatePenarikanSimpananMutation,
  useDeletePenarikanSimpananMutation,
  useUpdatePenarikanStatusMutation,
} from "@/services/admin/penarikan-simpanan.service";
import useModal from "@/hooks/use-modal";
import FormPenarikanSimpanan from "@/components/form-modal/penarikan-simpanan-form";
import { PenarikanSimpanan } from "@/types/admin/penarikan-simpanan";
import Swal from "sweetalert2";

const Page = () => {
  const [form, setForm] = useState<Partial<PenarikanSimpanan>>({});
  const [readonly, setReadonly] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const statusList: { label: string; value: string }[] = [
    {
      label: "Pending",
      value: "0",
    },
    {
      label: "Approved",
      value: "1",
    },
    {
      label: "Rejected",
      value: "2",
    },
  ];

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useGetPenarikanSimpananListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const penarikanSimpanaList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createPenarikanSimpanan, { isLoading: isCreating }] =
    useCreatePenarikanSimpananMutation();

  const [updatePenarikanSimpanan, { isLoading: isUpdating }] =
    useUpdatePenarikanSimpananMutation();

  const [deletePenarikanSimpanan] = useDeletePenarikanSimpananMutation();

  const [updatePenarikanStatus] = useUpdatePenarikanStatusMutation();

  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const filteredData = useMemo(() => {
    if (!penarikanSimpanaList) return [];
    return penarikanSimpanaList.filter((item) => {
      const filterStatus =
        filters.status === "" || item.status.toString() === filters.status;
      const filterSearch =
        filters.search === "" ||
        item.bank_account_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        item.bank_name.toLowerCase().includes(filters.search.toLowerCase());
      return filterStatus && filterSearch;
    });
  }, [penarikanSimpanaList, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string | number) => {
    const statusConfig = {
      "0": { variant: "destructive" as const, label: "Pending" },
      "1": { variant: "success" as const, label: "Approved" },
      "2": { variant: "destructive" as const, label: "Ditolak" },
      pending: { variant: "destructive" as const, label: "Pending" },
      approved: { variant: "success" as const, label: "Approved" },
      rejected: { variant: "destructive" as const, label: "Ditolak" },
    };

    const statusKey = String(status);
    const config = statusConfig[statusKey as keyof typeof statusConfig] || {
      variant: "destructive" as const,
      label: String(status),
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        wallet_id: form.wallet_id || 0,
        user_id: form.user_id || 0,
        bank_name: form.bank_name || "",
        bank_account_name: form.bank_account_name || "",
        bank_account_number: form.bank_account_number || "",
        amount: form.amount?.toString() || "",
        description: form.description || "",
      };

      if (editingId) {
        await updatePenarikanSimpanan({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Penarikan simpanan diperbarui", "success");
      } else {
        await createPenarikanSimpanan(payload).unwrap();
        Swal.fire("Sukses", "Penarikan simpanan ditambahkan", "success");
      }

      setForm({});
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleEdit = (item: PenarikanSimpanan) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: PenarikanSimpanan) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: PenarikanSimpanan) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus penarikan?",
      text: `Penarikan ${item.user_name} - Rp ${item.amount?.toLocaleString(
        "id-ID"
      )}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deletePenarikanSimpanan(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Penarikan dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus penarikan", "error");
        console.error(error);
      }
    }
  };

  const handleStatusUpdate = async (
    item: PenarikanSimpanan,
    newStatus: string
  ) => {
    try {
      await updatePenarikanStatus({ id: item.id, status: newStatus }).unwrap();
      await refetch();
      Swal.fire("Berhasil", "Status penarikan diperbarui", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal memperbarui status", "error");
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kiri: filter */}
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari data penarikan..."
              value={filters.search || ""}
              onChange={(e) => {
                const q = e.target.value;
                setFilters({ ...filters, search: q });
              }}
              className="w-full sm:max-w-xs"
            />

            <Select
              value={filters.status}
              onValueChange={(val) => {
                setFilters({ ...filters, status: val });
              }}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {statusList.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kanan: aksi */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {/* Tambah data (opsional) */}
            {openModal && <Button onClick={openModal}>Buat Penarikan</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Nama Rekening</th>
                <th className="px-4 py-2">Nomor Rekening</th>
                <th className="px-4 py-2">Nama Bank</th>
                <th className="px-4 py-2">Nominal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {/* Primary Actions */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDetail(item)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Status Actions for Pending */}
                        {item.status === 0 && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleStatusUpdate(item, "1")}
                              title="Approve"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(item, "2")}
                              title="Reject"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Dropdown for Additional Actions */}
                        <div className="relative dropdown-container">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                openDropdownId === item.id ? null : item.id
                              );
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {/* Dropdown Menu */}
                          {openDropdownId === item.id && (
                            <div
                              className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-xl z-[99999] min-w-[160px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus Penarikan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.reference}</td>
                    <td className="px-4 py-2">{item.bank_account_name}</td>
                    <td className="px-4 py-2">{item.bank_account_number}</td>
                    <td className="px-4 py-2">{item.bank_name}</td>
                    <td className="px-4 py-2 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-2">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
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
          <FormPenarikanSimpanan
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
};

export default Page;
