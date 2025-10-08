"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import type { Seller } from "@/services/admin/seller.service";
import { useUpdateTokoStatusMutation } from "@/services/admin/toko.service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seller: Seller | null;
  /** dipanggil setelah update status sukses */
  onSuccess?: () => void;
};

export default function SellerStatusModal({
  open,
  onOpenChange,
  seller,
  onSuccess,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<"1" | "0">("1");
  const [updateTokoStatus, { isLoading }] = useUpdateTokoStatusMutation();

  useEffect(() => {
    if (seller) {
      const s = Number(seller.shop.status) === 1 ? "1" : "0";
      setSelectedStatus(s);
    }
  }, [seller]);

  const title = useMemo(
    () => (seller ? `Ubah Status • ${seller.shop.name}` : "Ubah Status"),
    [seller]
  );

  const handleSave = async () => {
    if (!seller) return;
    try {
      await updateTokoStatus({
        slug: seller.shop.slug,
        status: selectedStatus === "1",
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Status toko berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      // 👉 panggil callback agar parent melakukan refetch
      onSuccess?.();

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat memperbarui status. Coba lagi.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v: "1" | "0") => setSelectedStatus(v)}
              disabled={!seller || isLoading}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aktif</SelectItem>
                <SelectItem value="0">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !seller}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}