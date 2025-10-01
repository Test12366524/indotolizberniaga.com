"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  Calendar,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetJournalListQuery,
  useGetJournalByIdQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation,
  useGetCOAListQuery,
  type Journal,
  type CreateJournalRequest,
} from "@/services/admin/journal.service";
import ActionsGroup from "@/components/admin-components/actions-group";

export default function JurnalTransaksiPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Journal | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateJournalRequest>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    is_posted: 0,
    details: [{ coa_id: 0, type: "debit", debit: 0, credit: 0, memo: "" }],
  });

  const { data: journalData, isLoading } = useGetJournalListQuery({
    page: currentPage,
    paginate: 10,
    orderBy: "updated_at",
    order: "desc",
  });

  const { data: coaData } = useGetCOAListQuery({
    page: 1,
    paginate: 100,
  });

  const { data: selectedItemData, isLoading: isLoadingSelectedItem } =
    useGetJournalByIdQuery(selectedItemId!, {
      skip: !selectedItemId,
    });

  const [createJournal] = useCreateJournalMutation();
  const [updateJournal] = useUpdateJournalMutation();
  const [deleteJournal] = useDeleteJournalMutation();

  // Populate form data when detailed item data is loaded
  useEffect(() => {
    if (selectedItemData && isEditModalOpen) {
      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return new Date().toISOString().split("T")[0];
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        date: formatDateForInput(selectedItemData.date),
        description: selectedItemData.description,
        is_posted: selectedItemData.is_posted ? 1 : 0,
        details: selectedItemData.details?.map((detail) => ({
          coa_id: detail.coa_id,
          type: detail.type,
          debit: detail.debit,
          credit: detail.credit,
          memo: detail.memo,
        })) || [{ coa_id: 0, type: "debit", debit: 0, credit: 0, memo: "" }],
      });
    }
  }, [selectedItemData, isEditModalOpen]);

  const filteredData = useMemo(() => {
    if (!journalData?.data) return [];

    return journalData.data.filter((item) => {
      const matchesSearch = item.description
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "1" && item.is_posted === true) ||
        (filters.status === "0" && item.is_posted === false);

      return matchesSearch && matchesStatus;
    });
  }, [journalData?.data, filters]);

  const getStatusBadge = (isPosted: boolean | number) => {
    const isPostedValue =
      typeof isPosted === "boolean" ? isPosted : isPosted === 1;
    return isPostedValue ? (
      <Badge className="bg-green-100 text-green-800">Posted</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    );
  };

  const handleCreate = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      is_posted: 0,
      details: [{ coa_id: 0, type: "debit", debit: 0, credit: 0, memo: "" }],
    });
    setSelectedItem(null);
    setSelectedItemId(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: Journal) => {
    setSelectedItem(item);
    setSelectedItemId(item.id);
    setIsEditModalOpen(true);
  };

  const handleDetail = (item: Journal) => {
    setSelectedItem(item);
    setSelectedItemId(item.id);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteJournal(id).unwrap();
        Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
      } catch {
        Swal.fire("Error!", "Gagal menghapus data.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedItem) {
        await updateJournal({
          id: selectedItem.id,
          data: formData,
        }).unwrap();
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
        setIsEditModalOpen(false);
      } else {
        await createJournal(formData).unwrap();
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
        setIsCreateModalOpen(false);
      }
      setSelectedItem(null);
      setSelectedItemId(null);
    } catch {
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const addDetailEntry = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { coa_id: 0, type: "debit", debit: 0, credit: 0, memo: "" },
      ],
    });
  };

  const removeDetailEntry = (index: number) => {
    if (formData.details.length > 1) {
      setFormData({
        ...formData,
        details: formData.details.filter((_, i) => i !== index),
      });
    }
  };

  const updateDetailEntry = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    // Reset the opposite field when type changes
    if (field === "type") {
      if (value === "debit") {
        updatedDetails[index].credit = 0;
      } else if (value === "credit") {
        updatedDetails[index].debit = 0;
      }
    }

    setFormData({ ...formData, details: updatedDetails });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCOAName = (coaId: number) => {
    const coa = coaData?.data.find((c) => c.id === coaId);
    return coa ? `${coa.code} - ${coa.name}` : "Unknown COA";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Jurnal Transaksi</h1>
        <p className="text-sm text-gray-500">
          Kelola jurnal transaksi akuntansi
        </p>
      </div>

      {/* Toolbar */}
      <ProdukToolbar
        addButtonLabel="Tambah Jurnal"
        openModal={handleCreate}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onCategoryChange={(status) => setFilters({ ...filters, status })}
        categories={[
          { value: "all", label: "Semua Status" },
          { value: "1", label: "Posted" },
          { value: "0", label: "Draft" },
        ]}
        initialSearch={filters.search}
        initialCategory={filters.status}
      />

      {/* Data Table */}
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
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
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
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <ActionsGroup
                            handleDetail={() => handleDetail(item)}
                            handleEdit={() => handleEdit(item)}
                            handleDelete={() => handleDelete(item.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.reference || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.is_posted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {journalData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {journalData.from} sampai {journalData.to} dari{" "}
            {journalData.total} data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!journalData.prev_page_url}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-700">
              Halaman {journalData.current_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!journalData.next_page_url}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedItem(null);
            setSelectedItemId(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedItem
                ? "Edit Jurnal Transaksi"
                : "Tambah Jurnal Transaksi"}
            </DialogTitle>
          </DialogHeader>

          {isEditModalOpen && isLoadingSelectedItem ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6 p-1">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Informasi Dasar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="is_posted">Status</Label>
                      <Select
                        value={String(formData.is_posted)}
                        onValueChange={(value) =>
                          setFormData({ ...formData, is_posted: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Draft</SelectItem>
                          <SelectItem value="1">Posted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Masukkan deskripsi jurnal"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Journal Details Section */}
                <div className="bg-white border rounded-lg">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Detail Jurnal</h3>
                      <Button
                        type="button"
                        onClick={addDetailEntry}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Detail
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {formData.details.map((detail, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Detail #{index + 1}
                          </span>
                          {formData.details.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetailEntry(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>COA</Label>
                            <Select
                              value={String(detail.coa_id)}
                              onValueChange={(value) =>
                                updateDetailEntry(
                                  index,
                                  "coa_id",
                                  Number(value)
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih COA" />
                              </SelectTrigger>
                              <SelectContent>
                                {coaData?.data.map((coa) => (
                                  <SelectItem
                                    key={coa.id}
                                    value={String(coa.id)}
                                  >
                                    {coa.code} - {coa.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Tipe</Label>
                            <Select
                              value={detail.type}
                              onValueChange={(value: "debit" | "credit") =>
                                updateDetailEntry(index, "type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="debit">Debit</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* Debug info */}
                            <p className="text-xs text-gray-500 mt-1">
                              Current type: {detail.type} (index: {index})
                            </p>
                          </div>

                          {detail.type === "debit" ? (
                            <div>
                              <Label>Debit</Label>
                              <Input
                                type="text"
                                value={detail.debit || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  updateDetailEntry(
                                    index,
                                    "debit",
                                    Number(value) || 0
                                  );
                                }}
                                placeholder="0"
                              />
                            </div>
                          ) : (
                            <div>
                              <Label>Credit</Label>
                              <Input
                                type="text"
                                value={detail.credit || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  updateDetailEntry(
                                    index,
                                    "credit",
                                    Number(value) || 0
                                  );
                                }}
                                placeholder="0"
                              />
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <Label>Memo</Label>
                            <Input
                              value={detail.memo}
                              onChange={(e) =>
                                updateDetailEntry(index, "memo", e.target.value)
                              }
                              placeholder="Catatan tambahan"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setSelectedItem(null);
                      setSelectedItemId(null);
                    }}
                    className="px-6"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {selectedItem ? "Update" : "Simpan"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
            setSelectedItemId(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Jurnal Transaksi
            </DialogTitle>
          </DialogHeader>

          {isDetailModalOpen && isLoadingSelectedItem ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse">Loading detail...</div>
            </div>
          ) : (
            selectedItemData && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-1">
                  {/* Header Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Tanggal
                        </Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(selectedItemData.date)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Status
                        </Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedItemData.is_posted)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Total Debit
                        </Label>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            selectedItemData.details?.reduce((sum, detail) => {
                              const debit = Number(detail.debit) || 0;
                              return sum + debit;
                            }, 0) || 0
                          )}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Total Credit
                        </Label>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(
                            selectedItemData.details?.reduce((sum, detail) => {
                              const credit = Number(detail.credit) || 0;
                              return sum + credit;
                            }, 0) || 0
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Label className="text-sm font-medium text-gray-500">
                        Deskripsi
                      </Label>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedItemData.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Dibuat: {formatDate(selectedItemData.created_at)}
                      </span>
                      <span>
                        {selectedItemData.details?.length || 0} entri detail
                      </span>
                    </div>
                  </div>

                  {/* Detail Entries */}
                  {selectedItemData.details &&
                  selectedItemData.details.length > 0 ? (
                    <div className="bg-white border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Detail Entri Jurnal
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                COA
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipe
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Debit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Memo
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedItemData.details.map((detail, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div className="max-w-xs">
                                    <p className="font-medium">
                                      {detail.coa
                                        ? `${detail.coa.code} - ${detail.coa.name}`
                                        : getCOAName(detail.coa_id)}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    variant={
                                      detail.type === "debit"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      detail.type === "debit"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {detail.type.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  {detail.debit > 0
                                    ? formatCurrency(detail.debit)
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                  {detail.credit > 0
                                    ? formatCurrency(detail.credit)
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                  <p className="truncate" title={detail.memo}>
                                    {detail.memo || "-"}
                                  </p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak Ada Detail
                      </h3>
                      <p className="text-gray-500">
                        Jurnal ini belum memiliki detail entri.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
