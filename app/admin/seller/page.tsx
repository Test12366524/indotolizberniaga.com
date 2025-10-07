"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import SellerDetailModal from "@/components/form-modal/admin/seller-detail-modal";

type RatingFilter = "all" | "4" | "3" | "2" | "1" | "0";

export default function SellerPage() {
  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    rating: RatingFilter;
  }>({
    search: "",
    status: "all",
    rating: "all",
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
      const s = filters.search.toLowerCase();

      const matchesSearch =
        seller.name.toLowerCase().includes(s) ||
        seller.email.toLowerCase().includes(s) ||
        seller.phone.toLowerCase().includes(s) ||
        seller.anggota_reference.toLowerCase().includes(s) ||
        seller.shop.name.toLowerCase().includes(s);

      const matchesStatus =
        filters.status === "all" ||
        String(seller.shop.status) === filters.status;

      const ratingMin =
        filters.rating === "all" ? -Infinity : Number(filters.rating);

      // ✅ pastikan numeric
      const sellerRating = Number(seller.shop.rating ?? 0);
      const matchesRating = sellerRating >= ratingMin;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [sellerData?.data, filters]);

  const getStatusBadge = (status: number) =>
    status === 1 ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Nonaktif</Badge>
    );

  const getAnggotaStatusBadge = (status: number) =>
    status === 1 ? (
      <Badge className="bg-blue-100 text-blue-800">Anggota</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Non-Anggota</Badge>
    );

  const handleDetail = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="p-6 space-y-6">
      {/* Filters - compact horizontal */}
      <Card>
        <CardContent>
          <div
            className="
              grid gap-x-3 gap-y-2 items-end
              grid-cols-1
              sm:[grid-template-columns:minmax(220px,1fr)_180px_180px_auto]
            "
          >
            {/* Search */}
            <div>
              <Input
                id="search"
                className="h-9 text-sm"
                placeholder="Cari nama, email, phone, toko..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((f) => ({ ...f, status: value }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <Select
                value={filters.rating}
                onValueChange={(value: RatingFilter) =>
                  setFilters((f) => ({ ...f, rating: value }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Rating</SelectItem>

                  {[5, 4, 3, 2, 1, 0].map((val) => (
                    <SelectItem key={val} value={val.toString()}>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < val
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm"> {val}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            <div className="justify-self-start sm:justify-self-end">
              <Button
                variant="destructive"
                className="h-9 text-sm w-[92px]"
                onClick={() =>
                  setFilters({ search: "", status: "all", rating: "all" })
                }
              >
                Reset
              </Button>
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!sellerData.next_page_url}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal (file terpisah) */}
      <SellerDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        seller={selectedSeller}
      />
    </div>
  );
}
