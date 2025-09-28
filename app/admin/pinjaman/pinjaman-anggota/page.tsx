"use client";

import { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useModal from "@/hooks/use-modal";
import {
  useGetPinjamanListQuery,
  useCreatePinjamanMutation,
  useUpdatePinjamanMutation,
  useDeletePinjamanMutation,
  useUpdatePinjamanStatusMutation,
} from "@/services/admin/pinjaman.service";
import {
  useGetInstallmentsByPinjamanQuery,
  useMarkInstallmentAsPaidMutation,
  useUploadPaymentProofMutation,
} from "@/services/installment.service";
import { Pinjaman } from "@/types/admin/pinjaman";
import { Installment, INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUS_VARIANTS } from "@/types/installment";
import FormPinjaman from "@/components/form-modal/pinjaman-form";
import { useGetPinjamanCategoryListQuery } from "@/services/master/pinjaman-category.service";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";
import {
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  CreditCard,
  Upload,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function PinjamanAnggotaPage() {
  const [form, setForm] = useState<Partial<Pinjaman>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPinjaman, setSelectedPinjaman] = useState<Pinjaman | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [manualInstallments, setManualInstallments] = useState<Installment[]>([]);

  // Close dropdown when modal opens
  useEffect(() => {
    if (isOpen || paymentModalOpen) {
      setOpenDropdownId(null);
    }
  }, [isOpen, paymentModalOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Don't close if clicking on dropdown button or dropdown content
      if (openDropdownId && !target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId]);

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    category_id: "",
    status: "",
    user_id: "",
    date_from: "",
    date_to: "",
    search: "",
  });

  const { data, isLoading, refetch } = useGetPinjamanListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    category_id: filters.category_id ? Number(filters.category_id) : undefined,
    status: filters.status || undefined,
    user_id: filters.user_id ? Number(filters.user_id) : undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  // Get categories and users for filters
  const { data: categoriesData } = useGetPinjamanCategoryListQuery({
    page: 1,
    paginate: 100,
  });

  const { data: usersData } = useGetAnggotaListQuery({
    page: 1,
    paginate: 100,
    status: 1,
  });

  const categories = categoriesData?.data || [];
  const users = usersData?.data || [];
  const pinjamanList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  // Helper functions to get names by ID
  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || `User ID: ${userId}`;
  };

  const getUserEmail = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || "Email tidak tersedia";
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || `Category ID: ${categoryId}`;
  };

  const getCategoryCode = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.code || "Kode tidak tersedia";
  };

  const [createPinjaman, { isLoading: isCreating }] =
    useCreatePinjamanMutation();
  const [updatePinjaman, { isLoading: isUpdating }] =
    useUpdatePinjamanMutation();
  const [deletePinjaman] = useDeletePinjamanMutation();
  const [updateStatus] = useUpdatePinjamanStatusMutation();
  const [markAsPaid] = useMarkInstallmentAsPaidMutation();
  const [uploadProof] = useUploadPaymentProofMutation();
  // const [generateInstallments] = useGenerateInstallmentsMutation();

  // Get installments data when a pinjaman is selected
  const { data: installmentsData, isLoading: isLoadingInstallments, refetch: refetchInstallments } = useGetInstallmentsByPinjamanQuery(
    { pinjaman_id: selectedPinjaman?.id || 0 },
    { skip: !selectedPinjaman?.id }
  );

  const handleSubmit = async () => {
    try {
      const payload = {
        pinjaman_category_id: form.pinjaman_category_id || 0,
        user_id: form.user_id || 0,
        description: form.description || "",
        date: form.date || "",
        nominal: form.nominal || 0,
        tenor: form.tenor || 0,
        interest_rate: form.interest_rate || 0,
      };

      if (editingId) {
        await updatePinjaman({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Pinjaman diperbarui", "success");
      } else {
        await createPinjaman(payload).unwrap();
        Swal.fire("Sukses", "Pinjaman ditambahkan", "success");
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

  const handleEdit = (item: Pinjaman) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Pinjaman) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Pinjaman) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus pinjaman?",
      text: `Pinjaman ${item.user?.name} - Rp ${item.nominal?.toLocaleString(
        "id-ID"
      )}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deletePinjaman(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Pinjaman dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus pinjaman", "error");
        console.error(error);
      }
    }
  };

  const handleStatusUpdate = async (item: Pinjaman, newStatus: string) => {
    try {
      await updateStatus({ id: item.id, status: newStatus }).unwrap();
      await refetch();
      Swal.fire("Berhasil", "Status pinjaman diperbarui", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal memperbarui status", "error");
      console.error(error);
    }
  };

  const handlePaymentHistory = (item: Pinjaman) => {
    setSelectedPinjaman(item);
    setPaymentModalOpen(true);
  };

  const handleMarkAsPaid = async (installment: Installment) => {
    try {
      // Check if it's a manual installment
      if (manualInstallments.some(mi => mi.id === installment.id)) {
        // Update manual installment
        setManualInstallments(prev => 
          prev.map(inst => 
            inst.id === installment.id 
              ? { ...inst, status: 'paid' as const, paid_date: new Date().toISOString().split('T')[0] }
              : inst
          )
        );
        Swal.fire("Berhasil", "Angsuran berhasil ditandai sebagai dibayar", "success");
      } else {
        // API call for real installments
        const today = new Date().toISOString().split('T')[0];
        await markAsPaid({
          installment_id: installment.id,
          paid_date: today,
        }).unwrap();
        await refetchInstallments();
        Swal.fire("Berhasil", "Angsuran berhasil ditandai sebagai dibayar", "success");
      }
    } catch (error) {
      Swal.fire("Gagal", "Gagal menandai angsuran sebagai dibayar", "error");
      console.error(error);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedInstallment || !paymentFile) {
      Swal.fire("Error", "Pilih file bukti pembayaran terlebih dahulu", "error");
      return;
    }

    try {
      await uploadProof({
        installment_id: selectedInstallment.id,
        payment_proof: paymentFile,
      }).unwrap();
      await refetchInstallments();
      setUploadModalOpen(false);
      setSelectedInstallment(null);
      setPaymentFile(null);
      Swal.fire("Berhasil", "Bukti pembayaran berhasil diupload", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal upload bukti pembayaran", "error");
      console.error(error);
    }
  };

  const handleGenerateInstallments = async () => {
    if (!selectedPinjaman) return;

    try {
      // Generate installments manually based on loan data
      const installments = generateInstallmentsManually(selectedPinjaman);
      
      // Store in local state
      setManualInstallments(installments);
      
      Swal.fire("Berhasil", "Angsuran berhasil digenerate", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal generate angsuran", "error");
      console.error(error);
    }
  };

  // Manual function to generate installments
  const generateInstallmentsManually = (pinjaman: Pinjaman) => {
    const installments = [];
    const nominal = pinjaman.nominal || 0;
    const tenor = pinjaman.tenor || 0;
    const interestRate = pinjaman.interest_rate || 0;
    const startDate = new Date(pinjaman.date || new Date());
    
    // Calculate monthly payment using simple interest formula
    // Monthly payment = (Principal + Total Interest) / Tenor
    const totalInterest = (nominal * interestRate * tenor) / 100;
    const monthlyPayment = Math.round((nominal + totalInterest) / tenor);
    
    for (let i = 1; i <= tenor; i++) {
      // Calculate due date (monthly from start date)
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        id: i, // Temporary ID
        pinjaman_id: pinjaman.id,
        installment_number: i,
        amount: monthlyPayment,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    return installments;
  };

  const handleExport = async () => {
    if (filteredData.length === 0) {
      Swal.fire("Info", "Tidak bisa export karena datanya kosong", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Export Data",
      text: `Apakah Anda yakin ingin mengekspor ${filteredData.length} data pinjaman?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Export",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setIsExporting(true);

    // Prepare data for export
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      Anggota: getUserName(item.user_id),
      Email: getUserEmail(item.user_id),
      Kategori: getCategoryName(item.pinjaman_category_id),
      "Kode Kategori": getCategoryCode(item.pinjaman_category_id),
      "Nominal (Rp)": formatCurrency(item.nominal || 0),
      "Tenor (Bulan)": item.tenor || 0,
      "Suku Bunga (%)": item.interest_rate || 0,
      Status: item.status || "-",
      "Tanggal Pinjaman": item.date
        ? new Date(item.date).toLocaleDateString("id-ID")
        : "-",
      Deskripsi: item.description || "-",
      Dibuat: item.created_at
        ? new Date(item.created_at).toLocaleString("id-ID")
        : "-",
    }));

    // Create CSV content with metadata
    const headers = Object.keys(exportData[0]);
    const filterInfo = [];

    if (filters.category_id) {
      const category = categories.find(
        (c) => c.id === Number(filters.category_id)
      );
      filterInfo.push(`Kategori: ${category?.name || "Unknown"}`);
    }
    if (filters.status) {
      filterInfo.push(`Status: ${filters.status}`);
    }
    if (filters.user_id) {
      const user = users.find((u) => u.id === Number(filters.user_id));
      filterInfo.push(`Anggota: ${user?.name || "Unknown"}`);
    }
    if (filters.date_from) {
      filterInfo.push(`Dari: ${filters.date_from}`);
    }
    if (filters.date_to) {
      filterInfo.push(`Sampai: ${filters.date_to}`);
    }
    if (filters.search) {
      filterInfo.push(`Pencarian: ${filters.search}`);
    }

    const csvContent = [
      "LAPORAN PINJAMAN ANGGOTA",
      `Tanggal Export: ${new Date().toLocaleString("id-ID")}`,
      `Total Data: ${filteredData.length} record`,
      ...(filterInfo.length > 0 ? [`Filter: ${filterInfo.join(", ")}`] : []),
      "",
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in values
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `pinjaman-anggota-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire(
      "Berhasil",
      `Data berhasil diekspor (${filteredData.length} record)`,
      "success"
    );
    setIsExporting(false);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!filters.search) return pinjamanList;
    return pinjamanList.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.pinjaman_category?.name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [pinjamanList, filters.search]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pinjaman Anggota</h1>
          <p className="text-sm text-gray-500">
            Kelola data pinjaman anggota koperasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pinjaman
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cari nama, kategori, atau deskripsi..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Kategori</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category_id}
                onChange={(e) =>
                  setFilters({ ...filters, category_id: e.target.value })
                }
                aria-label="Filter kategori pinjaman"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                aria-label="Filter status pinjaman"
              >
                <option value="">Semua Status</option>
                <option value="0">Pending</option>
                <option value="1">Approved</option>
                <option value="2">Ditolak</option>
              </select>
            </div>

            {/* Anggota */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Anggota</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.user_id}
                onChange={(e) =>
                  setFilters({ ...filters, user_id: e.target.value })
                }
                aria-label="Filter anggota"
              >
                <option value="">Semua Anggota</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Dari */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Tanggal Dari</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                aria-label="Tanggal dari"
              />
            </div>

            {/* Tanggal Sampai */}
            <div className="flex flex-col gap-y-1">
              <label className="text-sm font-medium">Tanggal Sampai</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                aria-label="Tanggal sampai"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  category_id: "",
                  status: "",
                  user_id: "",
                  date_from: "",
                  date_to: "",
                  search: "",
                })
              }
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Anggota</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Nominal</th>
                <th className="px-4 py-2">Tenor</th>
                <th className="px-4 py-2">Suku Bunga</th>
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
                        {(item.status === "0" || item.status === "pending") && (
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
                                    handlePaymentHistory(item);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <CreditCard className="h-4 w-4" />
                                  History Pembayaran
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus Pinjaman
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">
                          {getUserName(item.user_id)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getUserEmail(item.user_id)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">
                          {getCategoryName(item.pinjaman_category_id)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getCategoryCode(item.pinjaman_category_id)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {formatCurrency(item.nominal)}
                    </td>
                    <td className="px-4 py-2">{item.tenor} bulan</td>
                    <td className="px-4 py-2">{item.interest_rate}%</td>
                    <td className="px-4 py-2">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString("id-ID")}
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

      {/* Pinjaman Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <FormPinjaman
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

      {/* Payment History Modal */}
      {paymentModalOpen && selectedPinjaman && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  History Pembayaran - {selectedPinjaman.user?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Pinjaman: {formatCurrency(selectedPinjaman.nominal)} - {selectedPinjaman.tenor} bulan
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateInstallments}
                  disabled={isLoadingInstallments}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Angsuran
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPaymentModalOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {isLoadingInstallments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Memuat data angsuran...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Total Angsuran</p>
                          <p className="font-semibold">
                            {(installmentsData?.data?.data?.length || 0) + manualInstallments.length} bulan
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Sudah Dibayar</p>
                          <p className="font-semibold">
                            {(installmentsData?.data?.data?.filter(i => i.status === 'paid').length || 0) + 
                             manualInstallments.filter(i => i.status === 'paid').length} bulan
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Belum Dibayar</p>
                          <p className="font-semibold">
                            {(installmentsData?.data?.data?.filter(i => i.status === 'pending' || i.status === 'overdue').length || 0) + 
                             manualInstallments.filter(i => i.status === 'pending' || i.status === 'overdue').length} bulan
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Installments Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-left">
                          <tr>
                            <th className="px-4 py-2">Bulan Ke</th>
                            <th className="px-4 py-2">Nominal</th>
                            <th className="px-4 py-2">Jatuh Tempo</th>
                            <th className="px-4 py-2">Tanggal Bayar</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {installmentsData?.data?.data?.length === 0 && manualInstallments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center p-8 text-gray-500">
                                Belum ada data angsuran. Klik &quot;Generate Angsuran&quot; untuk membuat jadwal pembayaran.
                              </td>
                            </tr>
                          ) : (
                            <>
                              {/* Manual Installments */}
                              {manualInstallments.map((installment) => (
                                <tr key={`manual-${installment.id}`} className="border-t">
                                  <td className="px-4 py-2 font-medium">
                                    {installment.installment_number}
                                  </td>
                                  <td className="px-4 py-2 font-medium">
                                    {formatCurrency(installment.amount)}
                                  </td>
                                  <td className="px-4 py-2">
                                    {new Date(installment.due_date).toLocaleDateString("id-ID")}
                                  </td>
                                  <td className="px-4 py-2">
                                    {installment.paid_date 
                                      ? new Date(installment.paid_date).toLocaleDateString("id-ID")
                                      : "-"
                                    }
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge 
                                      variant={INSTALLMENT_STATUS_VARIANTS[installment.status]}
                                    >
                                      {INSTALLMENT_STATUS_LABELS[installment.status]}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                      {installment.status === 'pending' || installment.status === 'overdue' ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleMarkAsPaid(installment)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Bayar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedInstallment(installment);
                                              setUploadModalOpen(true);
                                            }}
                                          >
                                            <Upload className="h-4 w-4 mr-1" />
                                            Upload Bukti
                                          </Button>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          {installment.payment_proof && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(installment.payment_proof, '_blank')}
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              Lihat Bukti
                                            </Button>
                                          )}
                                          <Badge variant="success" className="text-xs">
                                            Lunas
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              
                              {/* API Installments */}
                              {installmentsData?.data?.data?.map((installment) => (
                                <tr key={installment.id} className="border-t">
                                  <td className="px-4 py-2 font-medium">
                                    {installment.installment_number}
                                  </td>
                                  <td className="px-4 py-2 font-medium">
                                    {formatCurrency(installment.amount)}
                                  </td>
                                  <td className="px-4 py-2">
                                    {new Date(installment.due_date).toLocaleDateString("id-ID")}
                                  </td>
                                  <td className="px-4 py-2">
                                    {installment.paid_date 
                                      ? new Date(installment.paid_date).toLocaleDateString("id-ID")
                                      : "-"
                                    }
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge 
                                      variant={INSTALLMENT_STATUS_VARIANTS[installment.status]}
                                    >
                                      {INSTALLMENT_STATUS_LABELS[installment.status]}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                      {installment.status === 'pending' || installment.status === 'overdue' ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleMarkAsPaid(installment)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Bayar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedInstallment(installment);
                                              setUploadModalOpen(true);
                                            }}
                                          >
                                            <Upload className="h-4 w-4 mr-1" />
                                            Upload Bukti
                                          </Button>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          {installment.payment_proof && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(installment.payment_proof, '_blank')}
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              Lihat Bukti
                                            </Button>
                                          )}
                                          <Badge variant="success" className="text-xs">
                                            Lunas
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Payment Proof Modal */}
      {uploadModalOpen && selectedInstallment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Upload Bukti Pembayaran
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedInstallment(null);
                  setPaymentFile(null);
                }}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Angsuran Bulan Ke: <strong>{selectedInstallment.installment_number}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Nominal: <strong>{formatCurrency(selectedInstallment.amount)}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Jatuh Tempo: <strong>{new Date(selectedInstallment.due_date).toLocaleDateString("id-ID")}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih File Bukti Pembayaran
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format yang didukung: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedInstallment(null);
                    setPaymentFile(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUploadProof}
                  disabled={!paymentFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
