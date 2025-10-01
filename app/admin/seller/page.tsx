"use client";

import { useState, useMemo } from "react";
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
import { Star, Phone, Mail } from "lucide-react";
import {
  useGetSellerListQuery,
  type Seller,
} from "@/services/admin/seller.service";
import ActionsGroup from "@/components/admin-components/actions-group";

export default function SellerPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const { data: sellerData, isLoading } = useGetSellerListQuery({
    page: currentPage,
    paginate: 10,
  });

  const filteredData = useMemo(() => {
    if (!sellerData?.data) return [];

    return sellerData.data.filter((seller) => {
      const matchesSearch =
        seller.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        seller.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        seller.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
        seller.anggota_reference
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        seller.shop.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        String(seller.shop.status) === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [sellerData?.data, filters]);

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Nonaktif</Badge>
    );
  };

  const getAnggotaStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-blue-100 text-blue-800">Anggota</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Non-Anggota</Badge>
    );
  };

  const handleDetail = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Seller</h1>
        <p className="text-sm text-gray-500">Kelola data seller marketplace</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari nama, email, phone, toko..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="status">Status Toko</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toko
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
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
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Loading...</div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionsGroup
                          handleDetail={() => handleDetail(seller)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {seller.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {seller.anggota_reference}
                          </div>
                          <div className="mt-1">
                            {getAnggotaStatusBadge(seller.anggota_status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {seller.shop.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {seller.shop.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {seller.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {seller.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">
                            {seller.shop.rating}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({seller.shop.total_reviews} review)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(seller.shop.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(seller.created_at)}
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
      {sellerData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {sellerData.from} sampai {sellerData.to} dari{" "}
            {sellerData.total} data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!sellerData.prev_page_url}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-700">
              Halaman {sellerData.current_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!sellerData.next_page_url}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Seller</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Seller Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi Seller</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Nama</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.name}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Referensi Anggota</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.anggota_reference}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Status Anggota</Label>
                      <div className="mt-1">
                        {getAnggotaStatusBadge(selectedSeller.anggota_status)}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.email}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Phone</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Email Verified</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.email_verified_at
                          ? formatDateTime(selectedSeller.email_verified_at)
                          : "Belum diverifikasi"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi Toko</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Nama Toko</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.name}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Slug</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.slug}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Alamat</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.address}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Deskripsi</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.description}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Status Toko</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedSeller.shop.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Kontak Toko</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Email Toko</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.email}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Phone Toko</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Koordinat</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.latitude},{" "}
                        {selectedSeller.shop.longitude}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Rating & Review</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Rating</Label>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {selectedSeller.shop.rating}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Total Review</Label>
                      <p className="text-sm text-gray-600">
                        {selectedSeller.shop.total_reviews} review
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Tanggal Dibuat</Label>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(selectedSeller.shop.created_at)}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Terakhir Diupdate</Label>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(selectedSeller.shop.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media */}
              {selectedSeller.shop.media &&
                selectedSeller.shop.media.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Media Toko</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSeller.shop.media.map((media) => (
                        <div key={media.id} className="border rounded-lg p-4">
                          <div className="space-y-2">
                            <div>
                              <Label className="font-medium">Tipe</Label>
                              <p className="text-sm text-gray-600 capitalize">
                                {media.collection_name}
                              </p>
                            </div>
                            <div>
                              <Label className="font-medium">File</Label>
                              <p className="text-sm text-gray-600">
                                {media.file_name}
                              </p>
                            </div>
                            <div>
                              <Label className="font-medium">Size</Label>
                              <p className="text-sm text-gray-600">
                                {(media.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            {media.original_url && (
                              <div>
                                <Label className="font-medium">Preview</Label>
                                <div className="mt-2">
                                  <img
                                    src={media.original_url}
                                    alt={media.name}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
