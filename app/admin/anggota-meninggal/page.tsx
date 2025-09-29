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
import { 
  useGetAnggotaMeninggalListQuery,
  useCreateAnggotaMeninggalMutation,
  useUpdateAnggotaMeninggalMutation,
  useDeleteAnggotaMeninggalMutation,
  useUpdateAnggotaMeninggalStatusMutation,
  type AnggotaMeninggal,
  type CreateAnggotaMeninggalRequest
} from "@/services/admin/anggota-meninggal.service";
import { useGetAnggotaListQuery } from "@/services/koperasi-service/anggota.service";
import { Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function AnggotaMeninggalPage() {
  // State management
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnggotaMeninggal | null>(null);
  const [formData, setFormData] = useState<CreateAnggotaMeninggalRequest>({
    anggota_id: 0,
    deceased_at: "",
    description: "",
    status: 0,
  });

  // API calls
  const { data: anggotaMeninggalData, isLoading } = useGetAnggotaMeninggalListQuery({
    page: 1,
    paginate: 100,
  });
  const { data: anggotaData } = useGetAnggotaListQuery({
    page: 1,
    paginate: 100,
  });

  // Mutations
  const [createAnggotaMeninggal] = useCreateAnggotaMeninggalMutation();
  const [updateAnggotaMeninggal] = useUpdateAnggotaMeninggalMutation();
  const [deleteAnggotaMeninggal] = useDeleteAnggotaMeninggalMutation();
  const [updateStatus] = useUpdateAnggotaMeninggalStatusMutation();

  // Data processing
  const anggotaMeninggalList = useMemo(() => anggotaMeninggalData?.data || [], [anggotaMeninggalData?.data]);
  const anggotaList = useMemo(() => anggotaData?.data || [], [anggotaData?.data]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = anggotaMeninggalList;

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(
        (item) => String(item.status) === filters.status
      );
    }

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.anggota_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.anggota_email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.anggota_phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.anggota_nik?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filtered;
  }, [anggotaMeninggalList, filters.status, filters.search]);

  // Helper functions
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Event handlers
  const handleCreate = () => {
    setFormData({
      anggota_id: 0,
      deceased_at: "",
      description: "",
      status: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: AnggotaMeninggal) => {
    setSelectedItem(item);
    setFormData({
      anggota_id: item.anggota_id,
      deceased_at: item.deceased_at.split('T')[0], // Convert to YYYY-MM-DD format
      description: item.description || "",
      status: item.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDetail = (item: AnggotaMeninggal) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data anggota meninggal akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteAnggotaMeninggal(id).unwrap();
        Swal.fire("Berhasil!", "Data anggota meninggal telah dihapus.", "success");
    } catch {
      Swal.fire("Error!", "Gagal menghapus data.", "error");
    }
    }
  };

  const handleStatusUpdate = async (id: number, status: number) => {
    try {
      await updateStatus({ id, status }).unwrap();
      Swal.fire("Berhasil!", "Status telah diperbarui.", "success");
    } catch {
      Swal.fire("Error!", "Gagal memperbarui status.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreateModalOpen) {
        await createAnggotaMeninggal(formData).unwrap();
        Swal.fire("Berhasil!", "Data anggota meninggal telah ditambahkan.", "success");
      } else {
        await updateAnggotaMeninggal({ id: selectedItem!.id, payload: formData }).unwrap();
        Swal.fire("Berhasil!", "Data anggota meninggal telah diperbarui.", "success");
      }
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        anggota_id: 0,
        deceased_at: "",
        description: "",
        status: 0,
      });
    } catch {
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Anggota Meninggal</h1>
        <p className="text-sm text-gray-500">
          Kelola data anggota yang telah meninggal
        </p>
      </div>

      {/* Toolbar */}
      <ProdukToolbar
        addButtonLabel="Tambah Anggota Meninggal"
        openModal={handleCreate}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onCategoryChange={(status) => setFilters({ ...filters, status })}
        categories={[
          { value: "all", label: "Semua Status" },
          { value: "0", label: "Pending" },
          { value: "1", label: "Approved" },
          { value: "2", label: "Rejected" },
        ]}
        initialSearch={filters.search}
        initialCategory={filters.status}
      />

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Meninggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validasi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* Aksi Column - Detail, Edit, Delete */}
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
                        {item.anggota_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.anggota_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.anggota_phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.anggota_nik}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.deceased_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* Validasi Column - Approve, Reject (only for pending status) */}
                        {item.status === 0 ? (
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(item.id, 1)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(item.id, 2)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reject</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
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
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? "Tambah Anggota Meninggal" : "Edit Anggota Meninggal"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="anggota_id">Anggota</Label>
              <Select
                value={formData.anggota_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, anggota_id: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih anggota" />
                </SelectTrigger>
                <SelectContent>
                  {anggotaList.map((anggota) => (
                    <SelectItem key={anggota.id} value={anggota.id.toString()}>
                      {anggota.name} - {anggota.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deceased_at">Tanggal Meninggal</Label>
              <Input
                id="deceased_at"
                type="date"
                value={formData.deceased_at}
                onChange={(e) => setFormData({ ...formData, deceased_at: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi (opsional)"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) => setFormData({ ...formData, status: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="1">Approved</SelectItem>
                  <SelectItem value="2">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit">
                {isCreateModalOpen ? "Tambah" : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Anggota Meninggal</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama</Label>
                  <p className="text-sm">{selectedItem.anggota_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedItem.anggota_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedItem.anggota_phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">NIK</Label>
                  <p className="text-sm">{selectedItem.anggota_nik}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Meninggal</Label>
                  <p className="text-sm">{formatDate(selectedItem.deceased_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>
              {selectedItem.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
