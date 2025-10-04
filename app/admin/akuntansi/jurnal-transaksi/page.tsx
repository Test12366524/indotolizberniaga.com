"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
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
import { displayDate, formatDate } from "@/lib/format-utils";
import JournalForm from "@/components/form-modal/jurnal-transaksi-form";
import { Calendar, FileText } from "lucide-react";

export default function JurnalTransaksiPage() {
  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    date_from?: Date;
    date_to?: Date;
  }>({
    search: "",
    status: "all",
    date_from: undefined,
    date_to: undefined,
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

  const {
    data: journalData,
    isLoading,
    refetch,
  } = useGetJournalListQuery({
    page: currentPage,
    paginate: 10,
    orderBy: "updated_at",
    order: "desc",
  });

  const { data: coaData } = useGetCOAListQuery({ page: 1, paginate: 100 });

  const { data: selectedItemData, isLoading: isLoadingSelectedItem } =
    useGetJournalByIdQuery(selectedItemId!, { skip: !selectedItemId });

  const [createJournal, { isLoading: isCreating }] = useCreateJournalMutation();
  const [updateJournal, { isLoading: isUpdating }] = useUpdateJournalMutation();
  const [deleteJournal] = useDeleteJournalMutation();

  // populate saat edit
  useEffect(() => {
    if (selectedItemData && isEditModalOpen) {
      const date = selectedItemData.date
        ? new Date(selectedItemData.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      setFormData({
        date,
        description: selectedItemData.description ?? "",
        is_posted: selectedItemData.is_posted ? 1 : 0,
        details: selectedItemData.details?.map((d) => ({
          coa_id: d.coa_id,
          type: d.type,
          debit: Number(d.debit) || 0,
          credit: Number(d.credit) || 0,
          memo: d.memo ?? "",
        })) || [{ coa_id: 0, type: "debit", debit: 0, credit: 0, memo: "" }],
      });
    }
  }, [selectedItemData, isEditModalOpen]);

  const filteredData = useMemo(() => {
    const list = journalData?.data ?? [];

    const fromStr = filters.date_from
      ? formatDate(filters.date_from)
      : undefined;
    const toStr = filters.date_to ? formatDate(filters.date_to) : undefined;

    return list.filter((item) => {
      const matchesSearch = item.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "1" && item.is_posted === true) ||
        (filters.status === "0" && item.is_posted === false);

      let matchesDate = true;
      if (fromStr || toStr) {
        const itemDate = formatDate(item.date);
        if (!itemDate) matchesDate = false;
        else if (fromStr && toStr)
          matchesDate = itemDate >= fromStr && itemDate <= toStr;
        else if (fromStr && !toStr) matchesDate = itemDate === fromStr;
      }

      return !!matchesSearch && !!matchesStatus && !!matchesDate;
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
        await refetch();
        Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
      } catch {
        Swal.fire("Error!", "Gagal menghapus data.", "error");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        await updateJournal({ id: selectedItem.id, data: formData }).unwrap();
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
        setIsEditModalOpen(false);
      } else {
        await createJournal(formData).unwrap();
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
        setIsCreateModalOpen(false);
      }
      setSelectedItem(null);
      setSelectedItemId(null);
      await refetch();
    } catch {
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const getCOAName = (coaId: number) => {
    const coa = coaData?.data.find((c) => c.id === coaId);
    return coa ? `${coa.code} - ${coa.name}` : "Unknown COA";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar */}
      <ProdukToolbar
        addButtonLabel="Jurnal"
        openModal={handleCreate}
        onSearchChange={(search) => setFilters((s) => ({ ...s, search }))}
        onCategoryChange={(status) => setFilters((s) => ({ ...s, status }))}
        categories={[
          { value: "all", label: "Semua Status" },
          { value: "1", label: "Posted" },
          { value: "0", label: "Draft" },
        ]}
        initialSearch={filters.search}
        initialCategory={filters.status}
        enableDateFilter
        initialDateFrom={filters.date_from}
        initialDateTo={filters.date_to}
        onDateRangeChange={(from, to) =>
          setFilters((s) => ({ ...s, date_from: from, date_to: to }))
        }
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
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayDate(item.date)}
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
                        {displayDate(item.created_at)}
                      </td>
                    </tr>
                  ))
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

      {/* Create/Edit Modal (besar) */}
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
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
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
              <JournalForm
                form={formData}
                setForm={setFormData}
                onCancel={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                  setSelectedItemId(null);
                }}
                onSubmit={handleSubmit}
                isLoading={isCreating || isUpdating}
              />
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
                        <span className="text-sm font-medium text-gray-500">
                          Tanggal
                        </span>
                        <p className="text-lg font-semibold text-gray-900">
                          {displayDate(selectedItemData.date)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500">
                          Status
                        </span>
                        <div className="mt-1">
                          {getStatusBadge(selectedItemData.is_posted)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500">
                          Total Debit
                        </span>
                        <p className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(
                            selectedItemData.details?.reduce(
                              (s, d) => s + (Number(d.debit) || 0),
                              0
                            ) || 0
                          )}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500">
                          Total Credit
                        </span>
                        <p className="text-lg font-bold text-red-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(
                            selectedItemData.details?.reduce(
                              (s, d) => s + (Number(d.credit) || 0),
                              0
                            ) || 0
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-500">
                        Deskripsi
                      </span>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedItemData.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Dibuat: {displayDate(selectedItemData.created_at)}
                      </span>
                      <span>
                        {selectedItemData.details?.length || 0} entri detail
                      </span>
                    </div>
                  </div>

                  {/* Detail entries */}
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
                                    ? new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                      }).format(detail.debit)
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                  {detail.credit > 0
                                    ? new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                      }).format(detail.credit)
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