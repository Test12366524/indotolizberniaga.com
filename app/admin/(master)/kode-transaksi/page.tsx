"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Eye, Edit, Trash2, Plus, Minus } from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetKodeTransaksiListQuery,
  useCreateKodeTransaksiMutation,
  useUpdateKodeTransaksiMutation,
  useDeleteKodeTransaksiMutation,
  useGetCOAListQuery,
  type KodeTransaksi,
  type CreateKodeTransaksiRequest,
} from "@/services/admin/kode-transaksi.service";

export default function KodeTransaksiPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KodeTransaksi | null>(null);
  const [formData, setFormData] = useState<CreateKodeTransaksiRequest>({
    code: "",
    module: "",
    description: "",
    status: 1,
    debits: [{ coa_id: 0, order: 1 }],
    credits: [{ coa_id: 0, order: 1 }],
  });

  const { data: kodeTransaksiData, isLoading } = useGetKodeTransaksiListQuery({
    page: currentPage,
    paginate: 10,
  });

  const { data: coaData } = useGetCOAListQuery({
    page: 1,
    paginate: 100, // Get more COAs for dropdown
  });

  const [createKodeTransaksi] = useCreateKodeTransaksiMutation();
  const [updateKodeTransaksi] = useUpdateKodeTransaksiMutation();
  const [deleteKodeTransaksi] = useDeleteKodeTransaksiMutation();

  const filteredData = useMemo(() => {
    if (!kodeTransaksiData?.data) return [];
    
    return kodeTransaksiData.data.filter((item) => {
      const matchesSearch = 
        item.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.module.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = 
        filters.status === "all" || 
        String(item.status) === filters.status;
      
      return matchesSearch && matchesStatus;
    });
  }, [kodeTransaksiData?.data, filters]);

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
    setFormData({
      code: "",
      module: "",
      description: "",
      status: 1,
      debits: [{ coa_id: 0, order: 1 }],
      credits: [{ coa_id: 0, order: 1 }],
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: KodeTransaksi) => {
    setSelectedItem(item);
    setFormData({
      code: item.code,
      module: item.module,
      description: item.description,
      status: item.status,
      debits: [{ coa_id: 0, order: 1 }], // Default values since API doesn't return these
      credits: [{ coa_id: 0, order: 1 }],
    });
    setIsEditModalOpen(true);
  };

  const handleDetail = (item: KodeTransaksi) => {
    setSelectedItem(item);
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
        await deleteKodeTransaksi(id).unwrap();
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
        await updateKodeTransaksi({
          id: selectedItem.id,
          data: formData,
        }).unwrap();
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
        setIsEditModalOpen(false);
      } else {
        await createKodeTransaksi(formData).unwrap();
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
        setIsCreateModalOpen(false);
      }
      setSelectedItem(null);
    } catch {
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const addDebitEntry = () => {
    setFormData({
      ...formData,
      debits: [...formData.debits, { coa_id: 0, order: formData.debits.length + 1 }],
    });
  };

  const removeDebitEntry = (index: number) => {
    if (formData.debits.length > 1) {
      setFormData({
        ...formData,
        debits: formData.debits.filter((_, i) => i !== index),
      });
    }
  };

  const addCreditEntry = () => {
    setFormData({
      ...formData,
      credits: [...formData.credits, { coa_id: 0, order: formData.credits.length + 1 }],
    });
  };

  const removeCreditEntry = (index: number) => {
    if (formData.credits.length > 1) {
      setFormData({
        ...formData,
        credits: formData.credits.filter((_, i) => i !== index),
      });
    }
  };

  const updateDebitEntry = (index: number, field: string, value: number | string) => {
    const updatedDebits = [...formData.debits];
    updatedDebits[index] = { ...updatedDebits[index], [field]: value };
    setFormData({ ...formData, debits: updatedDebits });
  };

  const updateCreditEntry = (index: number, field: string, value: number | string) => {
    const updatedCredits = [...formData.credits];
    updatedCredits[index] = { ...updatedCredits[index], [field]: value };
    setFormData({ ...formData, credits: updatedCredits });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kode Transaksi</h1>
        <p className="text-sm text-gray-500">
          Kelola kode transaksi untuk akuntansi
        </p>
      </div>

      {/* Toolbar */}
      <ProdukToolbar
        addButtonLabel="Tambah Kode Transaksi"
        openModal={handleCreate}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onCategoryChange={(status) => setFilters({ ...filters, status })}
        categories={[
          { value: "all", label: "Semua Status" },
          { value: "1", label: "Active" },
          { value: "0", label: "Inactive" },
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
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDetail(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Detail</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Hapus</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Kode Transaksi" : "Tambah Kode Transaksi"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kode</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="module">Module</Label>
                <Input
                  id="module"
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={String(formData.status)}
                  onValueChange={(value) => setFormData({ ...formData, status: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Debits Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Debits</h3>
                <Button type="button" onClick={addDebitEntry} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Debit
                </Button>
              </div>
              {formData.debits.map((debit, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded">
                  <div className="flex-1">
                    <Label>COA</Label>
                    <Select
                      value={String(debit.coa_id)}
                      onValueChange={(value) => updateDebitEntry(index, "coa_id", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih COA" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaData?.data.map((coa) => (
                          <SelectItem key={coa.id} value={String(coa.id)}>
                            {coa.code} - {coa.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={debit.order}
                      onChange={(e) => updateDebitEntry(index, "order", Number(e.target.value))}
                    />
                  </div>
                  {formData.debits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebitEntry(index)}
                      className="text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Credits Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Credits</h3>
                <Button type="button" onClick={addCreditEntry} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Credit
                </Button>
              </div>
              {formData.credits.map((credit, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded">
                  <div className="flex-1">
                    <Label>COA</Label>
                    <Select
                      value={String(credit.coa_id)}
                      onValueChange={(value) => updateCreditEntry(index, "coa_id", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih COA" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaData?.data.map((coa) => (
                          <SelectItem key={coa.id} value={String(coa.id)}>
                            {coa.code} - {coa.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={credit.order}
                      onChange={(e) => updateCreditEntry(index, "order", Number(e.target.value))}
                    />
                  </div>
                  {formData.credits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCreditEntry(index)}
                      className="text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit">
                {selectedItem ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Kode Transaksi</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Kode</Label>
                  <p className="text-sm text-gray-600">{selectedItem.code}</p>
                </div>
                <div>
                  <Label className="font-medium">Module</Label>
                  <p className="text-sm text-gray-600">{selectedItem.module}</p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">Deskripsi</Label>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <Label className="font-medium">Tanggal Dibuat</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedItem.created_at).toLocaleDateString("id-ID")}
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
