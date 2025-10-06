"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Seller } from "@/services/admin/seller.service";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seller: Seller | null;
};

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

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SellerDetailModal({
  open,
  onOpenChange,
  seller,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Seller</DialogTitle>
        </DialogHeader>

        {seller && (
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Informasi Seller</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="font-medium">Nama</Label>
                    <p className="text-sm text-gray-600">{seller.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Referensi Anggota</Label>
                    <p className="text-sm text-gray-600">
                      {seller.anggota_reference}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Status Anggota</Label>
                    <div className="mt-1">
                      {getAnggotaStatusBadge(seller.anggota_status)}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone</Label>
                    <p className="text-sm text-gray-600">{seller.phone}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Email Verified</Label>
                    <p className="text-sm text-gray-600">
                      {seller.email_verified_at
                        ? formatDateTime(seller.email_verified_at)
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
                    <p className="text-sm text-gray-600">{seller.shop.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Slug</Label>
                    <p className="text-sm text-gray-600">{seller.shop.slug}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Alamat</Label>
                    <p className="text-sm text-gray-600">
                      {seller.shop.address}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Deskripsi</Label>
                    <p className="text-sm text-gray-600">
                      {seller.shop.description}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Status Toko</Label>
                    <div className="mt-1">
                      {getStatusBadge(seller.shop.status)}
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
                    <p className="text-sm text-gray-600">{seller.shop.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Toko</Label>
                    <p className="text-sm text-gray-600">{seller.shop.phone}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Koordinat</Label>
                    <p className="text-sm text-gray-600">
                      {seller.shop.latitude}, {seller.shop.longitude}
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
                        {seller.shop.rating}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Total Review</Label>
                    <p className="text-sm text-gray-600">
                      {seller.shop.total_reviews} review
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Tanggal Dibuat</Label>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(seller.shop.created_at)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Terakhir Diupdate</Label>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(seller.shop.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            {seller.shop.media && seller.shop.media.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Media Toko</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seller.shop.media.map((media) => (
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
  );
}